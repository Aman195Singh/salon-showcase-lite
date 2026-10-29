"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FAQChatbot from "@/components/FAQChatbot";
import SpotlightTour from "@/components/SpotlightTour";
import { TourProvider } from "@/context/TourContext";

/**
 * Conditionally shows Header/Footer, FAQChatbot, and SpotlightTour based on the current route.
 * Dashboard, login, and signup pages have their own layouts.
 */
export default function ConditionalLayout({ children }) {
  const pathname = usePathname();

  const hideHeaderFooter =
    pathname?.startsWith("/dashboard") ||
    pathname === "/login" ||
    pathname === "/signup";

  if (hideHeaderFooter) {
    return <>{children}</>;
  }

  return (
    <TourProvider>
      <a href="#main-content" className="skipToContent">
        Skip to main content
      </a>
      <Header />
      <main id="main-content" style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
      <FAQChatbot />
      <SpotlightTour />
    </TourProvider>
  );
}

