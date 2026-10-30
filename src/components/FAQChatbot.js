"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  HiOutlineChatAlt2,
  HiOutlineX,
  HiOutlinePaperAirplane,
  HiOutlineSparkles,
  HiOutlineQuestionMarkCircle,
} from "react-icons/hi";
import { DEFAULT_FAQS } from "@/lib/content";
import { supabase } from "@/lib/supabase";
import { useTour } from "@/context/TourContext";
import styles from "./FAQChatbot.module.css";

const QUICK_QUESTIONS = [
  "What are your popular services & prices?",
  "What are your opening hours?",
  "How can I book an appointment?",
  "Where is the salon located?",
  "Do you offer bridal & groom makeover packages?",
  "Tell me about salon hygiene standards",
  "🎯 Take an interactive screen tour",
];

/**
 * Checks if the user explicitly asked for website guidance / tour
 */
function isExplicitGuidance(text) {
  if (!text) return false;
  const t = text.toLowerCase();
  const triggers = [
    "guide",
    "guide me",
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
    "take an interactive screen tour",
    "step by step guide",
    "dikhao kahan hai",
    "spotlight",
    "kahan se dekhun",
  ];
  return triggers.some((k) => t.includes(k));
}

function parseInline(text) {
  if (!text) return null;

  // Tokenize bold, italic, inline code, links
  const tokenRegex = /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*]+\*|_[^_]+_)/g;
  const parts = text.split(tokenRegex);

  return parts.filter(Boolean).map((part, index) => {
    if (
      (part.startsWith("**") && part.endsWith("**")) ||
      (part.startsWith("__") && part.endsWith("__"))
    ) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index} className={styles.inlineCode}>
          {part.slice(1, -1)}
        </code>
      );
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          className={styles.inlineLink}
          target={linkMatch[2].startsWith("http") ? "_blank" : undefined}
          rel={linkMatch[2].startsWith("http") ? "noopener noreferrer" : undefined}
        >
          {linkMatch[1]}
        </a>
      );
    }
    if (
      (part.startsWith("*") && part.endsWith("*")) ||
      (part.startsWith("_") && part.endsWith("_"))
    ) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return <span key={index}>{part}</span>;
  });
}

/**
 * Rich Formatted Message & Markdown Compiler
 * Compiles markdown tables, lists, headings, and inline tags into clean,
 * readable HTML/React elements without showing raw uncompiled markdown code.
 */
