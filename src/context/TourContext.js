"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

export const TOUR_DEFINITIONS = {
  home: [
    {
      targetId: "nav-home",
      title: "Step 1: Home & Landing Link",
      description: "Click 'Home' in the header navigation (or tap the salon logo at top-left) to visit the main showcase landing page.",
      actionLabel: "Visit Home Page →",
      path: "/services",
      nextPath: "/",
    },
    {
      targetId: "home-hero-section",
      title: "Step 2: Salon Showcase & Featured Rituals",
      description: "Welcome to our main showcase! Here you can view our signature atmosphere, explore featured rituals, and book appointments.",
      actionLabel: "Finish Guide ✓",
      path: "/",
      isLast: true,
    },
  ],
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
  profile: [
    {
      targetId: "nav-profile",
      title: "Step 1: Your Profile Avatar in Header",
      description: "Your Profile Icon is at the top-right corner of the header navigation! Click here to open your account menu, or proceed to Account Settings.",
      actionLabel: "Go to Account Settings →",
      nextPath: "/account",
    },
    {
      targetId: "account-tab-profile",
      title: "Step 2: Profile Picture & Display Name",
      description: "Under the 'Profile Info' tab, you can upload or change your profile picture and update your name.",
      actionLabel: "Next: Password Security →",
      path: "/account",
    },
    {
      targetId: "account-tab-security",
      title: "Step 3: Change Password & Security",
      description: "Under the 'Change Password' tab, you can enter a new password to keep your account secure.",
      actionLabel: "Next: My Enquiries →",
      path: "/account",
    },
    {
      targetId: "account-tab-history",
      title: "Step 4: Check Booking Enquiries",
      description: "Under 'My Enquiries', track all your submitted salon appointment requests and their confirmation status.",
      actionLabel: "Finish Guide ✓",
      path: "/account",
      isLast: true,
    },
  ],
  password: [
    {
      targetId: "nav-profile",
      title: "Step 1: Account Navigation in Header",
      description: "Your Profile Avatar is located at the top-right of the header. Access account settings from here.",
      actionLabel: "Open Security Tab →",
      nextPath: "/account",
    },
    {
      targetId: "account-tab-security",
      title: "Step 2: Change Password",
      description: "Click this tab to securely update your account password at any time.",
      actionLabel: "Finish Guide ✓",
      path: "/account",
      isLast: true,
    },
  ],
  inquiries: [
    {
      targetId: "nav-profile",
      title: "Step 1: Account Navigation in Header",
      description: "Click your profile avatar at the top-right of the header to open your account settings.",
      actionLabel: "Open My Enquiries →",
      nextPath: "/account",
    },
    {
      targetId: "account-tab-history",
      title: "Step 2: Review Booking Enquiries",
      description: "Check the status of all your submitted appointments, requested dates, and notes right here.",
      actionLabel: "Finish Guide ✓",
      path: "/account",
      isLast: true,
    },
  ],
  account: [
    {
      targetId: "nav-profile",
      title: "Step 1: Profile Icon & Member Access",
      description: "Your profile avatar icon is located at the top-right corner of the header navigation.",
      actionLabel: "Open Account Settings →",
      nextPath: "/account",
    },
    {
      targetId: "account-tab-profile",
      title: "Step 2: Manage Profile & Security",
      description: "Here you can update your avatar picture, change your password, and check booking inquiries.",
      actionLabel: "Finish Guide ✓",
      path: "/account",
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

  // Dynamic target resolution for account button (logged in profile avatar vs guest sign in)
  if (
    currentStep &&
    (currentStep.targetId === "nav-signin" || currentStep.targetId === "nav-profile") &&
    typeof document !== "undefined"
  ) {
    const hasProfile = Boolean(document.getElementById("nav-profile"));
    const hasSignIn = Boolean(document.getElementById("nav-signin"));

    if (currentStep.targetId === "nav-signin" && !hasSignIn && hasProfile) {
      currentStep = {
        ...currentStep,
        targetId: "nav-profile",
        title: "Your Member Profile Avatar",
        description: "You are currently signed in! Your avatar is located right here in the top-right of the header.",
      };
    } else if (currentStep.targetId === "nav-profile" && !hasProfile && hasSignIn) {
      currentStep = {
        ...currentStep,
        targetId: "nav-signin",
        title: "Member Sign In / Account",
        description: "Click Sign In here in the top-right corner to log into your account and access your profile.",
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
