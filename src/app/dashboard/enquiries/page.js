"use client";

import { useEffect, useState } from "react";
import {
  HiOutlineInbox,
  HiOutlineSearch,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineChatAlt2,
  HiOutlineClipboardCopy,
  HiOutlineCheck,
  HiOutlineX,
} from "react-icons/hi";
import { supabase } from "@/lib/supabase";
import {
  isValidPhone,
  isValidWhatsApp,
  isValidEmail,
  getPhoneLink,
  getWhatsAppLink,
} from "@/lib/contact";
import styles from "./enquiries.module.css";

const DATE_OPTIONS = [
  { label: "All time", value: "all" },
  { label: "Today", value: "today" },
  { label: "Last 7 days", value: "7days" },
  { label: "Last 30 days", value: "30days" },
];

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [statusAlert, setStatusAlert] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Reply via Email composer modal state
  const [replyModal, setReplyModal] = useState({
    isOpen: false,
    enquiry: null,
    to: "",
    subject: "",
    body: "",
  });
  const [copyFeedback, setCopyFeedback] = useState(null);

  const fetchEnquiries = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      let query = supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setEnquiries(data || []);
    } catch (err) {
      console.error("Error fetching enquiries:", err);
      setLoadError("Unable to load enquiries. Please check your connection or database permissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter]);

  const updateStatus = async (id, newStatus) => {
    const prevEnquiries = [...enquiries];
    const target = enquiries.find((eq) => eq.id === id);
    if (!target) return;

    // Optimistic update
    setEnquiries((prev) =>
      prev.map((eq) => (eq.id === id ? { ...eq, status: newStatus } : eq))
    );
    setStatusAlert(null);

    try {
      const { error } = await supabase
        .from("enquiries")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      setStatusAlert({
        type: "success",
        message: `Status updated to "${newStatus}" for ${target.name}.`,
      });
      setTimeout(() => setStatusAlert(null), 3500);
    } catch (err) {
      console.error("Error updating status:", err);
      // Roll back
      setEnquiries(prevEnquiries);
      setStatusAlert({
        type: "error",
        message: `Failed to update status for ${target.name}: ${err.message || "Network or permission error"}`,
      });
    }
  };

  // Open Reply Modal
  const openReplyModal = (eq) => {
    const defaultSubject = `Re: Enquiry from Salon - ${eq.name}`;
    const defaultBody = `Dear ${eq.name},\n\nThank you for getting in touch with our salon. Regarding your enquiry:\n"${eq.message}"\n\n\n\nBest regards,\nSalon Team`;
    setReplyModal({
      isOpen: true,
      enquiry: eq,
      to: eq.email || "",
      subject: defaultSubject,
      body: defaultBody,
    });
  };

  const closeReplyModal = () => {
    setReplyModal({
      isOpen: false,
      enquiry: null,
      to: "",
      subject: "",
      body: "",
    });
    setCopyFeedback(null);
  };

  // Open mailto in external client
  const handleOpenEmailApp = () => {
    if (!replyModal.to) return;
    const mailtoUrl = `mailto:${encodeURIComponent(replyModal.to)}?subject=${encodeURIComponent(replyModal.subject)}&body=${encodeURIComponent(replyModal.body)}`;
    window.location.href = mailtoUrl;
    setStatusAlert({
      type: "success",
      message: "Opening your email app. Note: Please review and send your message from your email application.",
    });
    setTimeout(() => setStatusAlert(null), 5000);
  };

  // Copy email details as fallback
  const handleCopyReplyDetails = async () => {
    const textToCopy = `To: ${replyModal.to}\nSubject: ${replyModal.subject}\n\n${replyModal.body}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopyFeedback("Email details copied to clipboard!");
      setTimeout(() => setCopyFeedback(null), 3000);
    } catch {
      setCopyFeedback("Unable to copy to clipboard.");
    }
  };

  // Copy enquiry text from card
  const handleCopyEnquiry = async (eq) => {
    const text = `Name: ${eq.name}\nPhone: ${eq.phone || "N/A"}\nEmail: ${eq.email || "N/A"}\nDate: ${formatDate(eq.created_at)}\nStatus: ${eq.status}\nMessage: ${eq.message}`;
    try {
      await navigator.clipboard.writeText(text);
      setStatusAlert({
        type: "success",
        message: `Copied enquiry details for ${eq.name} to clipboard.`,
      });
      setTimeout(() => setStatusAlert(null), 3000);
    } catch {
      setStatusAlert({
        type: "error",
        message: "Failed to copy enquiry details.",
      });
    }
  };

  const matchesDate = (createdAt) => {
    if (dateFilter === "all") return true;
    const created = new Date(createdAt);
    const now = new Date();
    if (dateFilter === "today") {
      return created.toDateString() === now.toDateString();
    }
    if (dateFilter === "7days") {
      const diffTime = now.getTime() - created.getTime();
      return diffTime <= 7 * 24 * 60 * 60 * 1000;
    }
    if (dateFilter === "30days") {
      const diffTime = now.getTime() - created.getTime();
      return diffTime <= 30 * 24 * 60 * 60 * 1000;
    }
    return true;
  };

  const filtered = enquiries.filter((eq) => {
    if (!matchesDate(eq.created_at)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      eq.name?.toLowerCase().includes(q) ||
      eq.email?.toLowerCase().includes(q) ||
      eq.phone?.includes(q) ||
      eq.message?.toLowerCase().includes(q)
    );
  });

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <h1 className={styles.pageTitle}>Enquiries</h1>
      <p className={styles.pageDesc}>
        Manage contact form submissions and reply directly to client requests.
      </p>

      {/* Status Action Feedback Alert */}
      {statusAlert && (
        <div
          className={
            statusAlert.type === "success"
              ? styles.alertBannerSuccess
              : styles.alertBannerError
          }
          role="status"
        >
          {statusAlert.message}
        </div>
      )}

      {/* Filters Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <HiOutlineSearch size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={`form-input ${styles.searchInput}`}
            placeholder="Search by name, email, phone, message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status Filters */}
        <div className={styles.filters} role="group" aria-label="Status filter">
          {["all", "New", "In Progress", "Resolved"].map((s) => (
            <button
              key={s}
              className={`${styles.filterBtn} ${statusFilter === s ? styles.filterActive : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === "all" ? "All Statuses" : s}
            </button>
          ))}
        </div>

        {/* Date Filters */}
        <div className={styles.filters} role="group" aria-label="Date filter">
          {DATE_OPTIONS.map((d) => (
            <button
              key={d.value}
              className={`${styles.filterBtn} ${dateFilter === d.value ? styles.filterActive : ""}`}
              onClick={() => setDateFilter(d.value)}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <p className={styles.loadingText}>Loading enquiries...</p>
      ) : loadError ? (
        <div className={styles.errorBox}>
          <p>{loadError}</p>
          <button
            type="button"
            onClick={fetchEnquiries}
            className={styles.retryBtn}
          >
            Try Again
          </button>
        </div>
      ) : enquiries.length === 0 ? (
        <div className={styles.emptyState}>
          <HiOutlineInbox size={40} />
          <p>No customer enquiries received yet.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <HiOutlineInbox size={40} />
          <p>No enquiries match your search or filter criteria.</p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setDateFilter("all");
            }}
            className={styles.resetBtn}
            style={{ marginTop: "12px" }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((eq) => {
            const hasValidPhone = isValidPhone(eq.phone);
            const hasValidWhatsApp = isValidWhatsApp(eq.phone);
            const hasValidEmail = isValidEmail(eq.email);

            return (
              <div key={eq.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.cardName}>{eq.name}</h3>
                    <span className={styles.cardDate}>{formatDate(eq.created_at)}</span>
                  </div>
                  <select
                    className={styles.statusSelect}
                    value={eq.status}
                    onChange={(e) => updateStatus(eq.id, e.target.value)}
                    aria-label={`Change status for ${eq.name}`}
                  >
                    <option value="New">New</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <div className={styles.cardContact}>
                  {eq.phone && (
                    <span>
                      <HiOutlinePhone size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                      {eq.phone}
                    </span>
                  )}
                  {eq.email && (
                    <span>
                      <HiOutlineMail size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                      {eq.email}
                    </span>
                  )}
                </div>

                <p className={styles.cardMessage}>{eq.message}</p>

                {/* Quick Actions (Rendered only with valid contact data) */}
                <div className={styles.cardActions}>
                  {hasValidPhone && (
                    <a
                      href={getPhoneLink(eq.phone)}
                      className={styles.actionBtn}
                      title={`Call ${eq.phone}`}
                    >
                      <HiOutlinePhone size={14} /> Call
                    </a>
                  )}

                  {hasValidWhatsApp && (
                    <a
                      href={getWhatsAppLink(eq.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.actionBtn}
                      title="Open WhatsApp chat"
                    >
                      <HiOutlineChatAlt2 size={14} /> WhatsApp
                    </a>
                  )}

                  {hasValidEmail && (
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() => openReplyModal(eq)}
                      title={`Reply via email to ${eq.email}`}
                    >
                      <HiOutlineMail size={14} /> Reply via Email
                    </button>
                  )}

                  <button
                    type="button"
                    className={styles.actionBtnSecondary}
                    onClick={() => handleCopyEnquiry(eq)}
                    title="Copy enquiry text"
                  >
                    <HiOutlineClipboardCopy size={14} /> Copy Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reply via Email Modal (PRD §4.5) */}
      {replyModal.isOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="reply-modal-title">
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div>
                <h2 id="reply-modal-title" className={styles.modalTitle}>Reply via Email</h2>
                <p className={styles.modalSubtitle}>
                  Draft an email response to {replyModal.enquiry?.name} ({replyModal.to})
                </p>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={closeReplyModal}
                aria-label="Close reply modal"
              >
                <HiOutlineX size={20} />
              </button>
            </div>

            <div className={styles.modalNotice}>
              ℹ️ <strong>Zero-Setup Email:</strong> Clicking &ldquo;Open Email App&rdquo; will open your default email client (such as Outlook, Gmail, or Apple Mail) with the To, Subject, and Body fields ready. No email is sent directly by the website server, and this will not automatically mark the inquiry as Resolved.
            </div>

            {copyFeedback && (
              <div className={styles.alertBannerSuccess} style={{ margin: 0 }}>
                {copyFeedback}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="reply-to" className="form-label">To (Recipient)</label>
              <input
                id="reply-to"
                type="email"
                className="form-input"
                value={replyModal.to}
                disabled
                style={{ opacity: 0.8, background: "var(--color-background-alt)" }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reply-subject" className="form-label">Subject</label>
              <input
                id="reply-subject"
                type="text"
                className="form-input"
                value={replyModal.subject}
                onChange={(e) => setReplyModal({ ...replyModal, subject: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reply-body" className="form-label">Message Body</label>
              <textarea
                id="reply-body"
                className="form-textarea"
                rows={6}
                value={replyModal.body}
                onChange={(e) => setReplyModal({ ...replyModal, body: e.target.value })}
              />
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleCopyReplyDetails}
              >
                <HiOutlineClipboardCopy size={16} /> Copy Details
              </button>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleOpenEmailApp}
              >
                <HiOutlineMail size={16} /> Open Email App
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={closeReplyModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
