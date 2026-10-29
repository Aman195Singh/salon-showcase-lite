"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

export const TOUR_DEFINITIONS = {
  gallery: [
    {
      targetId: "nav-gallery",
      title: "Step 1: Open Gallery in Header",
      description: "Click on 'Gallery' in the header navigation to view our master transformations.",
      actionLabel: "Click Gallery Tab →",
      path: "/",
      nextPath: "/gallery",
    },
    {
      targetId: "gallery-filter-tabs",
      title: "Step 2: Choose Service Category",
      description: "Filter by Hair, Skin, Bridal, Grooming, or Nails to explore specific luxury rituals.",
      actionLabel: "Next: View Photos →",
      path: "/gallery",
    },
    {
      targetId: "gallery-grid",
      title: "Step 3: Interactive Lightbox",
      description: "Tap any photo to view it in high-resolution full-screen lightbox with details.",
      actionLabel: "Finish Guide ✓",
      path: "/gallery",
      isLast: true,
    },
  ],
  services: [
    {
      targetId: "nav-services",
      title: "Step 1: Explore Services in Header",
      description: "Click on 'Services' in the navigation bar to see our complete treatment menu & prices.",
      actionLabel: "Click Services Tab →",
      path: "/",
      nextPath: "/services",
    },
    {
      targetId: "services-list-container",
      title: "Step 2: Browse Treatments & Pricing",
      description: "Explore all categorized rituals with transparent durations, prices, and direct booking.",
      actionLabel: "Finish Guide ✓",
      path: "/services",
      isLast: true,
    },
  ],
  contact: [
    {
      targetId: "nav-contact",
      title: "Step 1: Contact & Booking in Header",
      description: "Click on 'Contact' to find salon address, Google Map, phone, or send an enquiry.",
      actionLabel: "Click Contact Tab →",
      path: "/",
      nextPath: "/contact",
    },
    {
      targetId: "contact-form-card",
      title: "Step 2: Send Appointment Enquiry",
      description: "Fill this quick booking form. Our salon concierge will reach out to confirm your slot!",
      actionLabel: "Finish Guide ✓",
      path: "/contact",
      isLast: true,
    },
  ],
  about: [
    {
      targetId: "nav-about",
      title: "Step 1: About Aura Luxury Salon",
      description: "Learn about our philosophy, master stylists, and clinical hygiene standards.",
      actionLabel: "Finish Guide ✓",
      path: "/",
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

  const startTour = useCallback((tourName) => {
    if (!TOUR_DEFINITIONS[tourName]) return;
    setActiveTour(tourName);
    setStepIndex(0);
  }, []);

  const endTour = useCallback(() => {
    setActiveTour(null);
    setStepIndex(0);
  }, []);

  const currentSteps = activeTour ? TOUR_DEFINITIONS[activeTour] || [] : [];
  const currentStep = currentSteps[stepIndex] || null;

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
