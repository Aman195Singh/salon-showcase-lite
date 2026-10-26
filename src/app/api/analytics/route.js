import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

/**
 * POST /api/analytics
 * Records a page view or CTA click event.
 * No personal data is collected.
 */
export async function POST(request) {
  try {
    const { event_type, page_path, referrer } = await request.json();

    if (!event_type || !page_path) {
      return NextResponse.json({ error: "Missing fields." }, { status: 400 });
    }

    // Only allow known event types
    const allowed = ["page_view", "cta_click"];
    if (!allowed.includes(event_type)) {
      return NextResponse.json({ error: "Invalid event type." }, { status: 400 });
    }

    await supabaseServer.from("analytics_events").insert({
      event_type,
      page_path: page_path.substring(0, 500),
      referrer: referrer?.substring(0, 500) || null,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
