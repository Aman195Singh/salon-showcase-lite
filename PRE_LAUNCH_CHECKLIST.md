# 🚀 Salon Showcase Lite — Pre-Launch Master Guide & Security Checklist

> **Target:** Launching `salon-showcase-lite` publicly with production-grade security, free hosting on Vercel, and a reliable free email/OTP confirmation flow.

---

## 📋 Table of Contents
1. [Security Hardening & Protection (सुरक्षा नियम)](#1-security-hardening--protection)
2. [Authentication & Free Email / OTP Setup (फ्री ईमेल/OTP कन्फर्मेशन)](#2-authentication--free-email--otp-setup)
3. [Content & Salon Branding (वेबसाइट का डेटा व ब्रांडिंग)](#3-content--salon-branding)
4. [Hosting on Vercel — 100% Free (वेबसाइट लाइव करना)](#4-hosting-on-vercel--100-free)
5. [Pre-Flight Verification Checklist (लांच से पहले टेस्टिंग)](#5-pre-flight-verification-checklist)

---

## 1. Security Hardening & Protection

Public launch se pehle yeh 5 security layers verify karna zaroori hai:

### A. Role-Based Access Control (RBAC) & Escalation Defense
- **Rule:** Public signup (`/signup`) se register karne waala koi bhi vyakti sirf `user` (Customer) banna chahiye, kabhi automatically `owner` (Admin) nahi.
- **Database Trigger:** PostgreSQL trigger `profiles_prevent_role_change` check karta hai ki koi normal user API call ya SQL injection se apna role `user` se `owner` na kar sake.
- **Route Guard:** `/dashboard/*` par server aur client-side check hai:
  - Agar user logged in nahi hai ➔ `/login` par redirect.
  - Agar user `owner` nahi hai ➔ Homepage `/` par redirect.

### B. Row Level Security (RLS) Database Isolation
Database tables par public aur owner ke permissions strictly alag hain:
| Table | Public Visitors | Authenticated User | Salon Owner (Admin) |
|---|---|---|---|
| `site_content` (Published) | Read Only (SELECT) | Read Only (SELECT) | Full Manage (ALL) |
| `site_content_draft` | ❌ No Access (0 rows) | ❌ No Access (0 rows) | Full Manage (ALL) |
| `services` | Read Only (is_active = true) | Read Only | Full Manage (ALL) |
| `gallery_images` | Read Only (is_published = true)| Read Only | Full Manage (ALL) |
| `enquiries` | Create (INSERT) | Read Own Only (`user_id = auth.uid()`) | Read & Manage All |
| `profiles` | ❌ No Access | Read & Update Own Only | Read All Profiles |
| `analytics_events` | Create (INSERT) | Create | Read All Analytics |

### C. Zero Secrets in Client Code
- `.env.local` mein sirf **`NEXT_PUBLIC_SUPABASE_URL`** aur **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** hone chahiye.
- **WARNING:** Supabase ka `service_role` secret key kabhi bhi frontend code ya client environment variables mein nahi daalna hai. Anon key safe hai kyunki RLS database ko protect karta hai.

### D. Anti-Spam & Abuse Protection
- **Contact & Enquiry Forms**: 
  - In-memory rate limiting: Ek IP address se 1 minute mein maximum 3 enquiries permit hain.
  - Honeypot hidden input field: Agar bot ise fill karega toh request bina error ke silently discard ho jaayegi.
  - Phone validation: Minimum 10 digits required.

### E. HTTP Security Headers
`next.config.mjs` mein production headers configure hain:
- `X-Content-Type-Options: nosniff` (MIME sniffing attack block)
- `X-Frame-Options: SAMEORIGIN` (Clickjacking / iframe embedding block)
- `Referrer-Policy: strict-origin-when-cross-origin` (User data privacy)

---

## 2. Authentication & Free Email / OTP Setup

### A. "Email not confirmed" Problem Kyun Hoti Hai?
Supabase ke free tier mein jo default email service hoti hai uski limit sirf **3-4 emails per hour** hoti hai, jisse verification emails aksar block ho jaati hain ya spam mein chali jaati hain.

### B. Free Email / OTP Setup ke 2 Best Options:

#### Option 1: Free Resend SMTP (Recommended — 100% Free & Fast OTP/Links)
[Resend.com](https://resend.com) developer-friendly email provider hai jo **3,000 emails per month (100 emails per day) bilkul FREE** deta hai.
1. Resend.com par free account banayein aur API Key generate karein.
2. Supabase Dashboard ➔ **Project Settings ➔ Authentication ➔ SMTP Settings** par jayein:
   - **Sender Email:** `onboarding@resend.dev` (ya aapka custom domain jaise `concierge@aurasalon.com`)
   - **Sender Name:** `Aura Luxury Salon`
   - **SMTP Host:** `smtp.resend.com`
   - **SMTP Port:** `465` (ya `587`)
   - **SMTP User:** `resend`
   - **SMTP Password:** `re_your_api_key_here`
3. Save karein! Ab har user ko real 6-digit OTP ya verification link turant unke inbox mein milega.

#### Option 2: Launch ke liye "Email Confirm" OFF Rakhna (Zero Friction)
Agar aap abhi kisi external SMTP service mein time nahi lagana chahte:
1. Supabase Dashboard ➔ **Authentication ➔ Providers ➔ Email** kholein.
2. **"Confirm email"** switch ko **OFF (Disable)** kar dein.
3. **Faayda:** Customer ya Salon Owner jab bhi sign up karega, bina kisi email delay ya confirmation link ke turant login ho jaayega.

---

## 3. Content & Salon Branding

Website live karne se pehle salon ki real details CMS se update karein:
- [ ] **Salon Name & Tagline**: e.g., "Aura Luxury Salon & Spa"
- [ ] **Direct Phone Number**: Header, footer aur contact button par real phone number daalein (`tel:` link).
- [ ] **WhatsApp Number**: Country code ke sath (`+91XXXXXXXXXX`) taaki click karte hi chat khul sake.
- [ ] **Real Address & Google Maps Link**: Contact page par correct address aur maps location.
- [ ] **Opening Hours**: Salon ke real opening & closing timings.
- [ ] **Real Pricing & Services**: Services page par salon ki real services aur rate list.

---

## 4. Hosting on Vercel — 100% Free

Vercel par hosting **hamesha ke liye free** hai (Hobby plan) aur automatic SSL (https://) deta hai.

### Step-by-Step Deployment:
1. `salon-showcase-lite` folder ko naye GitHub repository mein push karein:
   ```bash
   cd salon-showcase-lite
   git init
   git add .
   git commit -m "Initial commit for Salon Showcase Lite"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/salon-showcase.git
   git push -u origin main
   ```
2. [Vercel.com](https://vercel.com) par login karein (Continue with GitHub).
3. **"Add New..." ➔ "Project"** par click karein aur apna repository select karein.
4. **Environment Variables** section expand karein aur ye do variables add karein:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://yekyngrfrifosnmraosu.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_7V3zPx34NNff37aAdKuAmw_oAqI2F6X`
5. **"Deploy"** click karein. 1 minute ke andar aapki website live ho jaayegi!
6. *(Optional)* **Custom Domain**: Agar client ka apna domain hai (e.g. `www.aurasalon.in`), toh Vercel Project Settings ➔ Domains mein 1-click mein free connect ho jata hai.

---

## 5. Pre-Flight Verification Checklist

Website ka link client ko bhejne se pehle yeh 7 tests zaroor run karein:

- [ ] **Test 1: Public Navigation**: Home, About, Services, Gallery, Contact pages mobile aur desktop dono par clean khul rahe hain.
- [ ] **Test 2: Contact Form Lead**: Contact form fill karke submit karein ➔ Success message aana chahiye ➔ Supabase `enquiries` table aur `/dashboard/enquiries` mein entry aani chahiye.
- [ ] **Test 3: Phone & WhatsApp CTA**: Header aur contact page par Call aur WhatsApp buttons click karke check karein ki sahi number par call/chat open ho rahi hai.
- [ ] **Test 4: Customer Account Isolation**: Ek fake customer account banayein ➔ Woh sirf apna profile dekh sakta hai, `/dashboard` open karne par homepage par redirect ho jata hai.
- [ ] **Test 5: Owner Dashboard Access**: Owner email se login karein ➔ `/dashboard` open hona chahiye, overview, analytics, enquiries aur edit website load honi chahiye.
- [ ] **Test 6: CMS Live Edit**: Edit Website mein salon ka phone ya tagline badal kar "Publish" karein ➔ Public website par refresh karke check karein ki change reflect hua.
- [ ] **Test 7: Production Build Clean**: Local terminal par `npm run build` bina kisi error ke 0 exit code ke sath pass hona chahiye.

---

### Ready to Execute?
Is checklist ke banne ke baad hum step-by-step is plan ko execute kar sakte hain.
