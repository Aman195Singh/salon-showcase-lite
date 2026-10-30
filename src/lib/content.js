import { supabase } from "./supabase";

/**
 * Default fallback content matching PRD-V1 and seed data.
 * Used whenever Supabase tables are empty or connection fails.
 */
export const DEFAULT_CONTENT = {
  general: {
    salonName: "Luxury Salon",
    tagline: "Premium Unisex Salon & Spa",
    phone: "",
    whatsapp: "",
    email: "",
    address: "Visit our salon for appointments & consultations.",
    mapLink: "",
    mapEmbedUrl: "",
    instagram: "",
    facebook: "",
    youtube: "",
    hours: [
      { day: "Monday – Saturday", time: "10:00 AM – 8:00 PM" },
      { day: "Sunday", time: "11:00 AM – 6:00 PM" },
    ],
    socialLinks: [],
  },
  home: {
    heroTagline: "Premium Unisex Salon",
    heroTitle: "Where Style Meets",
    heroAccent: "Elegance",
    heroDescription:
      "Experience the art of grooming and beauty. Expert stylists, premium products, and a welcoming atmosphere for men and women.",
    heroCta: "Book Your Visit",
    heroCtaSecondary: "Explore Services",
  },
  about: {
    title: "Our Story",
    description:
      "A passion for beauty, a commitment to excellence, and years of experience — that is what defines Aura Luxe.",
    storyParagraphs: [
      "We started with a simple belief: everyone deserves access to quality grooming and beauty services in a clean, comfortable, and welcoming environment.",
      "Our team of skilled professionals brings years of experience across hair styling, skin care, makeup artistry, and grooming — serving both men and women with equal dedication.",
      "From a classic haircut to a complete bridal makeover, we treat every service as an opportunity to make someone feel confident and beautiful.",
    ],
  },
  contact: {
    title: "Get in Touch",
    description:
      "Have a question or want to book a visit? We would love to hear from you.",
    mapTitle: "Find Our Salon on Google Maps",
    mapDescription:
      "Visit us at our studio or get exact turn-by-turn directions below.",
    mapAddress: "SCO No. 387, Luxury Boulevard, Near City Centre",
    mapEmbedUrl: "",
    socialLinks: [],
  },
  gallery: {
    heroTitle: "Our Work & Craft",
    heroDesc:
      "A glimpse of our salon, our artistry, and the transformations we create for our clients every day.",
    images: [
      {
        id: "1",
        src: "/images/hero-salon.jpg",
        alt: "Salon Interior & Styling Stations",
        caption: "Our modern luxury salon space",
        category: "Salon",
      },
      {
        id: "2",
        src: "/images/about-salon.jpg",
        alt: "Master Hair Styling",
        caption: "Precision cuts and blow dry styling",
        category: "Hair",
      },
      {
        id: "3",
        src: "/images/gallery-bridal.jpg",
        alt: "Indian Bridal Makeup & Styling",
        caption: "Radiant, timeless bridal transformations",
        category: "Bridal",
      },
      {
        id: "4",
        src: "/images/gallery-grooming.jpg",
        alt: "Men's Haircut & Beard Grooming",
        caption: "Sharp beard trimming and classic men's cuts",
        category: "Grooming",
      },
      {
        id: "5",
        src: "/images/gallery-facial.jpg",
        alt: "Rejuvenating Spa Facial Treatment",
        caption: "Deep cleansing and hydrating skin care",
        category: "Skin",
      },
      {
        id: "6",
        src: "/images/gallery-nails.jpg",
        alt: "Gold Foil Nail Art & Manicure",
        caption: "Elegant nail art with delicate gold leaf",
        category: "Nails",
      },
    ],
  },
};

export const PRESET_GALLERY_IMAGES = [
  { label: "Salon Interior", src: "/images/hero-salon.jpg", category: "Salon", caption: "Our luxury salon ambiance" },
  { label: "Hair Styling", src: "/images/about-salon.jpg", category: "Hair", caption: "Expert haircut & blow dry" },
  { label: "Bridal Makeup", src: "/images/gallery-bridal.jpg", category: "Bridal", caption: "Bridal makeover & beauty" },
  { label: "Men's Grooming", src: "/images/gallery-grooming.jpg", category: "Grooming", caption: "Beard shaping & styling" },
  { label: "Spa & Facial", src: "/images/gallery-facial.jpg", category: "Skin", caption: "Hydrating facial treatment" },
  { label: "Nail Art", src: "/images/gallery-nails.jpg", category: "Nails", caption: "Custom luxury nail art" },
];

