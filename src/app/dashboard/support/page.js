"use client";

import { useState } from "react";
import { HiOutlineSupport, HiOutlineCheckCircle } from "react-icons/hi";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export default function SupportPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ subject: "", description: "", type: "general" });
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      alert("Please fill in all required fields.");
      return;
    }
    setStatus("sending");
    try {
      const { error } = await supabase.from("support_requests").insert({
        subject: form.subject.trim(),
        description: form.description.trim(),
        request_type: form.type,
        submitted_by: user.id,
      });
      if (error) throw error;
      setStatus("success");
      setForm({ subject: "", description: "", type: "general" });
    } catch (err) {
      console.error("Error submitting support request:", err);
      setStatus("error");
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: "var(--text-2xl)", marginBottom: "var(--space-2)" }}>Developer Support</h1>
      <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", marginBottom: "var(--space-6)" }}>
        Submit a support or feature request to the developer.
      </p>

      <div style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border-light)",
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-8)",
        maxWidth: "600px"
      }}>
        {status === "success" ? (
          <div style={{ textAlign: "center", padding: "var(--space-8)" }}>
            <HiOutlineCheckCircle size={48} style={{ color: "var(--color-success)", marginBottom: "var(--space-4)" }} />
            <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-2)" }}>Request Submitted</h2>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", marginBottom: "var(--space-6)" }}>
              Your request has been saved. The developer will review it.
            </p>
            <button className="btn btn-primary" onClick={() => setStatus("idle")}>
              Submit Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
            <div className="form-group">
              <label htmlFor="support-type" className="form-label">Request Type</label>
              <select
                id="support-type"
                className="form-select"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="general">General</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="content">Content Help</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="support-subject" className="form-label">Subject *</label>
              <input
                id="support-subject"
                type="text"
                className="form-input"
                placeholder="Brief summary of your request"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="support-desc" className="form-label">Description *</label>
              <textarea
                id="support-desc"
                className="form-textarea"
                placeholder="Describe your request in detail..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={5}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
              {status === "sending" ? "Submitting..." : "Submit Request"}
            </button>
            {status === "error" && (
              <p style={{ color: "var(--color-error)", fontSize: "var(--text-sm)" }}>
                Failed to submit. Please try again.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
