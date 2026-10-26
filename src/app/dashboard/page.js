"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  HiOutlineEye,
  HiOutlineInbox,
  HiOutlineCursorClick,
  HiOutlineClipboardList,
  HiOutlineArrowRight,
} from "react-icons/hi";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import styles from "./overview.module.css";

export default function DashboardOverview() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    pageViews: 0,
    enquiries: 0,
    newEnquiries: 0,
    services: 0,
  });
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Count analytics page views (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const { count: viewCount } = await supabase
          .from("analytics_events")
          .select("*", { count: "exact", head: true })
          .eq("event_type", "page_view")
          .gte("created_at", thirtyDaysAgo.toISOString());

        // Count enquiries
        const { count: enquiryCount } = await supabase
          .from("enquiries")
          .select("*", { count: "exact", head: true });

        const { count: newCount } = await supabase
          .from("enquiries")
          .select("*", { count: "exact", head: true })
          .eq("status", "New");

        // Count services
        const { count: serviceCount } = await supabase
          .from("services")
          .select("*", { count: "exact", head: true });

        // Recent enquiries (last 5)
        const { data: recent } = await supabase
          .from("enquiries")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);

        setStats({
          pageViews: viewCount || 0,
          enquiries: enquiryCount || 0,
          newEnquiries: newCount || 0,
          services: serviceCount || 0,
        });
        setRecentEnquiries(recent || []);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{greeting()}, {profile?.full_name || "Owner"} 👋</h1>
          <p className={styles.subtitle}>Here&apos;s what&apos;s happening with your salon</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
            <HiOutlineEye size={22} />
          </div>
          <div>
            <span className={styles.statValue}>{loading ? "—" : stats.pageViews}</span>
            <span className={styles.statLabel}>Page Views (30 days)</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
            <HiOutlineInbox size={22} />
          </div>
          <div>
            <span className={styles.statValue}>{loading ? "—" : stats.enquiries}</span>
            <span className={styles.statLabel}>Total Enquiries</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconOrange}`}>
            <HiOutlineCursorClick size={22} />
          </div>
          <div>
            <span className={styles.statValue}>{loading ? "—" : stats.newEnquiries}</span>
            <span className={styles.statLabel}>New (Unread)</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconPurple}`}>
            <HiOutlineClipboardList size={22} />
          </div>
          <div>
            <span className={styles.statValue}>{loading ? "—" : stats.services}</span>
            <span className={styles.statLabel}>Active Services</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.actionsGrid}>
          <Link href="/dashboard/edit" className={styles.actionCard}>
            <span>Edit Website Content</span>
            <HiOutlineArrowRight size={16} />
          </Link>
          <Link href="/dashboard/services" className={styles.actionCard}>
            <span>Manage Services</span>
            <HiOutlineArrowRight size={16} />
          </Link>
          <Link href="/dashboard/enquiries" className={styles.actionCard}>
            <span>View Enquiries</span>
            <HiOutlineArrowRight size={16} />
          </Link>
          <Link href="/dashboard/analytics" className={styles.actionCard}>
            <span>View Analytics</span>
            <HiOutlineArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Recent Enquiries */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Enquiries</h2>
          <Link href="/dashboard/enquiries" className={styles.seeAll}>
            See All <HiOutlineArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <p className={styles.emptyText}>Loading...</p>
        ) : recentEnquiries.length === 0 ? (
          <div className={styles.emptyState}>
            <HiOutlineInbox size={32} />
            <p>No enquiries yet. They&apos;ll appear here when visitors submit the contact form.</p>
          </div>
        ) : (
          <div className={styles.enquiryList}>
            {recentEnquiries.map((eq) => (
              <div key={eq.id} className={styles.enquiryRow}>
                <div className={styles.enquiryInfo}>
                  <span className={styles.enquiryName}>{eq.name}</span>
                  <span className={styles.enquiryMsg}>{eq.message?.substring(0, 80)}...</span>
                </div>
                <span className={`${styles.enquiryStatus} ${styles[`status${eq.status.replace(/\s/g, "")}`]}`}>
                  {eq.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
