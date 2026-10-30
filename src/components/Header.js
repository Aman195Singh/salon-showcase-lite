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
        <Link id="nav-logo" href="/" className={styles.logo} aria-label="Home">
          <HiOutlineSparkles className={styles.logoIcon} size={18} />
          <span className={styles.logoText}>{salonName}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav} aria-label="Main navigation">
          {BASE_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              id={`nav-${link.label.toLowerCase()}`}
              href={link.href}
              className={`${styles.navLink} ${
                pathname === link.href ? styles.active : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Admin Action + User Profile + Mobile toggle */}
        <div className={styles.actions}>

          {/* Owner Quick Dashboard Access */}
          {isOwner && (
            <Link
              id="nav-admin"
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
                id="nav-profile"
                className={styles.profileAvatarBtn}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                aria-label="User Account Menu"
              >
                <div className={styles.avatarCircle}>
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={displayName}
                      className={styles.avatarImg}
                    />
                  ) : (
                    avatarLetter
                  )}
                </div>
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
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                      <div className={styles.avatarCircleSmall}>
                        {profile?.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt={displayName}
                            className={styles.avatarImg}
                          />
                        ) : (
                          avatarLetter
                        )}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div className={styles.dropdownUserName}>{displayName}</div>
                        <div className={styles.dropdownUserEmail}>{user.email}</div>
                      </div>
                    </div>
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
            <Link id="nav-signin" href="/login" className={styles.signInBtn}>
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
        {/* Top Profile Section in Drawer */}
        <div className={styles.mobileNavProfile}>
          <div className={styles.mobileAvatarCircle}>
            {user && profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className={styles.avatarImg}
              />
            ) : user ? (
              <span className={styles.avatarLetterLarge}>{avatarLetter}</span>
            ) : (
              <HiOutlineUser size={28} className={styles.guestIcon} />
            )}
          </div>
          <div className={styles.mobileUserName}>
            {user ? displayName : "Welcome, Guest"}
          </div>
          {user ? (
            <div className={styles.mobileUserSub}>
              <span>{user.email}</span>
              {isOwner && (
                <span className={styles.mobileRoleBadge}>👑 Owner</span>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className={styles.mobileSignInPrompt}
              onClick={() => setMenuOpen(false)}
            >
              Sign in or create account →
            </Link>
          )}
        </div>

        {/* Thoda Gap / Divider */}
        <div className={styles.mobileNavDivider} />

        {/* Saare Menu Tabs */}
        <div className={styles.mobileNavLinks}>
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
              className={`${styles.mobileLink} ${styles.mobileAdminLink}`}
              onClick={() => setMenuOpen(false)}
            >
              👑 Admin Dashboard
            </Link>
          )}

          {/* User Account / Profile link */}
          {user && (
            <Link
              href="/account"
              className={styles.mobileLink}
              onClick={() => setMenuOpen(false)}
            >
              ⚙️ My Account & Profile
            </Link>
          )}
        </div>

        {/* Baad me button book appointment ka */}
        <div className={styles.mobileCta}>
          <Link
            href="/contact"
            className="btn btn-primary btn-lg"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={() => setMenuOpen(false)}
          >
            <HiOutlineCalendar size={18} />
            Book Consultation
          </Link>

          {user && (
            <button
              onClick={handleSignOut}
              className={styles.mobileSignOutBtn}
            >
              <HiOutlineLogout size={16} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
