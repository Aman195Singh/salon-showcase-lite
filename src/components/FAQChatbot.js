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
import styles from "./FAQChatbot.module.css";

const QUICK_QUESTIONS = [
  "What are your opening hours?",
  "Where is the salon located?",
  "Do I need an appointment?",
  "What services do you offer?",
  "Do you offer bridal packages?",
  "How can I contact you?",
];

export default function FAQChatbot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [faqs, setFaqs] = useState(DEFAULT_FAQS);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "bot",
      text: "Hello! Welcome to our salon. I am your automated assistant. Click any question below or type your query!",
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

    // 1. Direct match with configured FAQs
    const exactMatch = faqs.find(
      (f) =>
        f.question.toLowerCase().includes(qLower) ||
        qLower.includes(f.question.toLowerCase())
    );
    if (exactMatch) return exactMatch.answer;

    // 2. Keyword matching rules
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
      qLower.includes("place")
    ) {
      return "Please visit our Contact page to see our exact salon address and interactive Google Maps directions.";
    }

    if (
      qLower.includes("appoint") ||
      qLower.includes("book") ||
      qLower.includes("walk-in") ||
      qLower.includes("walkin")
    ) {
      return "Walk-ins are always welcome! However, we recommend booking in advance or calling ahead for weekends and festive seasons.";
    }

    if (
      qLower.includes("haircut") ||
      qLower.includes("hair cut") ||
      qLower.includes("styling")
    ) {
      return "We offer Men's precision haircuts starting at ₹450 and Women's cuts with blow-dry starting at ₹850. Check our Services page for details.";
    }

    if (
      qLower.includes("price") ||
      qLower.includes("cost") ||
      qLower.includes("rate") ||
      qLower.includes("charge")
    ) {
      return "Our services start from ₹200 for grooming, ₹450 for haircuts, ₹700 for cleanups, and ₹1,500 for premium facials. Please check the Services tab for full pricing.";
    }

    if (
      qLower.includes("bridal") ||
      qLower.includes("wedding") ||
      qLower.includes("groom makeup")
    ) {
      return "Yes! We specialize in complete Bridal & Groom makeover packages. Contact us directly or submit an enquiry on our Contact page to get a personalized bridal consultation.";
    }

    if (
      qLower.includes("contact") ||
      qLower.includes("phone") ||
      qLower.includes("whatsapp") ||
      qLower.includes("call") ||
      qLower.includes("number")
    ) {
      return "You can reach us by phone or WhatsApp at +91 98765 43210 or email us at contact@auraluxesalon.com.";
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
      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: directAnswer,
        time: timeStr,
        showContactLink: false,
      };
      setMessages((prev) => [...prev, botMsg]);
      return;
    }

    // 2. TIER 2: n8n AI Agent Workflow
    setIsThinking(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: questionText,
          sessionId: sessionId,
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
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      // 3. TIER 3: Fallback with Contact link
      const fallbackMsg = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: "I don't have the exact answer for that question right now, but our salon team is happy to help! You can reach us directly via phone or send an enquiry on our Contact page.",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        showContactLink: true,
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
                  <span className={styles.statusDot} /> AI Concierge
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
                  <p>{m.text}</p>

                  {/* Show contact button if fallback */}
                  {m.showContactLink && (
                    <Link
                      href="/contact"
                      className={styles.contactCtaLink}
                      onClick={() => setIsOpen(false)}
                    >
                      Go to Contact Page →
                    </Link>
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

