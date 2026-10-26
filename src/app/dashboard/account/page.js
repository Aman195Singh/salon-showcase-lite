"use client";

import { useState } from "react";
import {
  HiOutlineUser,
  HiOutlineCheckCircle,
  HiOutlineLockClosed,
  HiOutlineShieldCheck,
} from "react-icons/hi";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import styles from "./account.module.css";

export default function AccountPage() {
  const { profile, user } = useAuth();
  const [name, setName] = useState(profile?.full_name || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Password change state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordAlert, setPasswordAlert] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: name, updated_at: new Date().toISOString() })
        .eq("id", user.id);
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
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

    setPasswordSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setPasswordAlert({
        type: "success",
        message: "Password updated successfully!",
      });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Password change error:", err);
      setPasswordAlert({
        type: "error",
        message: err.message || "Failed to update password.",
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div>
      <h1 className={styles.pageTitle}>Account Settings</h1>
      <p className={styles.pageDesc}>
        Manage your owner profile and security credentials.
      </p>

      {/* Profile Info Card */}
      <div className={styles.card}>
        <div className={styles.avatarSection}>
          <div className={styles.avatar}>
            <HiOutlineUser size={32} />
          </div>
          <div>
            <h2 className={styles.profileName}>
              {profile?.full_name || "Salon Owner"}
            </h2>
            <span className={styles.profileRole}>👑 Owner</span>
          </div>
        </div>

        <form onSubmit={handleSave} className={styles.form}>
          <div className="form-group">
            <label htmlFor="account-name" className="form-label">
              Full Name
            </label>
            <input
              id="account-name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={user?.email || ""}
              disabled
              style={{ opacity: 0.6, cursor: "not-allowed" }}
            />
            <span
              className="form-error"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Email is managed by Supabase authentication.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <input
              type="text"
              className="form-input"
              value="Owner (Full Admin Access)"
              disabled
              style={{ opacity: 0.6, cursor: "not-allowed" }}
            />
          </div>

          <div className={styles.actions}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
            {saved && (
              <span className={styles.savedMsg}>
                <HiOutlineCheckCircle size={16} />
                Profile updated!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Security & Password Card */}
      <div className={styles.card} style={{ marginTop: "var(--space-6)" }}>
        <h2 style={{ fontSize: "var(--text-lg)", fontWeight: "700", marginBottom: "var(--space-1)", display: "flex", alignItems: "center", gap: "8px" }}>
          <HiOutlineLockClosed size={20} color="var(--color-primary)" />
          Change Password
        </h2>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", marginBottom: "var(--space-4)" }}>
          Update your account login password.
        </p>

        {passwordAlert && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              marginBottom: "var(--space-4)",
              fontSize: "var(--text-xs)",
              background: passwordAlert.type === "success" ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
              color: passwordAlert.type === "success" ? "#047857" : "#b91c1c",
              border: passwordAlert.type === "success" ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)",
            }}
          >
            {passwordAlert.message}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className={styles.form}>
          <div className="form-group">
            <label className="form-label">New Password *</label>
            <input
              type="password"
              required
              className="form-input"
              placeholder="Min. 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password *</label>
            <input
              type="password"
              required
              className="form-input"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className={styles.actions}>
            <button
              type="submit"
              className="btn btn-secondary"
              disabled={passwordSaving}
            >
              <HiOutlineShieldCheck size={16} />
              {passwordSaving ? "Updating Password..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
