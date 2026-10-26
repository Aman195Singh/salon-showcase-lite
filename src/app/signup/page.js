"use client";

import { useState } from "react";
import Link from "next/link";
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlineEye, HiOutlineEyeOff, HiOutlineCheckCircle } from "react-icons/hi";
import { useAuth } from "@/context/AuthContext";
import styles from "./auth.module.css";

export default function SignupPage() {
  const { signUp } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.name || !form.email || !form.password) {
      setErrorMsg("Please fill in all required fields.");
      setStatus("error");
      return;
    }
    if (form.password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      setStatus("error");
      return;
    }
    if (form.password !== form.confirm) {
      setErrorMsg("Passwords do not match.");
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      await signUp(form.email, form.password, form.name);
      setStatus("success");
    } catch (err) {
      setErrorMsg(err.message || "Registration failed. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.successIcon}>
            <HiOutlineCheckCircle size={48} />
          </div>
          <h1 className={styles.title}>Account Created</h1>
          <p className={styles.subtitle}>
            Your account has been created. Please check your email to confirm your address, then log in.
          </p>
          <p className={styles.note}>
            <strong>Note:</strong> Signing up does not automatically grant access to the admin dashboard. Owner access must be approved separately.
          </p>
          <Link href="/login" className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: "24px" }}>
            Go to Login
          </Link>
          <Link href="/" className={styles.backLink}>← Back to website</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>✦</span>
          <span className={styles.brandName}>Salon</span>
        </div>

        <h1 className={styles.title}>Request Access</h1>
        <p className={styles.subtitle}>
          Create an account to request owner/admin access. Approval is required before you can manage the salon.
        </p>

        {errorMsg && (
          <div className={styles.error} role="alert">{errorMsg}</div>
        )}

        <form onSubmit={handleSubmit} noValidate className={styles.form}>
          <div className="form-group">
            <label htmlFor="signup-name" className="form-label">Full Name *</label>
            <div className={styles.inputWrapper}>
              <HiOutlineUser size={18} className={styles.inputIcon} />
              <input
                id="signup-name"
                type="text"
                className={`form-input ${styles.inputWithIcon}`}
                placeholder="Your full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="signup-email" className="form-label">Email Address *</label>
            <div className={styles.inputWrapper}>
              <HiOutlineMail size={18} className={styles.inputIcon} />
              <input
                id="signup-email"
                type="email"
                className={`form-input ${styles.inputWithIcon}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="signup-password" className="form-label">Password * (min 8 characters)</label>
            <div className={styles.inputWrapper}>
              <HiOutlineLockClosed size={18} className={styles.inputIcon} />
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                className={`form-input ${styles.inputWithIcon}`}
                placeholder="Create a strong password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="signup-confirm" className="form-label">Confirm Password *</label>
            <div className={styles.inputWrapper}>
              <HiOutlineLockClosed size={18} className={styles.inputIcon} />
              <input
                id="signup-confirm"
                type={showPassword ? "text" : "password"}
                className={`form-input ${styles.inputWithIcon}`}
                placeholder="Re-enter your password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: "100%" }}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Creating Account…" : "Create Account"}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account?{" "}
          <Link href="/login" className={styles.footerLink}>Sign In</Link>
        </p>

        <Link href="/" className={styles.backLink}>← Back to website</Link>
      </div>
    </div>
  );
}