export const DEFAULT_SERVICES = [
  { id: "1", category: "Hair", name: "Haircut — Men", description: "Precision cut tailored to your face shape and style preference.", price: "₹450", duration: "30 min", sort_order: 1, is_active: true },
  { id: "2", category: "Hair", name: "Haircut — Women", description: "Expert cut, blow dry, and styling for all hair lengths.", price: "₹850", duration: "45 min", sort_order: 2, is_active: true },
  { id: "3", category: "Hair", name: "Hair Colour", description: "Global, highlights, or balayage with premium ammonia-free colours.", price: "₹2,500+", duration: "60–90 min", sort_order: 3, is_active: true },
  { id: "4", category: "Hair", name: "Hair Spa", description: "Deep conditioning treatment for nourished, shiny hair.", price: "₹1,200", duration: "45 min", sort_order: 4, is_active: true },
  { id: "5", category: "Hair", name: "Keratin Treatment", description: "Smooth, frizz-free hair that lasts weeks.", price: "₹4,000+", duration: "120 min", sort_order: 5, is_active: true },
  { id: "6", category: "Skin & Face", name: "Classic Facial", description: "Deep cleansing, exfoliation, and hydration for fresh, glowing skin.", price: "₹1,500", duration: "45 min", sort_order: 6, is_active: true },
  { id: "7", category: "Skin & Face", name: "Gold Facial", description: "Premium gold-infused facial for radiance and anti-ageing benefits.", price: "₹2,200", duration: "60 min", sort_order: 7, is_active: true },
  { id: "8", category: "Skin & Face", name: "De-Tan Treatment", description: "Remove sun tan and restore even skin tone.", price: "₹800", duration: "30 min", sort_order: 8, is_active: true },
  { id: "9", category: "Skin & Face", name: "Clean-Up", description: "Quick, effective deep-pore cleansing for fresh skin.", price: "₹700", duration: "30 min", sort_order: 9, is_active: true },
  { id: "10", category: "Makeup", name: "Party Makeup", description: "Glamorous look for parties, dinners, and special events.", price: "₹2,500", duration: "60 min", sort_order: 10, is_active: true },
  { id: "11", category: "Makeup", name: "Bridal Makeup", description: "Complete bridal look with premium products and accessories.", price: "₹12,000+", duration: "90–120 min", sort_order: 11, is_active: true },
  { id: "12", category: "Makeup", name: "Engagement Makeup", description: "Elegant, photo-ready look for your engagement ceremony.", price: "₹5,000", duration: "75 min", sort_order: 12, is_active: true },
  { id: "13", category: "Grooming", name: "Beard Trim & Shape", description: "Precise shaping and trimming for a clean, polished beard.", price: "₹250", duration: "20 min", sort_order: 13, is_active: true },
  { id: "14", category: "Grooming", name: "Clean Shave", description: "Smooth clean shave with hot towel and soothing aftershave.", price: "₹200", duration: "20 min", sort_order: 14, is_active: true },
  { id: "15", category: "Grooming", name: "Head Massage", description: "Relaxing oil head massage to relieve stress and promote hair health.", price: "₹350", duration: "15 min", sort_order: 15, is_active: true },
  { id: "16", category: "Nails", name: "Manicure", description: "Nail shaping, cuticle care, massage, and polish.", price: "₹600", duration: "30 min", sort_order: 16, is_active: true },
  { id: "17", category: "Nails", name: "Pedicure", description: "Complete foot care with scrub, massage, and polish.", price: "₹800", duration: "40 min", sort_order: 17, is_active: true },
  { id: "18", category: "Nails", name: "Nail Art", description: "Creative nail designs and gel extensions.", price: "₹1,000+", duration: "30 min", sort_order: 18, is_active: true },
];

