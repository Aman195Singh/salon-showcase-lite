import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { DEFAULT_SERVICES, DEFAULT_CONTENT } from "@/lib/content";

/**
 * Checks if the user explicitly asked for website guidance / tour
 */
function isExplicitGuidanceRequest(text) {
  if (!text) return false;
  const t = text.toLowerCase();
  const guidanceKeywords = [
    "guide me",
    "guide",
    "tour",
    "walkthrough",
    "rasta",
    "rasta batao",
    "rasta dikhao",
    "screen par guide",
    "screen par dikhao",
    "highlight karo",
    "kaise navigate",
    "navigate",
    "take a tour",
    "step by step guide",
    "dikhao kahan hai",
    "spotlight",
    "on screen guide",
    "kahan se dekhun",
  ];
  return guidanceKeywords.some((k) => t.includes(k));
}

/**
 * POST /api/chat
 * Ultra-Fast AI Concierge powered by Groq Cloud
 * with fallback and clean formatting.
 */
export async function POST(request) {
  try {
    const { message, sessionId, currentPage = "/" } = await request.json();

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    const n8nWebhookUrl = process.env.N8N_CHATBOT_WEBHOOK_URL;

    // 1. If Groq API Key is present, run the Ultra-Fast LLM Brain!
    if (groqApiKey && groqApiKey.trim().length > 0) {
      try {
        // Fetch live services from Supabase for real-time accurate pricing
        let servicesData = [];
        try {
          const { data } = await supabaseServer
            .from("services")
            .select("name, category, price, duration, description")
            .eq("is_active", true)
            .order("sort_order", { ascending: true });

          if (data && data.length > 0) {
            servicesData = data;
          } else {
            servicesData = DEFAULT_SERVICES;
          }
        } catch {
          servicesData = DEFAULT_SERVICES;
        }

        // Fetch live salon general info
        let salonName = "Aura Luxury Salon & Spa";
        let phone = "+91 98765 43210";
        let hours = "Mon - Sat: 10:00 AM - 8:00 PM | Sun: 11:00 AM - 6:00 PM";
        let address = "Luxury Boulevard, Near City Centre";

        try {
          const { data } = await supabaseServer
            .from("site_content")
            .select("section, content")
            .eq("section", "general")
            .single();

          if (data?.content) {
            salonName = data.content.salonName || salonName;
            phone = data.content.phone || phone;
            address = data.content.address || address;
            if (Array.isArray(data.content.hours)) {
              hours = data.content.hours.map((h) => `${h.day}: ${h.time}`).join(" | ");
            }
          }
        } catch {
          // Use defaults
        }

        const servicesSummary = servicesData
          .map(
            (s) =>
              `- [${s.category}] ${s.name}: ${s.price} (${s.duration})${
                s.description ? ` — ${s.description}` : ""
              }`
          )
          .join("\n");

        const systemPrompt = `You are the Senior AI Concierge for "${salonName}".
Your mission is to answer visitor questions directly, accurately, elegantly, and respectfully.

CURRENT USER CONTEXT:
- The user is currently browsing on page: "${currentPage || "/"}"

LIVE SALON KNOWLEDGE BASE (100% Accurate & Current):
- Salon Name: ${salonName}
- Contact Phone / WhatsApp: ${phone}
- Address: ${address}
- Opening Hours: ${hours}

CURRENT SERVICES & PRICING:
${servicesSummary}

WEBSITE ARCHITECTURE & EXACT FEATURE LOCATIONS (CRITICAL):
1. HEADER NAVIGATION (Available on all pages):
   - Brand Logo & "Home" (#nav-home / /): Returns to the main Landing / Home Showcase page from ANY page.
   - "Services" (#nav-services / /services): Full treatments menu with pricing and duration.
   - "About" (#nav-about / /about): Salon founding story, master stylists, and clinical hygiene protocols.
   - "Gallery" (#nav-gallery / /gallery): High-resolution client transformation photos with category filter tabs and lightbox.
   - "Contact" (#nav-contact / /contact): Direct phone, WhatsApp chat, opening hours, Google Maps directions, and booking enquiry form.
   - Top-Right Header Icon:
     * When Signed In: User's Profile Avatar / initials (#nav-profile). Clicking it opens the account dropdown with link to "My Account & Security" (/account) and Sign Out.
     * When Not Signed In: "Sign In" button (#nav-signin / /login).
     * For Salon Owner/Admin: "Admin" button (#nav-admin / /dashboard).

2. MEMBER ACCOUNT & PROFILE SETTINGS (/account):
   - Where is Profile Icon: Located at top-right of header (#nav-profile).
   - How to change Profile Picture / Avatar: Go to /account -> select "Profile Info" tab (#account-tab-profile) -> click upload photo.
   - How to change Password: Go to /account -> select "Change Password" tab (#account-tab-security) -> enter new password and save.
   - How to check Booking Enquiries: Go to /account -> select "My Enquiries" tab (#account-tab-history) to track all submitted appointment requests and statuses.
   - For Salon Owners: Can manage all customer enquiries in Admin Dashboard (/dashboard/enquiries).

3. EXACT ANSWERS FOR COMMON NAVIGATION & ACCOUNT QUESTIONS:
   - If user asks where Profile Icon is: Explain that it is in the top-right corner of the header navigation bar.
   - If user asks where/how to change password: Tell them to go to /account and use the "Change Password" tab.
   - If user asks where/how to change profile photo/avatar: Tell them to go to /account and use the "Profile Info" tab.
   - If user asks where to check inquiries: Tell them to check the "My Enquiries" tab on their /account page (or /dashboard/enquiries for owner).
   - If user asks where Landing Page / Home is: Tell them to click "Home" or the salon brand logo at the top-left of the header.

CRITICAL RULES FOR RESPONDING (STRICT COMPLIANCE REQUIRED):
1. DIRECT ANSWER TO THE QUESTION (TOP PRIORITY):
   - When a user asks a simple question (e.g. prices, timings, location, where profile icon is, how to change password, where is home page), ANSWER DIRECTLY AND IMMEDIATELY with the exact details.
   - Do NOT give unsolicited step-by-step navigation tutorials unless the user EXPLICITLY asks to be guided ("guide me", "rasta batao", "screen par guide karo", "show me on screen").

2. CLEAN, BEAUTIFUL, COMPILED FORMATTING:
   - Provide answers in clean, readable text with bullet points (- Service: Price) or markdown tables.
   - Never wrap entire responses in code blocks (\`\`\`markdown). Output plain structured markdown.

3. RELEVANCE & ACCURACY:
   - Only discuss ${salonName}, hair styling, skin treatments, facials, bridal packages, nail art, grooming, prices, website features, and salon care.
   - For custom packages or consultations, mention phone or WhatsApp at ${phone}.`;

        let groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqApiKey.trim()}`,
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-120b",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: message.trim() },
            ],
            temperature: 0.2,
            max_tokens: 800,
          }),
        });

        let groqData = null;
        if (groqResponse.ok) {
          groqData = await groqResponse.json();
        }

        // Fast fallback to qwen/qwen3.8-27b if gpt-oss-120b returns empty content or fails
        if (!groqData?.choices?.[0]?.message?.content) {
          const fallbackRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${groqApiKey.trim()}`,
            },
            body: JSON.stringify({
              model: "qwen/qwen3.8-27b",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message.trim() },
              ],
              temperature: 0.2,
              max_tokens: 500,
            }),
          });
          if (fallbackRes.ok) {
            groqData = await fallbackRes.json();
          }
        }

        if (groqData?.choices?.[0]?.message?.content) {
          const replyText = groqData.choices[0].message.content.trim();
          const lower = replyText.toLowerCase();
          const qLower = message.toLowerCase();

          const showContactLink =
            lower.includes("contact page") ||
            lower.includes("/contact") ||
            lower.includes("enquiry") ||
            lower.includes("whatsapp") ||
            lower.includes("reach out");

          // Tour / Spotlight is ONLY suggested if the user explicitly asked for guidance!
          let suggestedTour = null;
          let suggestedPage = null;

          if (isExplicitGuidanceRequest(message)) {
            if (
              qLower.includes("home") ||
              qLower.includes("landing") ||
              qLower.includes("main page") ||
              qLower.includes("front page")
            ) {
              suggestedTour = "home";
              suggestedPage = "/";
            } else if (
              qLower.includes("password") ||
              qLower.includes("change pass") ||
              qLower.includes("reset pass")
            ) {
              suggestedTour = "password";
              suggestedPage = "/account";
            } else if (
              qLower.includes("inquir") ||
              qLower.includes("enquir")
            ) {
              suggestedTour = "inquiries";
              suggestedPage = "/account";
            } else if (
              qLower.includes("profile") ||
              qLower.includes("avatar") ||
              qLower.includes("account") ||
              qLower.includes("login") ||
              qLower.includes("signin") ||
              qLower.includes("sign in") ||
              qLower.includes("member")
            ) {
              suggestedTour = "profile";
              suggestedPage = "/account";
            } else if (
              qLower.includes("gallery") ||
              qLower.includes("photo") ||
              qLower.includes("look") ||
              qLower.includes("transformation")
            ) {
              suggestedTour = "gallery";
              suggestedPage = "/gallery";
            } else if (
              qLower.includes("book") ||
              qLower.includes("appoint") ||
              qLower.includes("reserve") ||
              qLower.includes("slot")
            ) {
              suggestedTour = "booking";
              suggestedPage = "/contact";
            } else if (
              qLower.includes("service") ||
              qLower.includes("rate") ||
              qLower.includes("price") ||
              qLower.includes("haircut") ||
              qLower.includes("facial") ||
              qLower.includes("spa") ||
              qLower.includes("menu")
            ) {
              suggestedTour = "services";
              suggestedPage = "/services";
            } else if (
              qLower.includes("contact") ||
              qLower.includes("phone") ||
              qLower.includes("whatsapp") ||
              qLower.includes("location") ||
              qLower.includes("address") ||
              qLower.includes("map") ||
              qLower.includes("hour") ||
              qLower.includes("timing") ||
              qLower.includes("where")
            ) {
              suggestedTour = "contact";
              suggestedPage = "/contact";
            } else if (
              qLower.includes("about") ||
              qLower.includes("story") ||
              qLower.includes("hygiene") ||
              qLower.includes("safety") ||
              qLower.includes("stylist")
            ) {
              suggestedTour = "about";
              suggestedPage = "/about";
            } else {
              // Respect current page if asked to guide generally
              if (currentPage === "/gallery") {
                suggestedTour = "gallery";
                suggestedPage = "/gallery";
              } else if (currentPage === "/contact") {
                suggestedTour = "contact";
                suggestedPage = "/contact";
              } else if (currentPage === "/about") {
                suggestedTour = "about";
                suggestedPage = "/about";
              } else if (currentPage === "/account") {
                suggestedTour = "profile";
                suggestedPage = "/account";
              } else if (currentPage === "/") {
                suggestedTour = "home";
                suggestedPage = "/";
              } else {
                suggestedTour = "services";
                suggestedPage = "/services";
              }
            }
          }

          return NextResponse.json({
            reply: replyText,
            showContactLink,
            suggestedTour,
            suggestedPage,
          });
        } else {
          console.error("[Groq API Error Status]:", groqResponse?.status);
        }
      } catch (err) {
        console.error("[Groq Processing Error]:", err);
      }
    }

    // 2. Fallback to n8n Webhook if configured
    if (n8nWebhookUrl && n8nWebhookUrl.trim().length > 0) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const response = await fetch(n8nWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: message.trim(),
            sessionId: sessionId || "default_session",
            timestamp: new Date().toISOString(),
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          let replyText = "";
          let showContactLink = false;

          if (typeof data === "string") {
            replyText = data;
          } else if (Array.isArray(data) && data.length > 0) {
            replyText = data[0].output || data[0].reply || data[0].text || "";
            showContactLink = Boolean(data[0].showContactLink);
          } else if (typeof data === "object" && data !== null) {
            replyText = data.output || data.reply || data.text || data.message || "";
            showContactLink = Boolean(data.showContactLink);
          }

          if (replyText) {
            const lower = replyText.toLowerCase();
            if (lower.includes("contact page") || lower.includes("enquiry")) {
              showContactLink = true;
            }
            return NextResponse.json({ reply: replyText, showContactLink });
          }
        }
      } catch (n8nErr) {
        console.warn("[n8n Fallback Error]:", n8nErr.message);
      }
    }

    // 3. Graceful fallback when both are unavailable or offline
    return NextResponse.json({
      reply:
        "I don't have the exact answer for that question right now, but our salon team is happy to help! You can reach us directly via phone or send an enquiry on our Contact page.",
      showContactLink: true,
    });
  } catch (error) {
    console.error("[Chatbot API Critical Error]:", error);
    return NextResponse.json({ error: "Failed to process chat query." }, { status: 500 });
  }
}
