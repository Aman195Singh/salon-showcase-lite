import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { DEFAULT_SERVICES, DEFAULT_CONTENT } from "@/lib/content";

/**
 * POST /api/chat
 * Ultra-Fast AI Concierge powered by Groq Cloud (llama-3.3-70b-versatile)
 * with n8n fallback and automatic Contact page CTA.
 */
export async function POST(request) {
  try {
    const { message, sessionId } = await request.json();

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
Your mission is to welcome visitors, answer inquiries, guide them through website features, and promote ${salonName} with an elegant, warm, respectful, and luxurious tone.

LIVE SALON KNOWLEDGE BASE (100% Accurate & Current):
- Salon Name: ${salonName}
- Contact Phone / WhatsApp: ${phone}
- Address: ${address}
- Opening Hours: ${hours}

CURRENT SERVICES & PRICING:
${servicesSummary}

STRICT BUSINESS GUARDRAILS (CRITICAL):
1. RELEVANCE: You must ONLY talk about ${salonName}, hair styling, skin treatments, facials, bridal packages, nail art, men's grooming, prices, policies, and website navigation.
2. OUT-OF-SCOPE REJECTION: If a user asks about anything unrelated to our salon (e.g., coding, programming, mathematics, general world news, politics, history, other businesses or random chit-chat), POLITELY DECLINE and redirect them:
   "I am exclusively trained to assist you with ${salonName}'s luxury treatments, appointments, and website navigation. How can we pamper you today?"
3. NEVER INVENT OR HALLUCINATE: Never make up discounts, packages, or services that are not in the list above. Always use the exact service names and prices provided.
4. BRAND PROMOTION: Always emphasize our clinical hygiene standards, certified master stylists, and 100% organic/premium international formulations.
5. CONCISE & POLITE: Keep answers clear, courteous, and easy to read (2-4 sentences max unless detailed menu is requested).

WEBSITE NAVIGATION ASSISTANCE:
- Services & Prices: Advise them to check the Services page (/services).
- Photo Gallery: Advise them to view real transformations on the Gallery page (/gallery).
- Story & Standards: Advise them to read our philosophy on the About page (/about).
- Bookings / Inquiries: Advise them to submit an enquiry on the Contact page (/contact) or contact us via WhatsApp.

SPECIAL FALLBACK RULE:
If a user asks for a customized bridal package, personalized hair consultation, or specific appointment booking, answer gracefully and state:
"For this bespoke requirement, please submit an enquiry on our Contact page or reach out directly on WhatsApp so our master stylist can assist you personally."`;

        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
            max_tokens: 450,
          }),
        });

        if (groqResponse.ok) {
          const groqData = await groqResponse.json();
          const replyText =
            groqData.choices?.[0]?.message?.content ||
            "I am happy to assist you with our salon services! You can also reach our team directly.";

          const lower = replyText.toLowerCase();
          const showContactLink =
            lower.includes("contact page") ||
            lower.includes("/contact") ||
            lower.includes("enquiry") ||
            lower.includes("whatsapp") ||
            lower.includes("reach out");

          return NextResponse.json({
            reply: replyText,
            showContactLink,
          });
        } else {
          console.error("[Groq API Error Status]:", groqResponse.status);
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
