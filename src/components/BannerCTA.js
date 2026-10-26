"use client";

import CTALink from "@/components/CTALink";
import { HiOutlinePhone } from "react-icons/hi";

/**
 * Client-side CTA banner button with analytics tracking.
 * Used inside the Server Component Home page bottom banner.
 */
export default function BannerCTA() {
  return (
    <CTALink href="/contact" ctaName="banner_contact_us" className="btn btn-primary btn-lg">
      <HiOutlinePhone size={18} />
      Contact Us
    </CTALink>
  );
}