function FormattedMessage({ text }) {
  if (!text) return null;

  // 1. Strip raw code fences (```markdown ... ``` or ``` ... ```)
  const cleanText = text.replace(/```[a-zA-Z]*\n?([\s\S]*?)```/g, "$1").trim();

  const rawLines = cleanText.split("\n");
  const blocks = [];
  let i = 0;

  const isTableSeparator = (str) =>
    /^\|?[\s:-]+(?:\|[\s:-]+)+\|?$/.test(str.trim());

  while (i < rawLines.length) {
    const line = rawLines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Markdown Table: line contains '|' and the next line is a separator row
    if (
      trimmed.includes("|") &&
      i + 1 < rawLines.length &&
      isTableSeparator(rawLines[i + 1])
    ) {
      const headerLine = trimmed;
      i += 2; // skip header and separator
      const rows = [];
      while (i < rawLines.length && rawLines[i].trim().includes("|")) {
        const rowLine = rawLines[i].trim();
        let cells = rowLine.split("|").map((c) => c.trim());
        if (rowLine.startsWith("|")) cells.shift();
        if (rowLine.endsWith("|")) cells.pop();
        if (cells.length > 0) rows.push(cells);
        i++;
      }
      let headerCells = headerLine.split("|").map((c) => c.trim());
      if (headerLine.startsWith("|")) headerCells.shift();
      if (headerLine.endsWith("|")) headerCells.pop();

      blocks.push({ type: "table", headers: headerCells, rows });
      continue;
    }

    // Markdown Headings (#, ##, ###)
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2],
      });
      i++;
      continue;
    }

    // Unordered List (- , * , • )
    if (/^[-*•]\s+/.test(trimmed)) {
      const items = [];
      while (i < rawLines.length && /^[-*•]\s+/.test(rawLines[i].trim())) {
        items.push(rawLines[i].trim().replace(/^[-*•]\s+/, ""));
        i++;
      }
      blocks.push({ type: "bullet_list", items });
      continue;
    }

    // Ordered List (1. , 2. )
    if (/^\d+\.\s+/.test(trimmed)) {
      const items = [];
      while (i < rawLines.length && /^\d+\.\s+/.test(rawLines[i].trim())) {
        items.push(rawLines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "ordered_list", items });
      continue;
    }

    // Regular paragraph
    blocks.push({ type: "paragraph", text: trimmed });
    i++;
  }

  return (
    <div className={styles.formattedContent}>
      {blocks.map((block, idx) => {
        if (block.type === "table") {
          return (
            <div key={idx} className={styles.tableWrapper}>
              <table className={styles.markdownTable}>
                {block.headers.length > 0 && (
                  <thead>
                    <tr>
                      {block.headers.map((h, hIdx) => (
                        <th key={hIdx}>{parseInline(h)}</th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {block.rows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx}>{parseInline(cell)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (block.type === "heading") {
          return (
            <div key={idx} className={styles.mdHeading}>
              {parseInline(block.text)}
            </div>
          );
        }

        if (block.type === "bullet_list") {
          return (
            <div key={idx} className={styles.formattedList}>
              {block.items.map((item, bIdx) => (
                <div key={bIdx} className={styles.formattedListItem}>
                  <span className={styles.bulletDot} />
                  <span>{parseInline(item)}</span>
                </div>
              ))}
            </div>
          );
        }

        if (block.type === "ordered_list") {
          return (
            <ol key={idx} className={styles.orderedList}>
              {block.items.map((item, oIdx) => (
                <li key={oIdx} className={styles.orderedListItem}>
                  {parseInline(item)}
                </li>
              ))}
            </ol>
          );
        }

        return <p key={idx}>{parseInline(block.text)}</p>;
      })}
    </div>
  );
}

export default function FAQChatbot() {
  const pathname = usePathname();
  const { startTour } = useTour();
  const [isOpen, setIsOpen] = useState(false);
  const [faqs, setFaqs] = useState(DEFAULT_FAQS);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "bot",
      text: "Hello! Welcome to Aura Luxury Salon. How may I assist you with our services, treatments, or pricing today?",
      time: "Just now",
      showChips: true,
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [sessionId] = useState(() => "sess_" + Math.random().toString(36).substring(2, 9));
  const messagesEndRef = useRef(null);

  // Hide on dashboard and auth pages
  const isHidden =
    pathname?.startsWith("/dashboard") ||
    pathname === "/login" ||
    pathname === "/signup";

  // Load FAQs from Supabase or fallback
  useEffect(() => {
    async function fetchFaqs() {
      try {
        const { data, error } = await supabase
          .from("faq_items")
          .select("question, answer, category")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (!error && data && data.length > 0) {
          setFaqs(data);
        }
      } catch (err) {
        console.warn("Using default FAQs:", err);
      }
    }
    fetchFaqs();
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isThinking, isOpen]);

  if (isHidden) return null;

  // Rule-based answer finder
  const findAnswer = (query) => {
    const qLower = query.toLowerCase().trim();

    // 1. Explicit Guidance / Screen Tour request
    if (isExplicitGuidance(qLower)) {
      return "I would be delighted to guide you! Click the **🎯 Guide Me on Screen** button below to start an interactive step-by-step walkthrough.";
    }

    // 2. Direct match with configured FAQs from database
    const exactMatch = faqs.find(
      (f) =>
        f.question.toLowerCase().includes(qLower) ||
        qLower.includes(f.question.toLowerCase())
    );
    if (exactMatch) return exactMatch.answer;

    // 3. Keyword matching rules for direct answers
    if (
      qLower.includes("home") ||
      qLower.includes("landing") ||
      qLower.includes("main page") ||
      qLower.includes("front page")
    ) {
      return "You can return to the **Home / Landing page** anytime by clicking **Home** in the top navigation bar or tapping the salon brand logo in the top-left corner.";
    }

    if (
      qLower.includes("profile icon") ||
      qLower.includes("profile kahan") ||
      qLower.includes("mera profile") ||
      qLower.includes("avatar") ||
      qLower.includes("profile pic") ||
      (qLower.includes("profile") && (qLower.includes("kahan") || qLower.includes("icon") || qLower.includes("change")))
    ) {
      return "Your **Profile Icon** is located at the **top-right corner of the header navigation bar**.\n\n- **If Signed In:** Your photo or initials appear at the top-right (`#nav-profile`). Click it to open the account dropdown menu.\n- **If Not Signed In:** The **Sign In** button appears in the same top-right spot.\n- **To Change Profile Photo:** Go to your **Account** page (`/account`), select the **Profile Info** tab, and upload a new photo.\n- **To Change Password:** Go to `/account` and click on the **Change Password** tab.\n- **To Check Inquiries:** Go to `/account` and click on the **My Enquiries** tab.";
    }

    if (
      qLower.includes("password") ||
      qLower.includes("change pass") ||
      qLower.includes("reset pass")
    ) {
      return "To change your password:\n\n1. Click your **Profile Icon** in the top-right header and select **My Account & Security** (or visit `/account`).\n2. Click on the **Change Password** tab (`#account-tab-security`).\n3. Enter your new password, confirm it, and click **Save Password**.";
    }

    if (
      qLower.includes("inquir") ||
      qLower.includes("enquir") ||
      (qLower.includes("status") && qLower.includes("booking"))
    ) {
      return "To review your booking enquiries:\n\n- **Customers:** Visit your **Account** page (`/account`) and click the **My Enquiries** tab to see your booking requests and status.\n- **Salon Owners / Admins:** Open the **Admin Dashboard** (`/dashboard/enquiries`) to manage all incoming customer requests.";
    }

    if (
      qLower.includes("gallery") ||
      qLower.includes("photo") ||
      qLower.includes("look") ||
      qLower.includes("transform") ||
      qLower.includes("image")
    ) {
      return "Our photo gallery showcases real client hair styling transformations, clinical skin glow rituals, bespoke bridal looks, and salon ambience. We specialize in both women's and men's luxury grooming.";
    }

    if (
      qLower.includes("time") ||
      qLower.includes("hour") ||
      qLower.includes("open") ||
      qLower.includes("close") ||
      qLower.includes("sunday")
    ) {
      return "We are open Monday to Saturday from 10:00 AM to 8:00 PM, and Sunday from 11:00 AM to 6:00 PM.";
    }

    if (
      qLower.includes("where") ||
      qLower.includes("location") ||
      qLower.includes("address") ||
      qLower.includes("map") ||
      qLower.includes("direction")
    ) {
      return "We are located at Luxury Boulevard, Near City Centre. Our desk is reachable at +91 98765 43210 for turn-by-turn directions.";
    }

    if (
      qLower.includes("appoint") ||
      qLower.includes("book") ||
      qLower.includes("walk-in") ||
      qLower.includes("walkin") ||
      qLower.includes("slot") ||
      qLower.includes("reserve")
    ) {
      return "You can easily book an appointment by calling our desk at +91 98765 43210, messaging on WhatsApp, or submitting an enquiry on our Contact page.";
    }

    if (
      qLower.includes("haircut") ||
      qLower.includes("hair cut") ||
      qLower.includes("styling")
    ) {
      return "We offer Men's precision haircuts starting at ₹450 and Women's cuts with blow-dry styling starting at ₹850.";
    }

    if (
      qLower.includes("price") ||
      qLower.includes("cost") ||
      qLower.includes("rate") ||
      qLower.includes("charge") ||
      qLower.includes("menu")
    ) {
      return "Our services start from ₹200 for grooming, ₹450 for haircuts, ₹700 for cleanups, and ₹1,500 for premium facials. Bespoke bridal packages are also available.";
    }

    if (
      qLower.includes("bridal") ||
      qLower.includes("wedding") ||
      qLower.includes("groom makeup")
    ) {
      return "Yes! We specialize in bespoke Bridal & Groom makeover packages. Please reach out to our salon desk at +91 98765 43210 to arrange a personal consultation.";
    }

    if (
      qLower.includes("contact") ||
      qLower.includes("phone") ||
      qLower.includes("whatsapp") ||
      qLower.includes("call") ||
      qLower.includes("number")
    ) {
      return "You can reach our salon desk by phone or WhatsApp at +91 98765 43210 or email us at contact@auraluxesalon.com.";
    }

    if (
      qLower.includes("about") ||
      qLower.includes("story") ||
      qLower.includes("hygiene") ||
      qLower.includes("safety") ||
      qLower.includes("steril") ||
      qLower.includes("stylist") ||
      qLower.includes("product")
    ) {
      return "At Aura Luxury Salon, we pride ourselves on clinical hygiene protocols, 100% sterilized instruments, and master certified stylists using premium organic formulations.";
    }

    if (
      qLower.includes("account") ||
      qLower.includes("login") ||
      qLower.includes("signin") ||
      qLower.includes("sign in") ||
      qLower.includes("member")
    ) {
      return "You can sign in to your Member Account to easily view your salon bookings, update personal preferences, and enjoy exclusive member privileges.";
    }

    if (
      qLower.includes("men") ||
      qLower.includes("women") ||
      qLower.includes("unisex") ||
      qLower.includes("gender")
    ) {
      return "Yes, we are a full-service unisex salon serving both men and women with certified, specialized professionals.";
    }

    // Safe fallback when question is unknown
    return null;
  };

  const handleAskQuestion = async (questionText) => {
    if (!questionText || isThinking) return;

    const timeStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      text: questionText,
      time: timeStr,
    };

    // Add user message to conversation immediately
    setMessages((prev) => [...prev, userMsg]);

    // 1. TIER 1: Check FAQ dataset first (Instant 0-latency reply)
    const directAnswer = findAnswer(questionText);
    if (directAnswer) {
      let suggestedTour = null;
      let suggestedPage = null;

      // Only attach interactive tour / spotlight if user explicitly requested guidance!
      if (isExplicitGuidance(questionText)) {
        const qLower = questionText.toLowerCase();
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
          qLower.includes("image")
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
          qLower.includes("price") ||
          qLower.includes("haircut") ||
          qLower.includes("facial") ||
          qLower.includes("rate") ||
          qLower.includes("cost") ||
          qLower.includes("bridal") ||
          qLower.includes("grooming") ||
          qLower.includes("menu")
        ) {
          suggestedTour = "services";
          suggestedPage = "/services";
        } else if (
          qLower.includes("contact") ||
          qLower.includes("phone") ||
          qLower.includes("whatsapp") ||
          qLower.includes("call") ||
          qLower.includes("location") ||
          qLower.includes("address") ||
          qLower.includes("map") ||
          qLower.includes("hour") ||
          qLower.includes("time") ||
          qLower.includes("open") ||
          qLower.includes("where")
        ) {
          suggestedTour = "contact";
          suggestedPage = "/contact";
        } else if (
          qLower.includes("about") ||
          qLower.includes("story") ||
          qLower.includes("hygiene") ||
          qLower.includes("safety") ||
          qLower.includes("stylist") ||
          qLower.includes("product")
        ) {
          suggestedTour = "about";
          suggestedPage = "/about";
        } else {
          // If asked to guide generally, respect the user's current page!
          if (pathname === "/gallery") {
            suggestedTour = "gallery";
            suggestedPage = "/gallery";
          } else if (pathname === "/contact") {
            suggestedTour = "contact";
            suggestedPage = "/contact";
          } else if (pathname === "/about") {
            suggestedTour = "about";
            suggestedPage = "/about";
          } else if (pathname === "/account") {
            suggestedTour = "profile";
            suggestedPage = "/account";
          } else if (pathname === "/") {
            suggestedTour = "home";
            suggestedPage = "/";
          } else {
            suggestedTour = "services";
            suggestedPage = "/services";
          }
        }
      }

      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: directAnswer,
        time: timeStr,
        showContactLink: false,
        suggestedTour,
        suggestedPage,
      };
      setMessages((prev) => [...prev, botMsg]);
      return;
    }

    // 2. TIER 2: n8n / Groq AI Agent Workflow
    setIsThinking(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: questionText,
          sessionId: sessionId,
          currentPage: pathname,
        }),
      });

      if (!res.ok) {
        throw new Error("Chat service unavailable");
      }

      const data = await res.json();
      const botReply =
        data.reply ||
        "I am happy to assist you with our luxury salon services. How else may I pamper you today?";

      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: botReply,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        showContactLink: Boolean(data.showContactLink),
        suggestedTour: data.suggestedTour,
        suggestedPage: data.suggestedPage,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      // 3. TIER 3: Fallback with Contact link
      const isGuidanceReq = isExplicitGuidance(questionText);
      const fallbackMsg = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: "I don't have the exact answer for that question right now, but our salon team is happy to help! You can reach us directly at +91 98765 43210 or send an enquiry on our Contact page.",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        showContactLink: true,
        suggestedTour: isGuidanceReq ? "contact" : null,
        suggestedPage: isGuidanceReq ? "/contact" : null,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isThinking) return;
    const text = inputText.trim();
    setInputText("");
    handleAskQuestion(text);
  };

  return (
    <>
      {/* Floating launcher */}
      {!isOpen && (
        <button
          className={styles.launcher}
          onClick={() => setIsOpen(true)}
          aria-label="Open Salon Assistant Chatbot"
        >
          <div className={styles.launcherIcon}>
            <HiOutlineChatAlt2 size={20} />
          </div>
          <span>Ask Assistant</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={styles.chatWindow} role="dialog" aria-label="FAQ Chat">
          {/* Header */}
          <div className={styles.chatHeader}>
            <div className={styles.botInfo}>
              <div className={styles.botAvatar}>✦</div>
              <div>
                <div className={styles.botName}>
                  Salon Assistant
                  <HiOutlineSparkles size={14} color="var(--color-primary)" />
                </div>
                <div className={styles.botStatus}>
                  <span className={styles.statusDot} /> AI Concierge & Guide
                </div>
              </div>
            </div>

            <button
              className={styles.closeBtn}
              onClick={() => setIsOpen(false)}
              aria-label="Close Chat"
            >
              <HiOutlineX size={20} />
            </button>
          </div>

          {/* Messages Body */}
          <div className={styles.messagesContainer}>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`${styles.messageRow} ${
                  m.sender === "user" ? styles.messageRowUser : ""
                }`}
              >
                <div
                  className={`${styles.messageBubble} ${
                    m.sender === "user" ? styles.userBubble : styles.botBubble
                  }`}
                >
                  {m.sender === "user" ? (
                    <p>{m.text}</p>
                  ) : (
                    <FormattedMessage text={m.text} />
                  )}

                  {/* Interactive Action Buttons: Spotlight Guide & Direct Page Link */}
                  {(m.suggestedTour || m.suggestedPage || m.showContactLink) && (
                    <div className={styles.botActionsGrid}>
                      {m.suggestedTour && (
                        <button
                          type="button"
                          className={styles.tourTriggerBtn}
                          onClick={() => {
                            setIsOpen(false);
                            startTour(m.suggestedTour);
                          }}
                          title="Start step-by-step interactive on-screen spotlight"
                        >
                          <HiOutlineSparkles size={13} />
                          <span>🎯 Guide Me on Screen</span>
                        </button>
                      )}

                      {m.suggestedPage && (
                        <Link
                          href={m.suggestedPage}
                          className={styles.pageLinkBtn}
                          onClick={() => setIsOpen(false)}
                        >
                          <span>
                            Open {m.suggestedTour ? m.suggestedTour.charAt(0).toUpperCase() + m.suggestedTour.slice(1) : "Page"} →
                          </span>
                        </Link>
                      )}

                      {m.showContactLink && !m.suggestedPage && (
                        <Link
                          href="/contact"
                          className={styles.contactCtaLink}
                          onClick={() => setIsOpen(false)}
                        >
                          Go to Contact Page →
                        </Link>
                      )}
                    </div>
                  )}

                  {/* Show quick chips on welcome */}
                  {m.showChips && (
                    <div className={styles.quickChips}>
                      {QUICK_QUESTIONS.map((q, idx) => (
                        <button
                          key={idx}
                          className={styles.chipBtn}
                          onClick={() => handleAskQuestion(q)}
                          disabled={isThinking}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className={styles.timestamp}>{m.time}</div>
                </div>
              </div>
            ))}

            {/* Thinking / AI Typing Indicator */}
            {isThinking && (
              <div className={styles.messageRow}>
                <div
                  className={`${styles.messageBubble} ${styles.botBubble} ${styles.typingBubble}`}
                >
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form className={styles.inputBar} onSubmit={handleSend}>
            <input
              type="text"
              className={styles.chatInput}
              placeholder={
                isThinking ? "Assistant is thinking..." : "Type your question..."
              }
              value={inputText}
              disabled={isThinking}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button
              type="submit"
              className={styles.sendBtn}
              disabled={!inputText.trim() || isThinking}
              aria-label="Send Message"
            >
              <HiOutlinePaperAirplane size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

