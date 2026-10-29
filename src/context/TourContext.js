"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

export const TOUR_DEFINITIONS = {
  gallery: [
    {
      targetId: "nav-gallery",
      title: "Step 1: Open Photo Gallery",
      description: "Click 'Gallery' in the header navigation to view our master transformations & salon work.",
      actionLabel: "View Gallery Tab →",
      path: "/",
      nextPath: "/gallery",
    },
    {
      targetId: "gallery-filter-tabs",
      title: "Step 2: Choose Service Category",
      description: "Filter by Hair, Skin, Bridal, Grooming, Nails, or Salon to explore specific rituals.",
      actionLabel: "Next: View Photos →",
      path: "/gallery",
    },
    {
      targetId: "gallery-grid",
      title: "Step 3: Interactive Lightbox",
      description: "Tap any photo to open high-resolution full-screen view with styling details.",
      actionLabel: "Finish Guide ✓",
      path: "/gallery",
      isLast: true,
    },
  ],
  services: [
    {
      targetId: "nav-services",
      title: "Step 1: Explore Services in Header",
      description: "Click on 'Services' to view our complete treatments menu with transparent pricing.",
      actionLabel: "Click Services Tab →",
      path: "/",
      nextPath: "/services",
    },
    {
      targetId: "services-list-container",
      title: "Step 2: Transparent Pricing & Enquiries",
      description: "Explore categorized rituals with exact durations, prices, and direct 'Enquire Now' buttons.",
      actionLabel: "Finish Guide ✓",
      path: "/services",
      isLast: true,
    },
  ],
  booking: [
    {
      targetId: "nav-contact",
      title: "Step 1: Appointment Desk",
      description: "Click 'Contact' to access our online booking and appointment request form.",
      actionLabel: "Open Booking Desk →",
      path: "/",
      nextPath: "/contact",
    },
    {
      targetId: "contact-form-card",
      title: "Step 2: Submit Appointment Request",
      description: "Fill this quick enquiry form with your name, phone, and preferred service. Our concierge will confirm your slot promptly!",
      actionLabel: "Finish Guide ✓",
      path: "/contact",
      isLast: true,
    },
  ],
  contact: [
    {
      targetId: "nav-contact",
      title: "Step 1: Reach Our Salon Desk",
      description: "Click 'Contact' in the navigation bar to see all direct contact methods and salon address.",
      actionLabel: "Click Contact Tab →",
      path: "/",
      nextPath: "/contact",
    },
    {
      targetId: "contact-direct-actions",
      title: "Step 2: Direct Phone & WhatsApp",
      description: "Tap to call our front desk directly or start an instant WhatsApp chat for quick availability.",
      actionLabel: "Next: Timings & Map →",
      path: "/contact",
    },
    {
      targetId: "contact-hours-card",
      title: "Step 3: Opening Hours & Map Directions",
      description: "Check our operational hours and tap the address to open Google Maps navigation.",
      actionLabel: "Finish Guide ✓",
      path: "/contact",
      isLast: true,
    },
  ],
  about: [
    {
      targetId: "nav-about",
      title: "Step 1: About Aura Luxury Salon",
      description: "Click 'About' in the header to learn about our story, philosophy, and master stylists.",
      actionLabel: "Click About Tab →",
      path: "/",
      nextPath: "/about",
    },
    {
      targetId: "about-story-section",
      title: "Step 2: Our Philosophy & Artistry",
      description: "Learn about our founding journey, certified stylists, and 100% organic international products.",
      actionLabel: "Next: Hygiene Standards →",
      path: "/about",
    },
    {
      targetId: "about-values-section",
      title: "Step 3: Clinical Hygiene Protocols",
      description: "We follow strict sterilization standards for tools, clean spaces, and personalized care.",
      actionLabel: "Finish Guide ✓",
      path: "/about",
      isLast: true,
    },
  ],
  account: [
    {
      targetId: "nav-signin",
      title: "Customer Account & Privileges",
      description: "Sign In or create your Member profile to manage appointments, preferences, and salon benefits.",
      actionLabel: "Finish Guide ✓",
      isLast: true,
    },
  ],
};

const TourContext = createContext({
  activeTour: null,
  stepIndex: 0,
  currentStep: null,
  startTour: () => {},
  nextStep: () => {},
  prevStep: () => {},
  endTour: () => {},
});

export function TourProvider({ children }) {
  const [activeTour, setActiveTour] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  const startTour = useCallback(
    (tourName) => {
      if (!TOUR_DEFINITIONS[tourName]) return;
      const steps = TOUR_DEFINITIONS[tourName];
      // If user is already on the target page of step 1, jump directly to step 2 on the page!
      if (steps.length > 1 && steps[0].nextPath && pathname === steps[0].nextPath) {
        setActiveTour(tourName);
        setStepIndex(1);
      } else {
        setActiveTour(tourName);
        setStepIndex(0);
      }
    },
    [pathname]
  );

  const endTour = useCallback(() => {
    setActiveTour(null);
    setStepIndex(0);
  }, []);

  const currentSteps = activeTour ? TOUR_DEFINITIONS[activeTour] || [] : [];
  let currentStep = currentSteps[stepIndex] || null;

  // Dynamic target resolution for account button (logged in profile vs guest sign in)
  if (currentStep && currentStep.targetId === "nav-signin" && typeof document !== "undefined") {
    if (!document.getElementById("nav-signin") && document.getElementById("nav-profile")) {
      currentStep = {
        ...currentStep,
        targetId: "nav-profile",
        title: "Your Member Profile",
        description: "You are currently signed in! Click your avatar to manage your account and security settings.",
      };
    }
  }

  const nextStep = useCallback(() => {
    if (!activeTour) return;
    const steps = TOUR_DEFINITIONS[activeTour] || [];
    const step = steps[stepIndex];

    if (step?.isLast || stepIndex >= steps.length - 1) {
      endTour();
      return;
    }

    if (step?.nextPath && pathname !== step.nextPath) {
      router.push(step.nextPath);
    }

    setStepIndex((prev) => prev + 1);
  }, [activeTour, stepIndex, pathname, router, endTour]);

  const prevStep = useCallback(() => {
    setStepIndex((prev) => Math.max(0, prev - 1));
  }, []);

  // Keyboard escape closes tour
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && activeTour) {
        endTour();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTour, endTour]);

  return (
    <TourContext.Provider
      value={{
        activeTour,
        stepIndex,
        currentStep,
        totalSteps: currentSteps.length,
        startTour,
        nextStep,
        prevStep,
        endTour,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  return useContext(TourContext);
}
