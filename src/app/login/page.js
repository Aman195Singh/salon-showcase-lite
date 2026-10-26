"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import styles from "./auth.module.css";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, user, isOwner, loading } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [errorMsg, setErrorMsg] = useState("");
  const [resendStatus, setResendStatus] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      if (isOwner) {
        router.push("/dashboard");
      } else {
        router.push("/account");
      }
    }
  }, [user, isOwner, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setErrorMsg("Please enter both email and password.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    setResendStatus("");

    try {
      await signIn(form.email, form.password);
      // Auth state change listener will handle redirect
    } catch (err) {
      setErrorMsg(err.message || "Invalid email or password.");
      setStatus("error");
    }
  };

  const handleResendConfirmation = async () => {
    if (!form.email) {
      setErrorMsg("Please enter your email address above first.");
      return;
    }
    try {
      setResendStatus("Sending confirmation link...");
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: form.email.trim(),
      });
      if (error) throw error;
      setResendStatus("Confirmation link resent! Please check your inbox and spam folder.");
    } catch (err) {
      setResendStatus("Could not resend: " + err.message);
    }
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.card} style={{ textAlign: "center" }}>
          <div className={styles.brand}>
            <span className={styles.brandIcon}>✦</span>
            <span className={styles.brandName}>Salon</span>
          </div>
          <p style={{ color: "var(--color-text-secondary)", marginTop: "var(--space-4)" }}>
            Checking your session…
          </p>
        </div>
      </div>
    );
  }

  const isEmailNotConfirmed = errorMsg.toLowerCase().includes("not confirmed");

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Brand */}
        <div className={styles.brand}>
          <span className={styles.brandIcon}>✦</span>
          <span className={styles.brandName}>Salon</span>
        </div>

        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Sign in to manage your salon</p>

        {errorMsg && (
          <div className={styles.error} role="alert">
            <div>{errorMsg}</div>
            {isEmailNotConfirmed && (
              <div style={{ marginTop: "10px", fontSize: "0.85rem", borderTop: "1px solid rgba(220, 38, 38, 0.2)", paddingTop: "8px" }}>
                <p style={{ marginBottom: "6px" }}>Haven&apos;t received your verification email yet?</p>
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  style={{
                    color: "inherit",
                    fontWeight: 700,
                    textDecoration: "underline",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Click here to resend confirmation link
                </button>
                {resendStatus && (
                  <p style={{ marginTop: "6px", fontSize: "0.82rem", fontWeight: 600 }}>
                    {resendStatus}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className={styles.form}>
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">Email Address</label>
            <div className={styles.inputWrapper}>
              <HiOutlineMail size={18} className={styles.inputIcon} />
              <input
                id="login-email"
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
            <div className={styles.labelRow}>
              <label htmlFor="login-password" className="form-label">Password</label>
            </div>
            <div className={styles.inputWrapper}>
              <HiOutlineLockClosed size={18} className={styles.inputIcon} />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                className={`form-input ${styles.inputWithIcon}`}
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
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

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: "100%" }}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className={styles.footer}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className={styles.footerLink}>Request Access</Link>
        </p>

        <Link href="/" className={styles.backLink}>← Back to website</Link>
      </div>
    </div>
  );
}
