"use client";

import Link from "next/link";
import { useCallback } from "react";

/**
 * A drop-in replacement for Next.js <Link> that also fires a CTA click
 * analytics event. Usage:
 *
 *   <CTALink href="/contact" ctaName="hero_book_visit" className="btn btn-primary">
 *     Book Now
 *   </CTALink>
 *
 * Props:
 *  - ctaName: a short, descriptive slug for the CTA (e.g. "hero_book_visit")
 *  - All other props are forwarded to <Link>
 */
export default function CTALink({ href, ctaName, children, onClick, ...rest }) {
  const handleClick = useCallback(
    (e) => {
      // Fire analytics event (non-blocking)
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: "cta_click",
          page_path: `cta:${ctaName || href}`,
        }),
      }).catch(() => {
        // Silent fail — never break navigation
      });

      // Call any existing onClick handler
      if (onClick) onClick(e);
    },
    [href, ctaName, onClick]
  );

  return (
    <Link href={href} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
