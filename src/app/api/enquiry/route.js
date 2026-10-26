import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// Simple in-memory rate limiter (Max 5 submissions per 10 minutes per IP)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_SUBMISSIONS_PER_WINDOW = 5;

function isRateLimited(ip) {
  const now = Date.now();

  // Clean up expired entries if map grows large to prevent memory leaks
  if (rateLimitMap.size > 500) {
    const cutoff = now - RATE_LIMIT_WINDOW_MS;
    for (const [key, val] of rateLimitMap.entries()) {
      if (val.startTime < cutoff) {
        rateLimitMap.delete(key);
      }
    }
  }

  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.startTime > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, startTime: now });
    return false;
  }
  if (entry.count >= MAX_SUBMISSIONS_PER_WINDOW) {
    return true;
  }
  entry.count += 1;
  return false;
}

/**
 * POST /api/enquiry
 * Accepts contact form submissions from the public Contact page.
 * Saves to the Supabase 'enquiries' table.
 */
export async function POST(request) {
  try {
    const forwarded = request.headers.get("x-forwarded-for");
    const clientIp = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: "Too many submissions from your connection. Please wait a few minutes before trying again." },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Honeypot check: if bot filled hidden field, drop silently without DB insert
    if (body._hp_company && body._hp_company.trim().length > 0) {
      return NextResponse.json({ success: true, message: "Enquiry submitted successfully." });
    }

    const { name, phone, email, message, userId } = body;

    // Server-side validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    if ((!phone || phone.trim().length === 0) && (!email || email.trim().length === 0)) {
      return NextResponse.json({ error: "Please provide a phone number or email." }, { status: 400 });
    }
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
    }
    // Limit lengths
    if (name.length > 200 || (phone && phone.length > 30) || (email && email.length > 200) || message.length > 5000) {
      return NextResponse.json({ error: "Input too long." }, { status: 400 });
    }

    const normalizedEmail = email && typeof email === "string" ? email.trim().toLowerCase() : null;
    const safeUserId =
      typeof userId === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId.trim())
        ? userId.trim()
        : null;

    // Save to Supabase
    const { error } = await supabaseServer.from("enquiries").insert({
      name: name.trim(),
      phone: phone?.trim() || null,
      email: normalizedEmail,
      message: message.trim(),
      status: "New",
      user_id: safeUserId,
    });

    if (error) {
      console.error("[Enquiry Error]", error);
      return NextResponse.json({ error: "Failed to save enquiry." }, { status: 500 });
    }

    // Also log as analytics event
    await supabaseServer.from("analytics_events").insert({
      event_type: "enquiry_submit",
      page_path: "/contact",
    });

    return NextResponse.json({ success: true, message: "Enquiry submitted successfully." });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
