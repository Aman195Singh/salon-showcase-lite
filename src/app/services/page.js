import { HiOutlineClock, HiOutlinePhone, HiOutlineCalendar } from "react-icons/hi";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import { DEFAULT_SERVICES } from "@/lib/content";
import styles from "./services.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Services & Pricing",
  description:
    "Explore our full range of grooming and beauty services for men and women — haircuts, styling, facials, bridal makeup, and more.",
};

async function getServicesGrouped() {
  let allServices = [];
  try {
    const { data, error } = await supabaseServer
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (!error && data && data.length > 0) {
      allServices = data;
    } else {
      allServices = DEFAULT_SERVICES;
    }
  } catch (err) {
    console.warn("Failed to fetch live services, using defaults:", err);
    allServices = DEFAULT_SERVICES;
  }

  // Category descriptions map
  const catDescriptions = {
    Hair: "Expert cuts, styling, colouring, and treatments for all hair types.",
    "Skin & Face": "Rejuvenating facials, clean-ups, and skin treatments.",
    Makeup: "Professional makeup for every occasion — from casual to bridal.",
    Grooming: "Classic and contemporary grooming for men.",
    Nails: "Complete nail care and art for hands and feet.",
  };

  // Group services by category
  const categoriesMap = {};
  allServices.forEach((s) => {
    const cat = s.category || "General";
    if (!categoriesMap[cat]) {
      categoriesMap[cat] = {
        name: cat,
        description: catDescriptions[cat] || "Quality salon services.",
        services: [],
      };
    }
    categoriesMap[cat].services.push(s);
  });

  return Object.values(categoriesMap);
}

export default async function ServicesPage() {
  const categories = await getServicesGrouped();

  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <span className="section-label">Our Services</span>
          <h1 className={styles.heroTitle}>Services & Pricing</h1>
          <p className={styles.heroDesc}>
            Quality grooming and beauty services for men and women. Every service
            uses premium products and is delivered by experienced professionals.
          </p>
        </div>
      </section>

      {/* Service Categories */}
      <section id="services-list-container" className="section">
        <div className="container">
          {categories.map((cat, ci) => (
            <div key={ci} className={styles.category}>
              <div className={styles.categoryHeader}>
                <h2 className={styles.categoryName}>{cat.name}</h2>
                <p className={styles.categoryDesc}>{cat.description}</p>
              </div>

              <div className={styles.servicesList}>
                {cat.services.map((s, si) => (
                  <div key={si} className={styles.serviceRow}>
                    <div className={styles.serviceInfo}>
                      <h3 className={styles.serviceName}>{s.name}</h3>
                      <p className={styles.serviceDesc}>{s.description}</p>
                    </div>
                    <div className={styles.serviceMeta}>
                      <span className={styles.serviceDuration}>
                        <HiOutlineClock size={14} />
                        {s.duration}
                      </span>
                      <span className={styles.servicePrice}>{s.price}</span>
                      <Link
                        href={`/contact?service=${encodeURIComponent(s.name)}`}
                        className={styles.bookServiceBtn}
                        title={`Enquire about ${s.name}`}
                      >
                        Enquire Now
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Policies Note */}
      <section className={`section-sm ${styles.policiesSection}`}>
        <div className="container">
          <div className={styles.policiesCard}>
            <h3 className={styles.policiesTitle}>Service Policies</h3>
            <ul className={styles.policiesList}>
              <li>
                Prices may vary based on hair length, product used, and complexity.
              </li>
              <li>Please arrive 5–10 minutes early for your appointment.</li>
              <li>
                A patch test is recommended 24 hours before chemical treatments.
              </li>
              <li>We maintain the highest hygiene standards with sterilized tools.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaInner}>
            <h2 className={styles.ctaTitle}>Ready to Experience Luxury?</h2>
            <p className={styles.ctaDesc}>
              Book online instantly or contact our concierge. We&apos;d love to help you look and feel your best.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginTop: "16px" }}>
              <Link href="/book" className="btn btn-primary btn-lg">
                <HiOutlineCalendar size={18} />
                Book Online
              </Link>
              <Link href="/contact" className="btn btn-secondary btn-lg" style={{ borderColor: "#fff", color: "#fff" }}>
                <HiOutlinePhone size={18} />
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
