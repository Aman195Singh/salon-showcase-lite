"use client";

import { useEffect, useState, useCallback } from "react";
import {
  HiOutlineChartBar,
  HiOutlineEye,
  HiOutlineCursorClick,
  HiOutlineInbox,
  HiOutlineGlobeAlt,
  HiOutlineCalendar,
  HiOutlineInformationCircle,
} from "react-icons/hi";
import { supabase } from "@/lib/supabase";
import styles from "./analytics.module.css";

const RANGE_OPTIONS = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 30 days", value: 30 },
  { label: "Last 90 days", value: 90 },
];

export default function AnalyticsPage() {
  const [range, setRange] = useState(30);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [data, setData] = useState({
    totalViews: 0,
    ctaClicks: 0,
    enquirySubmissions: 0,
    topPages: [],
    dailyViews: [],
    referrers: [],
  });

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const since = new Date();
      since.setDate(since.getDate() - range);
      const sinceISO = since.toISOString();

      // Fetch all events in the range
      const { data: events, error } = await supabase
        .from("analytics_events")
        .select("event_type, page_path, referrer, created_at")
        .gte("created_at", sinceISO)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const allEvents = events || [];

      // Total page views
      const pageViews = allEvents.filter((e) => e.event_type === "page_view");
      const totalViews = pageViews.length;

      // CTA clicks
      const ctaClicks = allEvents.filter(
        (e) => e.event_type === "cta_click"
      ).length;

      // Enquiry submissions
      const enquirySubmissions = allEvents.filter(
        (e) => e.event_type === "enquiry_submit"
      ).length;

      // Top pages — count views per page_path
      const pageCounts = {};
      pageViews.forEach((e) => {
        const path = e.page_path || "(unknown)";
        pageCounts[path] = (pageCounts[path] || 0) + 1;
      });
      const topPages = Object.entries(pageCounts)
        .map(([page, count]) => ({ page, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      // Daily page views — group by date
      const dailyCounts = {};
      pageViews.forEach((e) => {
        const day = e.created_at.substring(0, 10); // "YYYY-MM-DD"
        dailyCounts[day] = (dailyCounts[day] || 0) + 1;
      });

      // Fill all days in the range (even 0-view days)
      const dailyViews = [];
      const cursor = new Date(since);
      const today = new Date();
      while (cursor <= today) {
        const key = cursor.toISOString().substring(0, 10);
        dailyViews.push({ date: key, count: dailyCounts[key] || 0 });
        cursor.setDate(cursor.getDate() + 1);
      }

      // Referrers — group by source
      const refCounts = {};
      pageViews.forEach((e) => {
        let source = "Direct / Unknown";
        if (e.referrer) {
          try {
            source = new URL(e.referrer).hostname;
          } catch {
            source = e.referrer.substring(0, 50);
          }
        }
        refCounts[source] = (refCounts[source] || 0) + 1;
      });
      const referrers = Object.entries(refCounts)
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      setData({
        totalViews,
        ctaClicks,
        enquirySubmissions,
        topPages,
        dailyViews,
        referrers,
      });
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      setLoadError("Unable to load analytics data. Please check your database connection or permissions.");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Find the max value in dailyViews for scaling bars
  const maxDaily = Math.max(...data.dailyViews.map((d) => d.count), 1);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  return (
    <div>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Analytics</h1>
          <p className={styles.subtitle}>
            Website traffic, visitor insights, and engagement metrics.
          </p>
        </div>
        <div className={styles.rangeSelector} role="group" aria-label="Select analytics timeframe">
          <HiOutlineCalendar size={16} />
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", fontWeight: "600", marginRight: "4px" }}>
            Timeframe:
          </span>
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`${styles.rangeBtn} ${
                range === opt.value ? styles.rangeBtnActive : ""
              }`}
              onClick={() => setRange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loadError && (
        <div style={{
          marginBottom: "var(--space-6)",
          padding: "var(--space-4) var(--space-6)",
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: "var(--radius-lg)",
          color: "var(--color-danger, #ef4444)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-4)"
        }}>
          <span>{loadError}</span>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={fetchAnalytics}
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading analytics data...</p>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
                <HiOutlineEye size={22} />
              </div>
              <div>
                <span className={styles.statValue}>{data.totalViews}</span>
                <span className={styles.statLabel}>Total Page Views</span>
                <span className={styles.statDesc}>Public page visits</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.statIconOrange}`}>
                <HiOutlineCursorClick size={22} />
              </div>
              <div>
                <span className={styles.statValue}>{data.ctaClicks}</span>
                <span className={styles.statLabel}>Button & Link Clicks</span>
                <span className={styles.statDesc}>Calls, WhatsApp & directions</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
                <HiOutlineInbox size={22} />
              </div>
              <div>
                <span className={styles.statValue}>
                  {data.enquirySubmissions}
                </span>
                <span className={styles.statLabel}>Contact Inquiries</span>
                <span className={styles.statDesc}>
                  {data.totalViews > 0
                    ? `${((data.enquirySubmissions / data.totalViews) * 100).toFixed(1)}% conversion`
                    : "Form submissions"}
                </span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.statIconPurple}`}>
                <HiOutlineGlobeAlt size={22} />
              </div>
              <div>
                <span className={styles.statValue}>
                  {data.referrers.length}
                </span>
                <span className={styles.statLabel}>Traffic Sources</span>
                <span className={styles.statDesc}>Channels sending visitors</span>
              </div>
            </div>
          </div>

          {/* Page Views Chart */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <div>
                <h2 className={styles.chartTitle}>
                  <HiOutlineChartBar size={18} /> Daily Page Views
                </h2>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginTop: "2px", display: "block" }}>
                  Tracking daily traffic across the last {range} days
                </span>
              </div>
            </div>

            {data.totalViews === 0 ? (
              <div className={styles.emptyChart}>
                <p>No website visits recorded in the last {range} days.</p>
              </div>
            ) : (
              <div className={styles.chartContainer}>
                <div className={styles.barChart}>
                  {data.dailyViews.map((day, i) => (
                    <div key={day.date} className={styles.barGroup}>
                      <div className={styles.barTooltip}>
                        <span className={styles.tooltipCount}>
                          {day.count} view{day.count !== 1 ? "s" : ""}
                        </span>
                        <span className={styles.tooltipDate}>
                          {formatDate(day.date)}
                        </span>
                      </div>
                      <div
                        className={styles.bar}
                        style={{
                          height: `${Math.max(
                            (day.count / maxDaily) * 100,
                            2
                          )}%`,
                        }}
                      />
                      {/* Show label every few bars depending on range */}
                      {(range <= 7 ||
                        (range <= 30 && i % 3 === 0) ||
                        (range > 30 && i % 7 === 0)) && (
                        <span className={styles.barLabel}>
                          {formatDate(day.date)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Two column: Top Pages + Traffic Sources */}
          <div className={styles.twoCol}>
            {/* Top Pages */}
            <div className={styles.listCard}>
              <h2 className={styles.listTitle}>Most Viewed Pages</h2>
              {data.topPages.length === 0 ? (
                <p className={styles.emptyText}>No page data yet.</p>
              ) : (
                <div className={styles.listItems}>
                  {data.topPages.map((p, i) => (
                    <div key={p.page} className={styles.listRow}>
                      <span className={styles.listRank}>{i + 1}</span>
                      <span className={styles.listPage}>{p.page}</span>
                      <div className={styles.listBarWrapper}>
                        <div
                          className={styles.listBar}
                          style={{
                            width: `${
                              (p.count /
                                (data.topPages[0]?.count || 1)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <span className={styles.listCount}>{p.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Traffic Sources */}
            <div className={styles.listCard}>
              <h2 className={styles.listTitle}>Traffic Sources</h2>
              {data.referrers.length === 0 ? (
                <p className={styles.emptyText}>No referrer data yet.</p>
              ) : (
                <div className={styles.listItems}>
                  {data.referrers.map((r, i) => (
                    <div key={r.source} className={styles.listRow}>
                      <span className={styles.listRank}>{i + 1}</span>
                      <span className={styles.listPage}>{r.source}</span>
                      <div className={styles.listBarWrapper}>
                        <div
                          className={styles.listBar}
                          style={{
                            width: `${
                              (r.count /
                                (data.referrers[0]?.count || 1)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <span className={styles.listCount}>{r.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Limitations Notice */}
          <div className={styles.notice}>
            <HiOutlineInformationCircle size={18} />
            <div>
              <strong>Analytics Limitations</strong>
              <p>
                These counts are first-party, privacy-friendly metrics with no
                cookies. They may undercount due to ad blockers, multiple tabs,
                or bot traffic. &ldquo;Page Views&rdquo; counts every page load
                (including repeat visits by the same visitor). CTA clicks are
                only tracked when the tracking code fires successfully.
                Referrer data may be empty if the browser strips it. Dashboard
                and login pages are excluded from tracking.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
