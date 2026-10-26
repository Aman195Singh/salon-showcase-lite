# 💇 Aura Luxury Salon — Multi-Page Showcase Edition

A clean, high-performance, multi-page luxury salon website and owner admin dashboard stripped of heavy operations/staff management — designed specifically for **pitching to salon owners** and hosting **100% free** on Vercel.

---

## 🌟 What is Included in this Project

### 1. Multi-Page Luxury Public Website
- **Home (`/`)**: Hero banner, luxury trust features, signature services preview, testimonials, Google LocalBusiness JSON-LD.
- **About (`/about`)**: Salon story, philosophy, hygiene standards, and team.
- **Services (`/services`)**: Category-wise salon service menu (Hair, Skin, Nails, Spa, Bridal) with prices, duration, and direct "Enquire Now" buttons.
- **Gallery (`/gallery`)**: Category filter pills (All, Hair, Skin, Bridal, Nails, Salon) with interactive Lightbox modal.
- **Contact (`/contact`)**: Direct Phone call, WhatsApp click-to-chat, Google Maps directions, and appointment enquiry form with anti-spam rate limiting.
- **User Auth (`/login`, `/signup`, `/account`)**: Secure customer registration, profile management, and personal enquiry history.

### 2. Streamlined Salon Owner Admin Suite (`/dashboard`)
- 📊 **Overview**: Total page views, new enquiries count, active services count, recent incoming inquiries.
- 📈 **Analytics**: First-party privacy-friendly visitor stats, daily traffic, and inquiry conversion rate.
- ✏️ **Edit Website (CMS)**: Modify salon name, tagline, phone, address, opening hours, and gallery photos with instant live preview.
- ✂️ **Services Manager**: Add, edit, activate/deactivate, and delete salon services with custom prices.
- 📬 **Enquiries Inbox**: Full customer inquiries list, search, status tracking (`New`, `In Progress`, `Resolved`), and zero-setup email/WhatsApp replies.
- 💬 **Developer Support**: In-app support request tickets.
- 👤 **Owner Account**: Profile and password settings.

### 3. Excluded Heavy Systems (Kept Lightweight)
- ❌ No Staff HR / shifts / attendance / payroll calculations.
- ❌ No Appointment calendar slot-locking engine.
- ❌ No Salon operations checklists / station management.

---

## 🚀 Quick Start (Local Run)

```powershell
# Navigate into the showcase folder
cd salon-showcase-lite

# Start local development server
npm run dev
```

- Public Website: [http://localhost:3000](http://localhost:3000)
- Owner Dashboard: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

---

## 🗄️ Database Setup (Supabase)

1. Open your new Supabase project: [https://supabase.com](https://supabase.com)
2. Go to **SQL Editor** (left menu).
3. Copy all contents of `supabase-schema.sql` from this folder, paste into the editor, and click **Run**.
4. To grant yourself owner access to the dashboard:
   - Sign up on `/signup` on the website.
   - In Supabase Table Editor ➔ `profiles` table, change your role from `user` to `owner`.
   - Now `/dashboard` will open with full administrative powers!
