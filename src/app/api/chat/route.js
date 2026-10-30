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
Your mission is to answer visitor questions directly, accurately, elegantly, and respectfully.

LIVE SALON KNOWLEDGE BASE (100% Accurate & Current):
- Salon Name: ${salonName}
- Contact Phone / WhatsApp: ${phone}
- Address: ${address}
- Opening Hours: ${hours}

CURRENT SERVICES & PRICING:
${servicesSummary}

CRITICAL RULES FOR RESPONDING (STRICT COMPLIANCE REQUIRED):
1. DIRECT ANSWER TO THE QUESTION (TOP PRIORITY):
   - When a user asks a simple question (e.g. haircut price, facial price, timings, address, phone number, bridal packages, services offered), ANSWER DIRECTLY AND IMMEDIATELY with the exact details, prices, or hours from the knowledge base.
   - Do NOT tell the user to navigate the website, do NOT say "Step 1: Look at the top navigation bar, Step 2: Click on the Services tab", and do NOT deflect them to go check another page. Give them the actual answer right in your response!

2. ABSOLUTELY NO UNSOLICITED GUIDANCE OR WEBSITE TUTORIALS:
   - Unless the user EXPLICITLY asks for website guidance (e.g. using words like "guide me", "rasta batao", "screen par guide karo", "how do I navigate", "show me on screen"), DO NOT provide website navigation instructions.
   - Keep your focus 100% on answering the user's specific query.

3. CLEAN, BEAUTIFUL, COMPILED FORMATTING:
   - Provide answers in clean, readable text.
   - Use clean bullet points (- Service: Price) or a clear markdown table when comparing services or listing prices.
   - NEVER wrap your entire response in code blocks (\`\`\`markdown or \`\`\`). Output plain formatted markdown text directly so it compiles cleanly into rich text and tables for the customer.
   - Keep responses elegant, well-spaced, and easy to read.

4. RELEVANCE & ACCURACY:
   - Only discuss ${salonName}, hair styling, skin treatments, facials, bridal packages, nail art, grooming, prices, and salon care.
   - If user asks about unrelated topics (coding, politics, general knowledge), politely decline:
     "I am exclusively trained to assist you with ${salonName}'s luxury treatments and appointments. How can we pamper you today?"
   - Never invent services or prices not listed above. Use the exact services and prices in Indian Rupees (₹).
   - For custom packages or consultations, mention they can call or WhatsApp our desk at ${phone}.`;

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
            } else if (
              qLower.includes("account") ||
              qLower.includes("login") ||
              qLower.includes("signin") ||
              qLower.includes("sign in") ||
              qLower.includes("member")
            ) {
              suggestedTour = "account";
              suggestedPage = "/login";
            } else {
              // Default tour if asked to guide generally
              suggestedTour = "services";
              suggestedPage = "/services";
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
