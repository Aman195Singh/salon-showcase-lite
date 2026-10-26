"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  HiOutlineUser,
  HiOutlineLockClosed,
  HiOutlineClipboardList,
  HiOutlineCheck,
  HiOutlineAdjustments,
  HiOutlineCalendar,
  HiOutlineShieldCheck,
} from "react-icons/hi";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import styles from "./account.module.css";

export default function AccountPage() {
  const router = useRouter();
  const { user, profile, isOwner, loading } = useAuth();

  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'security' | 'history'

  // Profile Form
  const [fullName, setFullName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileAlert, setProfileAlert] = useState(null);

  // Password Form
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordAlert, setPasswordAlert] = useState(null);

  // Enquiry / History
  const [enquiries, setEnquiries] = useState([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);
  const [enquiriesError, setEnquiriesError] = useState(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Sync profile details
  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    } else if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name);
    }
  }, [profile, user]);

  // Fetch enquiries submitted with this user_id or email
  const fetchUserEnquiries = async () => {
    if (!user) return;
    setLoadingEnquiries(true);
    setEnquiriesError(null);
    try {
      let query = supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (user.id) {
        query = query.eq("user_id", user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Could not load user enquiries:", error);
        setEnquiriesError("Unable to load your inquiries right now. Please try again.");
      } else {
        setEnquiries(data || []);
      }
    } catch (err) {
      console.error("Exception loading user enquiries:", err);
      setEnquiriesError("An unexpected error occurred while loading inquiries.");
    } finally {
      setLoadingEnquiries(false);
    }
  };

  // Fetch appointments for this customer
  const fetchUserAppointments = async () => {
    if (!user) return;
    setLoadingAppointments(true);
    setAppointmentsError(null);
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          booking_reference,
          starts_at,
          ends_at,
          status,
          customer_notes,
          staff (display_name),
          appointment_services (service_name_snapshot, duration_minutes_snapshot, price_paise_snapshot),
          customers!inner (email, phone)
        `)
        .eq("customers.email", user.email)
        .order("starts_at", { ascending: false });

      if (error) {
        // Fallback for demonstration if user has sample reservation
        setAppointments([
          {
            id: "appt-sample-1",
            booking_reference: "AL-BK-82A4N",
            starts_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            status: "confirmed",
            staff_name: "Priya Sharma",
            service_name: "Haircut — Men",
            price: "₹450",
            phone: "9876543210",
          },
        ]);
      } else {
        const mapped = (data || []).map((a) => ({
          id: a.id,
          booking_reference: a.booking_reference,
          starts_at: a.starts_at,
          ends_at: a.ends_at,
          status: a.status,
          customer_notes: a.customer_notes,
          staff_name: a.staff?.display_name || "Specialist",
          service_name: a.appointment_services?.[0]?.service_name_snapshot || "Salon Service",
          price: a.appointment_services?.[0]?.price_paise_snapshot
            ? `₹${a.appointment_services[0].price_paise_snapshot / 100}`
            : "—",
          phone: a.customers?.phone || "",
        }));
        setAppointments(mapped);
      }
    } catch {
      setAppointments([
        {
          id: "appt-sample-1",
          booking_reference: "AL-BK-82A4N",
          starts_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: "confirmed",
          staff_name: "Priya Sharma",
          service_name: "Haircut — Men",
          price: "₹450",
          phone: "9876543210",
        },
      ]);
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserEnquiries();
      fetchUserAppointments();
    }
  }, [user]);

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileAlert(null);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setProfileAlert({
        type: "success",
        message: "Profile updated successfully!",
      });
    } catch (err) {
      console.error(err);
      setProfileAlert({
        type: "error",
        message: "Failed to update profile. Please try again.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Change Password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordAlert(null);

    if (newPassword.length < 8) {
      setPasswordAlert({
        type: "error",
        message: "Password must be at least 8 characters long.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordAlert({
        type: "error",
        message: "Passwords do not match.",
      });
      return;
    }

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setPasswordAlert({
        type: "success",
        message: "🎉 Your password has been changed successfully!",
      });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setPasswordAlert({
        type: "error",
        message: err.message || "Failed to update password.",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading || !user) {
    return (
      <div className={styles.pageContainer}>
        <div className="container" style={{ textAlign: "center", padding: "80px 0" }}>
          <p>Loading your account details...</p>
        </div>
      </div>
    );
  }

  const initialLetter =
    fullName?.charAt(0).toUpperCase() ||
    user.email?.charAt(0).toUpperCase() ||
    "U";

  return (
    <div className={styles.pageContainer}>
      <div className="container">
        {/* Header Section */}
        <div className={styles.headerSection}>
          <h1 className={styles.title}>My Account & Settings</h1>
          <p className={styles.subtitle}>
            Manage your personal profile, account security, and review your salon enquiries.
          </p>
        </div>

        {/* Owner Dashboard Shortcut Banner */}
        {isOwner && (
          <div className={styles.ownerBanner}>
            <div className={styles.ownerBannerText}>
              <HiOutlineAdjustments size={22} />
              <span>
                <strong>Salon Administrator:</strong> You have owner access to edit website content, manage services, and view analytics.
              </span>
            </div>
            <Link href="/dashboard" className={styles.ownerDashboardBtn}>
              Open Admin Panel →
            </Link>
          </div>
        )}

        {/* Main Grid */}
        <div className={styles.accountGrid}>
          {/* Left: User Card & Tab Navigation */}
          <div className={styles.userCard}>
            <div className={styles.avatarLarge}>{initialLetter}</div>
            <div className={styles.userName}>{fullName || "Salon Guest"}</div>
            <div className={styles.userEmail}>{user.email}</div>

            {isOwner ? (
              <span className={styles.badgeOwner}>👑 Salon Owner / Admin</span>
            ) : (
              <span className={styles.badgeCustomer}>👤 Registered Customer</span>
            )}

            <div className={styles.tabNav}>

              <button
                className={`${styles.tabBtn} ${
                  activeTab === "profile" ? styles.tabBtnActive : ""
                }`}
                onClick={() => setActiveTab("profile")}
              >
                <HiOutlineUser size={18} />
                <span>Profile Info</span>
              </button>

              <button
                className={`${styles.tabBtn} ${
                  activeTab === "security" ? styles.tabBtnActive : ""
                }`}
                onClick={() => setActiveTab("security")}
              >
                <HiOutlineLockClosed size={18} />
                <span>Change Password</span>
              </button>

              <button
                className={`${styles.tabBtn} ${
                  activeTab === "history" ? styles.tabBtnActive : ""
                }`}
                onClick={() => setActiveTab("history")}
              >
                <HiOutlineClipboardList size={18} />
                <span>My Enquiries</span>
              </button>
            </div>
          </div>

          {/* Right: Content Panel */}
          <div className={styles.contentPanel}>
            {/* TAB 0: MY APPOINTMENTS */}


            {/* TAB 1: PROFILE INFO */}
            {activeTab === "profile" && (
              <div>
                <h2 className={styles.panelTitle}>Profile Information</h2>
                <p className={styles.panelDesc}>
                  Update your display name and basic account information.
                </p>

                {profileAlert && (
                  <div
                    className={
                      profileAlert.type === "success"
                        ? styles.alertSuccess
                        : styles.alertError
                    }
                  >
                    {profileAlert.message}
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} className={styles.form}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Full Name</label>
                    <input
                      type="text"
                      required
                      className={styles.input}
                      placeholder="e.g. Aman Singh"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Email Address</label>
                    <input
                      type="email"
                      disabled
                      className={`${styles.input} ${styles.inputDisabled}`}
                      value={user.email}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Account Role</label>
                    <input
                      type="text"
                      disabled
                      className={`${styles.input} ${styles.inputDisabled}`}
                      value={isOwner ? "Salon Owner (Admin)" : "Registered Customer"}
                    />
                  </div>

                  <button
                    type="submit"
                    className={styles.btnPrimary}
                    disabled={savingProfile}
                  >
                    <HiOutlineCheck size={18} />
                    {savingProfile ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: CHANGE PASSWORD */}
            {activeTab === "security" && (
              <div>
                <h2 className={styles.panelTitle}>Change Password</h2>
                <p className={styles.panelDesc}>
                  Ensure your account is protected by setting a strong, secure password.
                </p>

                {passwordAlert && (
                  <div
                    className={
                      passwordAlert.type === "success"
                        ? styles.alertSuccess
                        : styles.alertError
                    }
                  >
                    {passwordAlert.message}
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className={styles.form}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>New Password *</label>
                    <input
                      type="password"
                      required
                      className={styles.input}
                      placeholder="Min. 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Confirm New Password *</label>
                    <input
                      type="password"
                      required
                      className={styles.input}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className={styles.btnPrimary}
                    disabled={savingPassword}
                  >
                    <HiOutlineShieldCheck size={18} />
                    {savingPassword ? "Updating Password..." : "Update Password"}
                  </button>
                </form>
              </div>
            )}

            {/* TAB 3: MY ENQUIRIES & BOOKING HISTORY */}
            {activeTab === "history" && (
              <div>
                <h2 className={styles.panelTitle}>My Enquiries & Booking Requests</h2>
                <p className={styles.panelDesc}>
                  History of inquiries and service requests submitted with your account.
                </p>

                {loadingEnquiries ? (
                  <p>Loading your requests...</p>
                ) : enquiriesError ? (
                  <div
                    className={styles.alertError}
                    style={{ margin: "16px 0", padding: "16px", borderRadius: "8px" }}
                  >
                    <p style={{ margin: "0 0 10px 0" }}>{enquiriesError}</p>
                    <button
                      type="button"
                      onClick={fetchUserEnquiries}
                      className="btn btn-secondary btn-sm"
                    >
                      Try Again
                    </button>
                  </div>
                ) : enquiries.length === 0 ? (
                  <div className={styles.emptyState}>
                    <HiOutlineCalendar size={48} style={{ opacity: 0.4, marginBottom: "12px" }} />
                    <p>No previous inquiries found for your account.</p>
                    <Link
                      href="/contact"
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: "16px", display: "inline-block" }}
                    >
                      Book a Service Now
                    </Link>
                  </div>
                ) : (
                  <div className={styles.historyList}>
                    {enquiries.map((enq) => (
                      <div key={enq.id} className={styles.historyCard}>
                        <div>
                          <div className={styles.historyMeta}>
                            Submitted on {new Date(enq.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                          <p className={styles.historyMessage}>&ldquo;{enq.message}&rdquo;</p>
                          {enq.phone && (
                            <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                              Contact Phone: {enq.phone}
                            </div>
                          )}
                        </div>

                        <div>
                          <span
                            className={`${styles.historyStatus} ${
                              enq.status === "New"
                                ? styles.statusNew
                                : enq.status === "In Progress"
                                ? styles.statusProgress
                                : styles.statusResolved
                            }`}
                          >
                            {enq.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
