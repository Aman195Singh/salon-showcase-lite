"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineCalendar,
  HiOutlinePhone,
  HiOutlineUser,
  HiOutlineChevronDown,
  HiOutlineAdjustments,
  HiOutlineShieldCheck,
  HiOutlineLogout,
  HiOutlineSparkles,
} from "react-icons/hi";
import { getPublishedContent, DEFAULT_CONTENT } from "@/lib/content";
import { useAuth } from "@/context/AuthContext";
import styles from "./Header.module.css";

const BASE_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isOwner, signOut } = useAuth();

  const [salonName, setSalonName] = useState(DEFAULT_CONTENT.general.salonName);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    async function loadBrand() {
      const data = await getPublishedContent();
      if (data?.general?.salonName) {
        setSalonName(data.general.salonName);
      }
    }
    loadBrand();
  }, []);

  /* --- Shrink header on scroll --- */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* --- Close menu & dropdown on route change --- */
  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  /* --- Lock body scroll when mobile menu is open --- */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  /* --- Close dropdown when clicking outside --- */
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* --- Keyboard: close menu on Escape --- */
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") {
      setMenuOpen(false);
      setDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    if (menuOpen || dropdownOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [menuOpen, dropdownOpen, handleKeyDown]);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut();
    router.push("/");
  };

  /* Don't show public header on dashboard/login pages */
  if (
    pathname?.startsWith("/dashboard") ||
    pathname === "/login" ||
    pathname === "/signup"
  ) {
    return null;
  }

  // Display initial for avatar
  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <header
      className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}
      role="banner"
    >
      <div className={`container ${styles.inner}`}>
        {/* Logo / Salon Name */}
        <Link href="/" className={styles.logo} aria-label="Home">
          <HiOutlineSparkles className={styles.logoIcon} size={18} />
          <span className={styles.logoText}>{salonName}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav} aria-label="Main navigation">
          {BASE_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${
                pathname === link.href ? styles.active : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA + User Profile + Mobile toggle */}
        <div className={styles.actions}>
          {/* Prominent Primary Booking CTA */}
          <Link
            href="/contact"
            className={`btn btn-primary btn-sm ${styles.ctaBtn}`}
          >
            <HiOutlineCalendar size={16} />
            <span>Book Consultation</span>
          </Link>

          {/* Owner Quick Dashboard Access */}
          {isOwner && (
            <Link
              href="/dashboard"
              className={styles.adminActionBtn}
              title="Open Salon Owner Admin Panel"
            >
              <HiOutlineAdjustments size={15} />
              <span>Admin</span>
            </Link>
          )}

          {/* User Account / Profile Section */}
          {user ? (
            <div className={styles.profileTriggerWrapper} ref={dropdownRef}>
              <button
                className={styles.profileAvatarBtn}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                aria-label="User Account Menu"
              >
                <div className={styles.avatarCircle}>{avatarLetter}</div>
                <span className={styles.avatarNameShort}>{displayName}</span>
                <HiOutlineChevronDown
                  size={14}
                  className={`${styles.avatarChevron} ${
                    dropdownOpen ? styles.avatarChevronOpen : ""
                  }`}
                />
              </button>

              {/* Profile Dropdown */}
              {dropdownOpen && (
                <div className={styles.profileDropdown}>
                  <div className={styles.dropdownUserHeader}>
                    <div className={styles.dropdownUserName}>{displayName}</div>
                    <div className={styles.dropdownUserEmail}>{user.email}</div>
                    <div>
                      {isOwner ? (
                        <span className={styles.roleBadgeOwner}>
                          👑 Salon Owner
                        </span>
                      ) : (
                        <span className={styles.roleBadgeCustomer}>
                          👤 Member
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Links */}
                  {isOwner && (
                    <Link
                      href="/dashboard"
                      className={styles.dropdownItem}
                      onClick={() => setDropdownOpen(false)}
                    >
                      <HiOutlineAdjustments size={16} />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  <Link
                    href="/account"
                    className={styles.dropdownItem}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <HiOutlineShieldCheck size={16} />
                    <span>My Account & Security</span>
                  </Link>

                  <div className={styles.dropdownDivider} />

                  <button
                    onClick={handleSignOut}
                    className={`${styles.dropdownItem} ${styles.dropdownSignOut}`}
                  >
                    <HiOutlineLogout size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className={styles.signInBtn}>
              <HiOutlineUser size={16} />
              <span>Sign In</span>
            </Link>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            className={styles.menuToggle}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {menuOpen && (
        <div
          className={styles.overlay}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      <nav
        id="mobile-nav"
        className={`${styles.mobileNav} ${menuOpen ? styles.mobileNavOpen : ""}`}
        aria-label="Mobile navigation"
      >
        {BASE_NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.mobileLink} ${
              pathname === link.href ? styles.active : ""
            }`}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}

        {/* Admin Link on Mobile if Owner */}
        {isOwner && (
          <Link
            href="/dashboard"
            className={`${styles.mobileLink}`}
            style={{
              background: "rgba(245, 158, 11, 0.1)",
              color: "#b45309",
              fontWeight: "700",
            }}
            onClick={() => setMenuOpen(false)}
          >
            👑 Admin Panel
          </Link>
        )}

        {/* User Account / Sign In on Mobile */}
        {user ? (
          <>
            <Link
              href="/account"
              className={styles.mobileLink}
              onClick={() => setMenuOpen(false)}
            >
              👤 My Account ({displayName})
            </Link>
            <button
              onClick={handleSignOut}
              className={styles.mobileLink}
              style={{
                textAlign: "left",
                background: "none",
                border: "none",
                color: "#dc2626",
                cursor: "pointer",
                width: "100%",
              }}
            >
              🚪 Sign Out
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className={styles.mobileLink}
            onClick={() => setMenuOpen(false)}
          >
            🔑 Sign In / Register
          </Link>
        )}

        <div className={styles.mobileCta}>
          <Link
            href="/contact"
            className="btn btn-primary btn-lg"
            style={{ width: "100%" }}
            onClick={() => setMenuOpen(false)}
          >
            <HiOutlineCalendar size={18} />
            Book Consultation
          </Link>
        </div>
      </nav>
    </header>
  );
}
