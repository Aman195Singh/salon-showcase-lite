import Link from "next/link";
import {
  HiOutlineSparkles,
  HiOutlineArrowRight,
  HiOutlineClock,
  HiOutlineShieldCheck,
  HiOutlineHeart,
} from "react-icons/hi";
import HeroCTAs from "@/components/HeroCTAs";
import BannerCTA from "@/components/BannerCTA";
import { getPublishedContent, DEFAULT_SERVICES } from "@/lib/content";
import { supabaseServer } from "@/lib/supabase-server";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    icon: <HiOutlineSparkles size={28} />,
    title: "Expert Stylists",
    description:
      "Skilled professionals with years of experience in the latest trends and techniques.",
  },
  {
    icon: <HiOutlineShieldCheck size={28} />,
    title: "Premium Products",
    description:
      "We use only top-quality, trusted products for the best results and safety.",
  },
  {
    icon: <HiOutlineHeart size={28} />,
    title: "Warm Atmosphere",
    description:
      "A clean, comfortable space where everyone feels welcome and relaxed.",
  },
  {
    icon: <HiOutlineClock size={28} />,
    title: "Flexible Hours",
    description:
      "Convenient appointment options that work with your schedule.",
  },
];

export default async function HomePage() {
  const content = await getPublishedContent();
  const hero = content.home || {};

  // Fetch featured services from DB or fallback
  let featuredServices = [];
  try {
    const { data } = await supabaseServer
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(6);

    if (data && data.length > 0) {
      featuredServices = data;
    } else {
      featuredServices = DEFAULT_SERVICES.slice(0, 6);
    }
  } catch {
    featuredServices = DEFAULT_SERVICES.slice(0, 6);
  }

  const general = content.general || {};
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: general.salonName || "Salon",
    ...(general.address ? {
      address: {
        "@type": "PostalAddress",
        streetAddress: general.address,
      },
    } : {}),
    ...(general.phone ? { telephone: general.phone } : {}),
    ...(general.email ? { email: general.email } : {}),
    ...(general.mapLink ? { hasMap: general.mapLink } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ===== HERO SECTION ===== */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={`container ${styles.heroContent}`}>
          <span className={styles.heroLabel}>
            <HiOutlineSparkles size={14} />
            {hero.heroTagline || "Premium Unisex Salon"}
          </span>
          <h1 className={styles.heroTitle}>
            {hero.heroTitle || "Where Style Meets"}{" "}
            <span className={styles.heroAccent}>
              {hero.heroAccent || "Elegance"}
            </span>
          </h1>
          <p className={styles.heroDesc}>
            {hero.heroDescription ||
              "Experience the art of grooming and beauty. Expert stylists, premium products, and a welcoming atmosphere for men and women."}
          </p>
          <div className={styles.heroCtas}>
            <HeroCTAs
              cta={hero.heroCta || "Book Your Visit"}
              ctaSecondary={hero.heroCtaSecondary || "Explore Services"}
            />
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className={`section ${styles.features}`}>
        <div className="container">
          <div className="section-header-center">
            <span className="section-label">Why Choose Us</span>
            <h2 className="section-title">A Salon Experience Like No Other</h2>
            <p className="section-subtitle">
              We blend expertise, quality products, and genuine care to give you
              the best grooming and beauty experience.
            </p>
          </div>

          <div className={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <div key={i} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED SERVICES ===== */}
      <section className={`section ${styles.servicesSection}`}>
        <div className="container">
          <div className="section-header-center">
            <span className="section-label">Our Services</span>
            <h2 className="section-title">Popular Services</h2>
            <p className="section-subtitle">
              From classic haircuts to complete makeovers — we have something for
              everyone.
            </p>
          </div>

          <div className={styles.servicesGrid}>
            {featuredServices.map((s, i) => (
              <div key={i} className={`card ${styles.serviceCard}`}>
                <div className="card-body">
                  <span className={`badge badge-primary ${styles.serviceBadge}`}>
                    {s.category}
                  </span>
                  <h3 className={styles.serviceName}>{s.name}</h3>
                  <div className={styles.serviceMeta}>
                    <span className={styles.servicePrice}>{s.price}</span>
                    <span className={styles.serviceDuration}>
                      <HiOutlineClock size={14} />
                      {s.duration}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.servicesCta}>
            <Link href="/services" className="btn btn-secondary">
              View All Services
              <HiOutlineArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className={styles.ctaBanner}>
        <div className="container">
          <div className={styles.ctaBannerInner}>
            <div>
              <h2 className={styles.ctaBannerTitle}>Ready for a New Look?</h2>
              <p className={styles.ctaBannerDesc}>
                Visit us today or get in touch to learn more about our services
                and offers.
              </p>
            </div>
            <BannerCTA />
          </div>
        </div>
      </section>
    </>
  );
}
