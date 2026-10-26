-- ==============================================================
-- SALON SHOWCASE LITE — STANDALONE DATABASE SCHEMA
-- ==============================================================
-- Run this in your Supabase SQL Editor if you want live cloud storage.
-- It creates simple, fast tables for Enquiries, Content, and Services.

-- 1. Services Table
CREATE TABLE IF NOT EXISTS public.showcase_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Hair',
    price_inr INTEGER NOT NULL DEFAULT 999,
    duration_min INTEGER NOT NULL DEFAULT 45,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Enquiries / Appointments Table
CREATE TABLE IF NOT EXISTS public.showcase_enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    service_name TEXT,
    preferred_date DATE NOT NULL,
    preferred_time TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Website Content Table (Singleton key-value CMS)
CREATE TABLE IF NOT EXISTS public.showcase_content (
    id TEXT PRIMARY KEY DEFAULT 'main_content',
    salon_name TEXT NOT NULL DEFAULT 'Aura Luxury Salon & Spa',
    tagline TEXT NOT NULL DEFAULT 'Where Elegance Meets Perfection',
    hero_headline TEXT NOT NULL DEFAULT 'Luxury Hair, Skin & Bridal Rituals in the Heart of the City',
    hero_subheadline TEXT NOT NULL DEFAULT 'Experience bespoke salon transformations tailored by master stylists using 100% organic, world-class formulations.',
    phone TEXT NOT NULL DEFAULT '+91 98765 43210',
    whatsapp TEXT NOT NULL DEFAULT '+91 98765 43210',
    address TEXT NOT NULL DEFAULT 'Plot 42, Luxury Boulevard, Near City Centre, Indiranagar',
    opening_hours TEXT NOT NULL DEFAULT 'Mon - Sun: 10:00 AM – 08:30 PM',
    maps_url TEXT NOT NULL DEFAULT 'https://maps.google.com',
    gallery_photos JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Simple Page Analytics Table
CREATE TABLE IF NOT EXISTS public.showcase_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL, -- 'page_view', 'click_call', 'click_whatsapp', 'click_book'
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.showcase_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showcase_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showcase_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showcase_analytics ENABLE ROW LEVEL SECURITY;

-- Allow Public to Read Services & Content
CREATE POLICY "Public read services" ON public.showcase_services FOR SELECT USING (true);
CREATE POLICY "Public read content" ON public.showcase_content FOR SELECT USING (true);

-- Allow Public to Submit Enquiries & Analytics
CREATE POLICY "Public insert enquiries" ON public.showcase_enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert analytics" ON public.showcase_analytics FOR INSERT WITH CHECK (true);

-- Full Access for Service Role / Admin (or unrestricted for showcase demo)
CREATE POLICY "Public read own enquiries" ON public.showcase_enquiries FOR SELECT USING (true);
CREATE POLICY "Public update enquiries" ON public.showcase_enquiries FOR UPDATE USING (true);
CREATE POLICY "Public manage content" ON public.showcase_content FOR ALL USING (true);
CREATE POLICY "Public manage services" ON public.showcase_services FOR ALL USING (true);
CREATE POLICY "Public read analytics" ON public.showcase_analytics FOR SELECT USING (true);

-- Seed Initial Content
INSERT INTO public.showcase_content (id, salon_name)
VALUES ('main_content', 'Aura Luxury Salon & Spa')
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Services
INSERT INTO public.showcase_services (name, category, price_inr, duration_min, description, display_order)
VALUES
('Signature Keratin Hair Spa', 'Hair', 1999, 60, 'Deep nourishment treatment infused with botanical keratin for silky, frizz-free shine.', 1),
('Bespoke Balayage & Gloss', 'Hair', 3999, 120, 'Hand-painted dimensional hair colouring customized to your skin tone with protective bond-builder.', 2),
('Hydra Glow Collagen Facial', 'Skin', 2499, 60, 'Gentle suction exfoliation combined with deep peptide infusion for instant radiant skin.', 3),
('Gold Radiance Bridal Facial', 'Skin', 3499, 75, '24K pure gold leaf application designed to stimulate cellular turnover and provide an ethereal glow.', 4),
('Luxury Gel Manicure & Nail Art', 'Nails', 1199, 45, 'Complete cuticle care, shaping, long-lasting UV gel polish with custom minimal nail art.', 5),
('Aroma Detox Body Massage', 'Spa', 2799, 60, 'Stress-relieving full-body massage with warm essential herbal oils in a serene ambient suite.', 6),
('Royal Bridal Hair & Makeup', 'Bridal', 9999, 180, 'Full bridal makeover including HD airbrush makeup, international hair couture, and draping.', 7)
ON CONFLICT DO NOTHING;
