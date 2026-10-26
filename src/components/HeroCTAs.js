"use client";

import CTALink from "@/components/CTALink";
import { HiOutlineCalendar, HiOutlineArrowRight } from "react-icons/hi";

/**
 * Client-side hero CTA buttons with analytics tracking.
 * Used inside the Server Component Home page.
 */
export default function HeroCTAs({ cta, ctaSecondary }) {
  return (
    <>
      <CTALink href="/contact" ctaName="hero_book_visit" className="btn btn-primary btn-lg">
        <HiOutlineCalendar size={18} />
        {cta || "Book Consultation"}
      </CTALink>
      <CTALink
        href="/services"
        ctaName="hero_explore_services"
        className="btn btn-secondary btn-lg"
        style={{ borderColor: "#fff", color: "#fff" }}
      >
        {ctaSecondary}
        <HiOutlineArrowRight size={16} />
      </CTALink>
    </>
  );
}
