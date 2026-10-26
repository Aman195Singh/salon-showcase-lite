"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  HiOutlineHome,
  HiOutlineChartBar,
  HiOutlineCalendar,
  HiOutlineUserGroup,
  HiOutlineIdentification,
  HiOutlineClipboardCheck,
  HiOutlinePencilAlt,
  HiOutlineClipboardList,
  HiOutlineInbox,
  HiOutlineSupport,
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
} from "react-icons/hi";
import { useAuth } from "@/context/AuthContext";
import styles from "./dashboard.module.css";

// 1. Main Management Modules (Overview, Analytics)
const MAIN_MANAGEMENT_ITEMS = [
  { href: "/dashboard", icon: <HiOutlineHome size={20} />, label: "Overview", exact: true },
  { href: "/dashboard/analytics", icon: <HiOutlineChartBar size={20} />, label: "Analytics" },
];

// 2. Existing Website Management Modules (7 - 11)
const WEBSITE_MANAGEMENT_ITEMS = [
  { href: "/dashboard/edit", icon: <HiOutlinePencilAlt size={20} />, label: "Edit Website" },
  { href: "/dashboard/services", icon: <HiOutlineClipboardList size={20} />, label: "Services" },
  { href: "/dashboard/enquiries", icon: <HiOutlineInbox size={20} />, label: "Enquiries" },
  { href: "/dashboard/support", icon: <HiOutlineSupport size={20} />, label: "Support" },
  { href: "/dashboard/account", icon: <HiOutlineUser size={20} />, label: "Account" },
];

export default function DashboardShell({ children }) {
  const { user, profile, loading, isOwner, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Protect: Redirect if not authenticated or not owner
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (!isOwner) {
        router.push("/");
      }
    }
  }, [user, isOwner, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  // Show loading while checking auth
  if (loading || !user || !isOwner) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner} />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const isActive = (item) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <div className={styles.dashboardLayout}>
      {/* Mobile sidebar toggle */}
      <button
        className={styles.mobileToggle}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {sidebarOpen ? <HiOutlineX size={22} /> : <HiOutlineMenu size={22} />}
      </button>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
        {/* Brand */}
        <div className={styles.sidebarBrand}>
          <Link href="/" className={styles.brandLink}>
            <span className={styles.brandIcon}>✦</span>
            <span className={styles.brandText}>Salon</span>
          </Link>
          <span className={styles.brandBadge}>Admin</span>
        </div>

        {/* Nav */}
        <nav className={styles.sidebarNav} aria-label="Dashboard navigation">
          {/* Main Management Section */}
          <div className={styles.navSectionHeader}>Salon Management</div>
          {MAIN_MANAGEMENT_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive(item) ? styles.navItemActive : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}

          {/* Subtle Divider */}
          <div className={styles.navDivider} role="separator" />

          {/* Website Management Section */}
          <div className={styles.navSectionHeader}>Website & Account</div>
          {WEBSITE_MANAGEMENT_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive(item) ? styles.navItemActive : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User info + Sign Out */}
        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {profile?.full_name?.[0]?.toUpperCase() || "O"}
            </div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>{profile?.full_name || "Owner"}</span>
              <span className={styles.userRole}>Owner</span>
            </div>
          </div>
          <button onClick={handleSignOut} className={styles.signOutBtn} aria-label="Sign out">
            <HiOutlineLogout size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={styles.mainContent}>
        {children}
      </div>
    </div>
  );
}
