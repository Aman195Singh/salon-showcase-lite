import styles from "../legal.module.css";

export const metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for browsing our salon website and submitting service enquiries.",
  openGraph: {
    title: "Terms of Service | Salon",
    description: "Terms and conditions for browsing our salon website.",
  },
};

export default function TermsOfServicePage() {
  return (
    <div className={styles.page}>
      <div className="container">
        <article className={styles.card}>
          {/* Draft Notice */}
          <div className={styles.draftBanner} role="note">
            <span className={styles.draftTitle}>Draft — Owner / Legal Review Needed</span>
            <p className={styles.draftDesc}>
              This document is a preliminary draft template reflecting website terms of use. It must be
              reviewed and customized with qualified legal advice before commercial reliance.
            </p>
          </div>

          <h1 className={styles.title}>Terms of Service</h1>
          <span className={styles.effectiveDate}>Effective Date: October 2026 (Draft)</span>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Acceptance of Terms</h2>
            <p className={styles.paragraph}>
              By accessing and using this website, you agree to comply with and be bound by these Terms of Service.
              If you do not agree with any part of these terms, please do not use this website.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Website Purpose & Information Accuracy</h2>
            <p className={styles.paragraph}>
              This website provides informational details about our salon, including descriptions of services,
              estimated price ranges, opening hours, and location. While we strive to maintain current information:
            </p>
            <ul className={styles.list}>
              <li>All service prices and durations listed online are indicative guides and subject to in-salon confirmation based on individual hair length, texture, and consultation.</li>
              <li>Opening hours, stylist availability, and seasonal offers may vary and can change without prior notice.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Enquiries & Appointment Bookings</h2>
            <p className={styles.paragraph}>
              Submitting an enquiry via our Contact page or message form indicates an expression of interest.
              It does <strong>not</strong> constitute a confirmed appointment or legally binding booking until salon staff
              contact you directly and confirm the date and time.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Acceptable Use</h2>
            <p className={styles.paragraph}>
              When using our contact forms and website, you agree:
            </p>
            <ul className={styles.list}>
              <li>To provide accurate and genuine contact information so our team can reach you.</li>
              <li>Not to submit unlawful, threatening, abusive, harassing, or spam messages.</li>
              <li>Not to attempt to breach website security, probe system vulnerabilities, or overwhelm server resources.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>5. Intellectual Property</h2>
            <p className={styles.paragraph}>
              All logos, brand names, styling photographs, graphics, and written content appearing on this website
              are the property of the salon or used under license. Reproduction, modification, or distribution without
              written permission is strictly prohibited.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>6. Limitation of Liability</h2>
            <p className={styles.paragraph}>
              To the fullest extent permitted by applicable law, the salon and its owners shall not be liable for any
              indirect, incidental, or consequential damages arising from your access to or inability to use this website.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
