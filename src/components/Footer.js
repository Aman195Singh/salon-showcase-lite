"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlineClock,
} from "react-icons/hi";
import {
  FaInstagram,
  FaFacebookF,
  FaYoutube,
  FaWhatsapp,
  FaSnapchatGhost,
  FaTwitter,
  FaTiktok,
  FaPinterest,
  FaLinkedinIn,
  FaGlobe,
} from "react-icons/fa";
import styles from "./Footer.module.css";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About Us" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

import { useState, useEffect } from "react";
import { getPublishedContent, DEFAULT_CONTENT } from "@/lib/content";
import {
  getPhoneLink,
  getWhatsAppLink,
  getMailtoLink,
  getMapLink,
  getSocialLink,
} from "@/lib/contact";

function renderFooterSocialIcon(platform) {
  switch (platform) {
    case "instagram": return <FaInstagram size={18} />;
    case "facebook": return <FaFacebookF size={16} />;
    case "whatsapp": return <FaWhatsapp size={18} />;
    case "youtube": return <FaYoutube size={18} />;
    case "snapchat": return <FaSnapchatGhost size={18} />;
    case "twitter": return <FaTwitter size={16} />;
    case "tiktok": return <FaTiktok size={16} />;
    case "pinterest": return <FaPinterest size={16} />;
    case "linkedin": return <FaLinkedinIn size={16} />;
    default: return <FaGlobe size={16} />;
  }
}

export default function Footer() {
  const pathname = usePathname();
  const [year, setYear] = useState("2026");
  const [salonInfo, setSalonInfo] = useState({
    name: DEFAULT_CONTENT.general.salonName,
    tagline: DEFAULT_CONTENT.general.tagline,
    phone: DEFAULT_CONTENT.general.phone,
    whatsapp: DEFAULT_CONTENT.general.whatsapp || "",
    email: DEFAULT_CONTENT.general.email,
    address: DEFAULT_CONTENT.general.address,
    mapLink: DEFAULT_CONTENT.general.mapLink || "",
    hours: "",
  });
  const [socialLinks, setSocialLinks] = useState([]);

  useEffect(() => {
    setYear(new Date().getFullYear().toString());
    async function loadData() {
      const data = await getPublishedContent();
      if (data?.general) {
        const g = data.general;
        const hoursStr = g.hours && g.hours.length > 0
          ? g.hours.map((h) => `${h.day}: ${h.time}`).join(" | ")
          : "";
        setSalonInfo({
          name: g.salonName || DEFAULT_CONTENT.general.salonName,
          tagline: g.tagline || DEFAULT_CONTENT.general.tagline,
          phone: g.phone || "",
          whatsapp: g.whatsapp || "",
          email: g.email || "",
          address: g.address || "",
          mapLink: g.mapLink || "",
          hours: hoursStr,
        });
      }

      // Collect dynamic social links
      const rawSocial = (data?.general?.socialLinks && data.general.socialLinks.length > 0)
        ? data.general.socialLinks
        : (data?.contact?.socialLinks && data.contact.socialLinks.length > 0)
          ? data.contact.socialLinks
          : [
              data?.general?.instagram ? { platform: "instagram", url: data.general.instagram } : null,
              data?.general?.facebook ? { platform: "facebook", url: data.general.facebook } : null,
              data?.general?.youtube ? { platform: "youtube", url: data.general.youtube } : null,
            ].filter(Boolean);

      const valid = rawSocial
        .map((s) => ({ ...s, safeUrl: getSocialLink(s.platform, s.url) }))
        .filter((s) => Boolean(s.safeUrl));

      setSocialLinks(valid);
    }
    loadData();
  }, []);

  /* Hide footer on dashboard pages */
  if (pathname?.startsWith("/dashboard") || pathname === "/login" || pathname === "/signup") {
    return null;
  }

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={`container ${styles.inner}`}>
        {/* Col 1: Brand */}
        <div className={styles.col}>
          <div className={styles.brand}>
            <span className={styles.brandIcon}>✦</span>
            <span className={styles.brandName}>{salonInfo.name}</span>
          </div>
          <p className={styles.tagline}>{salonInfo.tagline}</p>
          {socialLinks.length > 0 && (
            <div className={styles.social}>
              {socialLinks.map((s, idx) => (
                <a
                  key={idx}
                  href={s.safeUrl}
                  aria-label={s.platform || "Social Profile"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  title={s.platform ? s.platform.charAt(0).toUpperCase() + s.platform.slice(1) : "Social Profile"}
                >
                  {renderFooterSocialIcon(s.platform)}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Col 2: Quick Links */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>Quick Links</h3>
          <nav aria-label="Footer navigation">
            <ul className={styles.linkList}>
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={styles.link}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Col 3: Contact Info */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>Contact Us</h3>
          <ul className={styles.contactList}>
            {salonInfo.phone && (
              <li className={styles.contactItem}>
                <HiOutlinePhone size={16} className={styles.contactIcon} />
                {getPhoneLink(salonInfo.phone) ? (
                  <a href={getPhoneLink(salonInfo.phone)}>{salonInfo.phone}</a>
                ) : (
                  <span>{salonInfo.phone}</span>
                )}
              </li>
            )}
            {salonInfo.whatsapp && getWhatsAppLink(salonInfo.whatsapp) && (
              <li className={styles.contactItem}>
                <FaWhatsapp size={16} className={styles.contactIcon} style={{ color: "#25D366" }} />
                <a href={getWhatsAppLink(salonInfo.whatsapp)} target="_blank" rel="noopener noreferrer">
                  {salonInfo.whatsapp}
                </a>
              </li>
            )}
            {salonInfo.email && (
              <li className={styles.contactItem}>
                <HiOutlineMail size={16} className={styles.contactIcon} />
                {getMailtoLink(salonInfo.email) ? (
                  <a href={getMailtoLink(salonInfo.email)}>{salonInfo.email}</a>
                ) : (
                  <span>{salonInfo.email}</span>
                )}
              </li>
            )}
            {salonInfo.address && (
              <li className={styles.contactItem}>
                <HiOutlineLocationMarker size={16} className={styles.contactIcon} />
                {getMapLink(salonInfo.mapLink) ? (
                  <a href={getMapLink(salonInfo.mapLink)} target="_blank" rel="noopener noreferrer">
                    {salonInfo.address}
                  </a>
                ) : (
                  <span>{salonInfo.address}</span>
                )}
              </li>
            )}
            {salonInfo.hours && (
              <li className={styles.contactItem}>
                <HiOutlineClock size={16} className={styles.contactIcon} />
                <span>{salonInfo.hours}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottom}>
        <div className={`container ${styles.bottomInner}`}>
          <p className={styles.copyright}>
            © {year} {salonInfo.name}. All rights reserved.
          </p>
          <div className={styles.bottomLinks}>
            <Link href="/privacy">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
