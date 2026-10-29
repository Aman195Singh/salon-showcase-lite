"use client";

import { useEffect, useState, useRef } from "react";
import { HiOutlineX, HiOutlineArrowRight, HiOutlineSparkles } from "react-icons/hi";
import { useTour } from "@/context/TourContext";
import styles from "./SpotlightTour.module.css";

export default function SpotlightTour() {
  const { activeTour, stepIndex, currentStep, totalSteps, nextStep, endTour } = useTour();
  const [targetRect, setTargetRect] = useState(null);
  const rafRef = useRef(null);

  // Position detection and tracking
  useEffect(() => {
    if (!activeTour || !currentStep) {
      setTargetRect(null);
      return;
    }

    let attempts = 0;
    const maxAttempts = 20;

    function measure() {
      const el = document.getElementById(currentStep.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        // If element is not in view, scroll gently
        if (rect.top < 0 || rect.bottom > window.innerHeight) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          bottom: rect.bottom,
          right: rect.right,
        });
      } else if (attempts < maxAttempts) {
        attempts++;
        rafRef.current = setTimeout(measure, 150);
      }
    }

    measure();

    const handleUpdate = () => {
      const el = document.getElementById(currentStep.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          bottom: rect.bottom,
          right: rect.right,
        });
      }
    };

    window.addEventListener("resize", handleUpdate, { passive: true });
    window.addEventListener("scroll", handleUpdate, { passive: true });

    return () => {
      if (rafRef.current) clearTimeout(rafRef.current);
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate);
    };
  }, [activeTour, currentStep, stepIndex]);

  if (!activeTour || !currentStep || !targetRect) return null;

  // Tooltip positioning logic (bottom by default, fallback to top)
  const padding = 8;
  const tooltipWidth = 320;
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 640;

  let tooltipLeft = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
  if (tooltipLeft < 16) tooltipLeft = 16;
  if (typeof window !== "undefined" && tooltipLeft + tooltipWidth > window.innerWidth - 16) {
    tooltipLeft = window.innerWidth - tooltipWidth - 16;
  }

  let tooltipTop = targetRect.bottom + 14;
  // If too close to bottom of screen, show above element
  if (typeof window !== "undefined" && tooltipTop + 180 > window.innerHeight) {
    tooltipTop = Math.max(16, targetRect.top - 180);
  }

  return (
    <>
      {/* Background Dimmer */}
      <div className={styles.tourBackdrop} onClick={endTour} />

      {/* Glowing Cutout Ring directly over target */}
      <div
        className={styles.spotlightRing}
        style={{
          top: `${targetRect.top - padding}px`,
          left: `${targetRect.left - padding}px`,
          width: `${targetRect.width + padding * 2}px`,
          height: `${targetRect.height + padding * 2}px`,
        }}
        onClick={nextStep}
        title="Click here or click Next"
      />

      {/* Floating Guided Tooltip Card */}
      <div
        className={styles.tooltipCard}
        style={{
          top: `${tooltipTop}px`,
          left: `${isMobile ? 16 : tooltipLeft}px`,
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
