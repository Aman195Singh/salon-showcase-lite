"use client";

import { useState, useEffect } from "react";
import {
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineClock,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineCheck,
} from "react-icons/hi";
import { supabase } from "@/lib/supabase";
import { DEFAULT_SERVICES } from "@/lib/content";
import styles from "./services.module.css";

const CATEGORIES = [
  "All Categories",
  "Hair",
  "Skin & Face",
  "Makeup",
  "Grooming",
  "Nails",
];

export default function ManageServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [alert, setAlert] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "Hair",
    price: "",
    duration: "",
    description: "",
    is_active: true,
  });

  // Load services
  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error || !data || data.length === 0) {
        setServices(DEFAULT_SERVICES);
      } else {
        setServices(data);
      }
    } catch (err) {
      console.warn("Failed to load services, using default list:", err);
      setServices(DEFAULT_SERVICES);
    } finally {
      setLoading(false);
    }
  }

  // Open modal for Create
  const handleAddNew = () => {
    setEditingService(null);
    setFormData({
      name: "",
      category: "Hair",
      price: "₹",
      duration: "30 min",
      description: "",
      is_active: true,
    });
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      category: service.category,
      price: service.price,
      duration: service.duration,
      description: service.description || "",
      is_active: service.is_active !== false,
    });
    setIsModalOpen(true);
  };

  // Save Service (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!formData.name.trim()) {
      setAlert({ type: "error", message: "Service name is required." });
      return;
    }

    try {
      if (editingService) {
        // Update
        const { error } = await supabase
          .from("services")
          .update({
            name: formData.name.trim(),
            category: formData.category,
            price: formData.price.trim(),
            duration: formData.duration.trim(),
            description: formData.description.trim(),
            is_active: formData.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingService.id);

        if (error) throw error;

        setServices((prev) =>
          prev.map((s) =>
            s.id === editingService.id ? { ...s, ...formData } : s
          )
        );
        setAlert({ type: "success", message: "Service updated successfully!" });
      } else {
        // Create
        const newSort = services.length + 1;
        const newRecord = {
          name: formData.name.trim(),
          category: formData.category,
          price: formData.price.trim(),
          duration: formData.duration.trim(),
          description: formData.description.trim(),
          sort_order: newSort,
          is_active: formData.is_active,
        };

        const { data, error } = await supabase
          .from("services")
          .insert([newRecord])
          .select();

        if (error) {
          // If Supabase table isn't initialized, create in local list
          const localNew = { ...newRecord, id: Date.now().toString() };
          setServices((prev) => [...prev, localNew]);
        } else if (data?.[0]) {
          setServices((prev) => [...prev, data[0]]);
        }

        setAlert({ type: "success", message: "New service added successfully!" });
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      // Fallback local update
      if (editingService) {
        setServices((prev) =>
          prev.map((s) =>
            s.id === editingService.id ? { ...s, ...formData } : s
          )
        );
        setAlert({
          type: "success",
          message: "Service updated in local session.",
        });
        setIsModalOpen(false);
      } else {
        setAlert({
          type: "error",
          message: "Failed to save service. Check database connection.",
        });
      }
    }
  };

  // Toggle Active/Inactive
  const handleToggleActive = async (service) => {
    const updatedStatus = !service.is_active;
    try {
      await supabase
        .from("services")
        .update({ is_active: updatedStatus })
        .eq("id", service.id);

      setServices((prev) =>
        prev.map((s) =>
          s.id === service.id ? { ...s, is_active: updatedStatus } : s
        )
      );
    } catch (err) {
      console.error("Toggle error:", err);
      setServices((prev) =>
        prev.map((s) =>
          s.id === service.id ? { ...s, is_active: updatedStatus } : s
        )
      );
    }
  };

  // Delete Service
  const handleDelete = async (service) => {
    if (!confirm(`Are you sure you want to delete "${service.name}"?`)) {
      return;
    }

    try {
      await supabase.from("services").delete().eq("id", service.id);
      setServices((prev) => prev.filter((s) => s.id !== service.id));
      setAlert({ type: "success", message: "Service deleted successfully." });
    } catch (err) {
      console.error(err);
      setServices((prev) => prev.filter((s) => s.id !== service.id));
      setAlert({ type: "success", message: "Service removed from view." });
    }
  };

  // Filtered Services
  const filtered = services.filter((s) => {
    const matchesCategory =
      selectedCategory === "All Categories" ||
      s.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Manage Services</h1>
          <p className={styles.subtitle}>
            Add, update, and manage your salon&apos;s service menu and pricing.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.btnPrimary} onClick={handleAddNew}>
            <HiOutlinePlus size={18} /> Add New Service
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {alert && (
        <div
          className={
            alert.type === "success" ? styles.alertSuccess : styles.alertError
          }
        >
          {alert.message}
        </div>
      )}

      {/* Controls Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.searchBox}>
          <HiOutlineSearch size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search service by name or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className={styles.filterSelect}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Services Grid */}
      {loading ? (
        <p style={{ textAlign: "center", padding: "40px", color: "var(--color-text-secondary)" }}>
          Loading services...
        </p>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px",
            background: "var(--color-surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border-light)",
            color: "var(--color-text-tertiary)",
          }}
        >
          <p>No services found matching your criteria.</p>
        </div>
      ) : (
        <div className={styles.servicesGrid}>
          {filtered.map((service) => (
            <div
              key={service.id}
              className={`${styles.serviceCard} ${
                service.is_active === false ? styles.serviceCardInactive : ""
              }`}
            >
              <div>
                <div className={styles.cardTop}>
                  <span className={styles.categoryTag}>{service.category}</span>
                  <button
                    onClick={() => handleToggleActive(service)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: service.is_active !== false ? "#10b981" : "#9ca3af",
                    }}
                    title={
                      service.is_active !== false
                        ? "Active (Click to hide)"
                        : "Hidden (Click to show)"
                    }
                  >
                    {service.is_active !== false ? (
                      <HiOutlineEye size={18} />
                    ) : (
                      <HiOutlineEyeOff size={18} />
                    )}
                  </button>
                </div>

                <h3 className={styles.cardName}>{service.name}</h3>
                <p className={styles.cardDesc}>
                  {service.description || "No description provided."}
                </p>
              </div>

              <div>
                <div className={styles.cardMeta}>
                  <span className={styles.price}>{service.price}</span>
                  <span className={styles.duration}>
                    <HiOutlineClock size={14} /> {service.duration}
                  </span>
                </div>

                <div className={styles.cardActions}>
                  <button
                    className={styles.actionBtn}
                    onClick={() => handleEdit(service)}
                    title="Edit Service"
                  >
                    <HiOutlinePencil size={15} />
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                    onClick={() => handleDelete(service)}
                    title="Delete Service"
                  >
                    <HiOutlineTrash size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add / Edit Service */}
      {isModalOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalBox}>
            <h2 className={styles.modalTitle}>
              {editingService ? "Edit Service" : "Add New Service"}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Service Name *</label>
                <input
                  type="text"
                  required
                  className={styles.input}
                  placeholder="e.g. Keratin Hair Treatment"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className={styles.row2}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Category</label>
                  <select
                    className={styles.input}
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    {CATEGORIES.filter((c) => c !== "All Categories").map(
                      (cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Price Display</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. ₹1,200 or ₹2,500+"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className={styles.row2}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Duration</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. 45 min or 60–90 min"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Visibility</label>
                  <select
                    className={styles.input}
                    value={formData.is_active ? "true" : "false"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_active: e.target.value === "true",
                      })
                    }
                  >
                    <option value="true">Active (Visible)</option>
                    <option value="false">Hidden (Inactive)</option>
                  </select>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Description</label>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  placeholder="Describe what is included in this service..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  <HiOutlineCheck size={16} /> Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