export const DEFAULT_FAQS = [
  { question: "What are your opening hours?", answer: "We are open Monday to Saturday from 10:00 AM to 8:00 PM, and Sunday from 11:00 AM to 6:00 PM.", category: "general" },
  { question: "Where is the salon located?", answer: "Please visit our Contact page to view our exact address and directions on Google Maps.", category: "location" },
  { question: "Do I need an appointment?", answer: "Walk-ins are always welcome! However, we recommend calling ahead or booking for weekends and evenings to minimize your wait time.", category: "general" },
  { question: "What services do you offer?", answer: "We offer comprehensive hair cuts & styling, hair colouring, facials, skin cleanups, party & bridal makeup, men's beard grooming, manicures, and pedicures.", category: "services" },
  { question: "Are services for both men and women?", answer: "Yes! We are a full-service unisex salon with specialized stylists for both men and women.", category: "general" },
  { question: "How can I book or contact you?", answer: "You can call us directly, message us on WhatsApp, or send an enquiry through our Contact page form.", category: "contact" },
  { question: "Do you offer bridal makeup packages?", answer: "Yes, we offer customized pre-bridal and wedding day makeup packages. Please contact us for consultation and personalized quotes.", category: "services" },
];

/**
 * Fetch all published content for public pages (Client or Server).
 */
export async function getPublishedContent() {
  try {
    const { data, error } = await supabase
      .from("site_content")
      .select("section, content");

    if (error || !data || data.length === 0) {
      return DEFAULT_CONTENT;
    }

    const merged = { ...DEFAULT_CONTENT };
    data.forEach((row) => {
      if (row.section && row.content) {
        merged[row.section] = {
          ...DEFAULT_CONTENT[row.section],
          ...row.content,
        };
      }
    });

    return merged;
  } catch (err) {
    console.warn("Using default content due to fetch error:", err);
    return DEFAULT_CONTENT;
  }
}

/**
 * Fetch draft or published content for the CMS editor.
 */
export async function getCMSContent() {
  try {
    // 1. Fetch drafts first
    const { data: draftData } = await supabase
      .from("site_content_draft")
      .select("section, content, updated_at");

    // 2. Fetch published content
    const { data: pubData } = await supabase
      .from("site_content")
      .select("section, content, updated_at");

    const content = { ...DEFAULT_CONTENT };
    let hasDrafts = false;
    let lastPublishedAt = null;
    let lastDraftAt = null;

    // Apply published first
    if (pubData && pubData.length > 0) {
      pubData.forEach((row) => {
        if (row.section && row.content) {
          content[row.section] = {
            ...content[row.section],
            ...row.content,
          };
          if (!lastPublishedAt || new Date(row.updated_at) > new Date(lastPublishedAt)) {
            lastPublishedAt = row.updated_at;
          }
        }
      });
    }

    // Overlay drafts if present
    if (draftData && draftData.length > 0) {
      hasDrafts = true;
      draftData.forEach((row) => {
        if (row.section && row.content) {
          content[row.section] = {
            ...content[row.section],
            ...row.content,
          };
          if (!lastDraftAt || new Date(row.updated_at) > new Date(lastDraftAt)) {
            lastDraftAt = row.updated_at;
          }
        }
      });
    }

    return { content, hasDrafts, lastPublishedAt, lastDraftAt };
  } catch (err) {
    console.error("getCMSContent error:", err);
    return {
      content: DEFAULT_CONTENT,
      hasDrafts: false,
      lastPublishedAt: null,
      lastDraftAt: null,
    };
  }
}

/**
 * Save draft content to `site_content_draft`.
 */
export async function saveDraftContent(section, contentObj, userId = null) {
  const payload = {
    section,
    content: contentObj,
    updated_at: new Date().toISOString(),
  };
  if (userId) payload.updated_by = userId;

  const { data, error } = await supabase
    .from("site_content_draft")
    .upsert(payload, { onConflict: "section" })
    .select();

  if (error) throw error;
  return data;
}

/**
 * Publish content: copies draft to `site_content` and clears `site_content_draft`.
 */
export async function publishContent(sectionsToPublish, userId = null) {
  const publishedRows = [];

  for (const [section, contentObj] of Object.entries(sectionsToPublish)) {
    const payload = {
      section,
      content: contentObj,
      updated_at: new Date().toISOString(),
    };
    if (userId) payload.updated_by = userId;

    const { error: pubError } = await supabase
      .from("site_content")
      .upsert(payload, { onConflict: "section" });

    if (pubError) throw pubError;
    publishedRows.push(section);

    // Remove from draft after publishing
    await supabase.from("site_content_draft").delete().eq("section", section);
  }

  return publishedRows;
}
