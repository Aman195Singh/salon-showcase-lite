import styles from "../legal.module.css";

export const metadata = {
  title: "Privacy Policy",
  description: "Learn about how our salon collects, protects, and handles personal customer enquiry data.",
  openGraph: {
    title: "Privacy Policy | Salon",
    description: "Learn about how our salon collects and handles personal customer data.",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.page}>
      <div className="container">
        <article className={styles.card}>
          {/* Draft Notice */}
          <div className={styles.draftBanner} role="note">
            <span className={styles.draftTitle}>Draft — Owner / Legal Review Needed</span>
            <p className={styles.draftDesc}>
              This document is a preliminary draft template reflecting the actual technical data handling
              of this website. It must be reviewed and customized with qualified legal advice before commercial reliance.
            </p>
          </div>

          <h1 className={styles.title}>Privacy Policy</h1>
          <span className={styles.effectiveDate}>Effective Date: October 2026 (Draft)</span>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Overview</h2>
            <p className={styles.paragraph}>
              We respect your privacy and are committed to safeguarding any personal information you provide when
              visiting our website or contacting our salon. This policy outlines what data we collect, why we collect it,
              how it is stored, and your rights.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Information We Collect</h2>
            <p className={styles.paragraph}>
              We collect only the information necessary to provide salon consultations and service appointments:
            </p>
            <ul className={styles.list}>
              <li>
                <strong>Contact & Consultation Enquiries:</strong> When you submit an enquiry through our Contact page,
                we collect your name, phone number, email address (if provided), and the content of your message.
              </li>
              <li>
                <strong>Customer Accounts:</strong> If you register an account, we store your email address, full name,
                and an encrypted password hash to allow you to log in and track your own enquiries.
              </li>
              <li>
                <strong>Usage Analytics:</strong> We collect aggregate, privacy-respecting page view and button click metrics
                (such as viewing the services page or tapping a contact action) to understand website usage. We do not use
                third-party advertising cookies, cross-site trackers, or sale of user data.
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>3. How We Use Your Information</h2>
            <p className={styles.paragraph}>
              Information you provide is strictly used for the following operational purposes:
            </p>
            <ul className={styles.list}>
              <li>To respond to your enquiries, service questions, or appointment requests.</li>
              <li>To contact you via phone, WhatsApp, or email regarding services you inquired about.</li>
              <li>To maintain website security, prevent automated spam, and enforce rate limits.</li>
            </ul>
            <p className={styles.paragraph}>
              We do not sell, rent, or lease your personal information to third parties, nor do we send unsolicited marketing newsletters.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Data Storage & Security</h2>
            <p className={styles.paragraph}>
              Customer enquiries and profile records are stored in a cloud database (Supabase) protected by encryption in transit (HTTPS/TLS)
              and Row Level Security (RLS) policies. Only authorized salon owners can access customer enquiries.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>5. Your Rights & Contact</h2>
            <p className={styles.paragraph}>
              You have the right to request a copy of the personal information we hold about you, request corrections to inaccurate details,
              or request that your past enquiries be deleted. To exercise any of these rights, please contact the salon directly via our Contact page.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
