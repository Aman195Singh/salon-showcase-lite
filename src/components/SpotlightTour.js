"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  HiOutlineX,
  HiOutlineArrowRight,
  HiOutlineSparkles,
  HiOutlineEye,
} from "react-icons/hi";
import { useTour } from "@/context/TourContext";
import styles from "./SpotlightTour.module.css";

export default function SpotlightTour() {
  const { activeTour, stepIndex, currentStep, totalSteps, nextStep, endTour } = useTour();
  const [targetRect, setTargetRect] = useState(null);
  const [isOffscreen, setIsOffscreen] = useState(false);
  const rafId = useRef(null);

  // Measure target element coordinates relative to viewport
  const updateRect = useCallback(() => {
    if (!currentStep?.targetId) return;
    const el = document.getElementById(currentStep.targetId);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const off = rect.bottom <= 0 || rect.top >= window.innerHeight;
    setIsOffscreen(off);

    setTargetRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      bottom: rect.bottom,
      right: rect.right,
    });
  }, [currentStep]);

  // When step changes: find element, scroll into view ONCE, and update rect
  useEffect(() => {
    if (!activeTour || !currentStep) {
      setTargetRect(null);
      setIsOffscreen(false);
      return;
    }

    let attempts = 0;
    const maxAttempts = 30;
    let initialTimer;

    function findAndScroll() {
      const el = document.getElementById(currentStep.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        // Gently bring into view ONCE on step change
        if (rect.top < 80 || rect.bottom > window.innerHeight - 80) {
          el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        }
        updateRect();
      } else if (attempts < maxAttempts) {
        attempts++;
        initialTimer = setTimeout(findAndScroll, 120);
      }
    }

    findAndScroll();

    // Fast, zero-drift scroll and resize listeners using requestAnimationFrame
    const onScrollOrResize = () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(updateRect);
    };

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    return () => {
      if (initialTimer) clearTimeout(initialTimer);
      if (rafId.current) cancelAnimationFrame(rafId.current);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [activeTour, currentStep, stepIndex, updateRect]);

  const scrollToTarget = () => {
    if (!currentStep?.targetId) return;
    const el = document.getElementById(currentStep.targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      setTimeout(updateRect, 300);
    }
  };

  if (!activeTour || !currentStep || !targetRect) return null;

  // Tooltip positioning (clamped inside viewport to prevent overflow)
  const padding = 8;
  const tooltipWidth = 320;
  const tooltipEstimatedHeight = 210;
  const winWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
  const winHeight = typeof window !== "undefined" ? window.innerHeight : 800;
  const isMobile = winWidth <= 640;

  // Horizontal position centered on target, clamped between margins
  let tooltipLeft = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
  tooltipLeft = Math.max(16, Math.min(winWidth - tooltipWidth - 16, tooltipLeft));

  // Vertical position: below target if fits, else above target, clamped inside viewport
  let tooltipTop = targetRect.bottom + 12;
  if (tooltipTop + tooltipEstimatedHeight > winHeight - 16) {
    tooltipTop = targetRect.top - tooltipEstimatedHeight - 12;
  }
  tooltipTop = Math.max(16, Math.min(winHeight - tooltipEstimatedHeight - 16, tooltipTop));

  return (
    <>
      {/* Background Dimmer */}
      <div className={styles.tourBackdrop} onClick={endTour} />

      {/* Glowing Cutout Ring directly over target (position: fixed, zero drift) */}
      <div
        className={styles.spotlightRing}
        style={{
          top: `${Math.round(targetRect.top - padding)}px`,
          left: `${Math.round(targetRect.left - padding)}px`,
          width: `${Math.round(targetRect.width + padding * 2)}px`,
          height: `${Math.round(targetRect.height + padding * 2)}px`,
        }}
        onClick={nextStep}
        title="Click here or click Next Step"
      />

      {/* Floating Guided Tooltip Card */}
      <div
        className={styles.tooltipCard}
        style={{
          top: `${Math.round(tooltipTop)}px`,
          left: `${isMobile ? 16 : Math.round(tooltipLeft)}px`,
          right: isMobile ? 16 : "auto",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Salon Feature Guide"
      >
        <div className={styles.tooltipHeader}>
          <span className={styles.stepBadge}>
            <HiOutlineSparkles size={13} />
            Step {stepIndex + 1} of {totalSteps}
          </span>
          <button className={styles.closeBtn} onClick={endTour} aria-label="Close Guide">
            <HiOutlineX size={16} />
          </button>
        </div>

        <h4 className={styles.tooltipTitle}>{currentStep.title}</h4>
        <p className={styles.tooltipDesc}>{currentStep.description}</p>

        {isOffscreen && (
          <button
            type="button"
            className={styles.recenterBtn}
            onClick={scrollToTarget}
          >
            <HiOutlineEye size={14} />
            <span>Target is off-screen • Scroll to view</span>
          </button>
        )}

        <div className={styles.tooltipFooter}>
          <button className={styles.skipBtn} onClick={endTour}>
            Exit Tour
          </button>
          <button className={styles.actionBtn} onClick={nextStep}>
            <span>{currentStep.actionLabel}</span>
            <HiOutlineArrowRight size={14} />
          </button>
        </div>
      </div>
    </>
  );
}
