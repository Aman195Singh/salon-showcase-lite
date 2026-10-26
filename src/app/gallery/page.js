"use client";

import { useState, useEffect } from "react";
import { HiOutlineX, HiOutlinePhotograph } from "react-icons/hi";
import { getPublishedContent, DEFAULT_CONTENT } from "@/lib/content";
import styles from "./gallery.module.css";

const CATEGORIES = ["All", "Hair", "Skin", "Bridal", "Grooming", "Nails", "Salon"];

export default function GalleryPage() {
  const [selected, setSelected] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [galleryContent, setGalleryContent] = useState(DEFAULT_CONTENT.gallery);

  useEffect(() => {
    async function loadContent() {
      try {
        const published = await getPublishedContent();
        if (published?.gallery?.images && published.gallery.images.length > 0) {
          setGalleryContent(published.gallery);
        }
      } catch (err) {
        console.warn("Failed to load published gallery, using defaults:", err);
      }
    }
    loadContent();
  }, []);

  // Close lightbox on Escape key for keyboard accessibility
  useEffect(() => {
    if (!selected) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelected(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected]);

  const images = galleryContent?.images || DEFAULT_CONTENT.gallery.images;
  const filteredImages = activeCategory === "All"
    ? images
    : images.filter((img) => img.category?.toLowerCase() === activeCategory.toLowerCase());

  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <span className="section-label">Gallery</span>
          <h1 className={styles.heroTitle}>{galleryContent?.heroTitle || "Our Work & Craft"}</h1>
          <p className={styles.heroDesc}>
            {galleryContent?.heroDesc || "A glimpse of our salon, our artistry, and the transformations we create for our clients every day."}
          </p>
        </div>
      </section>

      {/* Category Filter Pills */}
      <section className={styles.filterSection}>
        <div className="container">
          <div className={styles.filterList} role="tablist" aria-label="Filter gallery by service category">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={activeCategory === cat}
                className={`${styles.filterBtn} ${activeCategory === cat ? styles.filterBtnActive : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section">
        <div className="container">
          {filteredImages.length === 0 ? (
            <div className={styles.emptyGallery}>
              <HiOutlinePhotograph size={40} />
              <p>No photos in this category yet.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredImages.map((img, i) => (
                <button
                  key={img.id || i}
                  className={styles.gridItem}
                  onClick={() => setSelected(img)}
                  aria-label={`View: ${img.alt || img.caption || "Salon photo"}`}
                >
                  <img
                    src={img.src}
                    alt={img.alt || img.caption || "Salon photo"}
                    className={styles.galleryImg}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/hero-salon.jpg";
                    }}
                  />
                  <div className={styles.gridOverlay}>
                    {img.category && <span className={styles.categoryBadge}>{img.category}</span>}
                    <span className={styles.caption}>{img.caption}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {selected && (
        <div
          className={styles.lightbox}
          onClick={() => setSelected(null)}
          role="dialog"
          aria-modal="true"
          aria-label={selected.alt}
        >
          <button
            className={styles.closeBtn}
            onClick={() => setSelected(null)}
            aria-label="Close image preview"
          >
            <HiOutlineX size={28} />
          </button>

          <div
            className={styles.lightboxContent}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selected.src}
              alt={selected.alt}
              style={{
                maxWidth: "90vw",
                maxHeight: "80vh",
                borderRadius: "var(--radius-lg)",
                objectFit: "contain",
              }}
            />
            <p className={styles.lightboxCaption}>{selected.caption}</p>
          </div>
        </div>
      )}
    </>
  );
}
