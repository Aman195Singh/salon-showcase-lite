-- ==============================================================
-- SALON SHOWCASE LITE — COMPLETE STANDALONE DATABASE SCHEMA
-- ==============================================================
-- Run this in your NEW Supabase SQL Editor (yekyngrfrifosnmraosu):
-- Dashboard → SQL Editor → New Query → Paste → Run
-- ==============================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'owner')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: Auto-create profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Prevent users from escalating their own role to 'owner'
CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'Changing role is not allowed';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_role_change ON public.profiles;
CREATE TRIGGER profiles_prevent_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_change();

-- 2. SITE CONTENT (Published & Draft)
CREATE TABLE IF NOT EXISTS public.site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL UNIQUE,  -- 'general', 'home', 'about', 'contact'
  content JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.site_content_draft (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id)
);

-- 3. SERVICES (Published & Draft)
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.services_draft (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. GALLERY IMAGES
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  alt_text TEXT DEFAULT '',
  category TEXT DEFAULT 'Hair',
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ENQUIRIES / APPOINTMENTS INBOX
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'In Progress', 'Resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. FIRST-PARTY ANALYTICS EVENTS
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  page_path TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SUPPORT REQUESTS
CREATE TABLE IF NOT EXISTS public.support_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  request_type TEXT DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'In Progress', 'Resolved')),
  submitted_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. FAQ ITEMS (Chatbot)
CREATE TABLE IF NOT EXISTS public.faq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content_draft ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services_draft ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current user is owner
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'owner'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- PROFILES
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Owners can read all profiles" ON public.profiles FOR SELECT USING (public.is_owner());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- SITE CONTENT
CREATE POLICY "Anyone can read published content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Owners can manage content" ON public.site_content FOR ALL USING (public.is_owner());
CREATE POLICY "Owners can manage content drafts" ON public.site_content_draft FOR ALL USING (public.is_owner());

-- SERVICES
CREATE POLICY "Anyone can read active services" ON public.services FOR SELECT USING (is_active = true);
CREATE POLICY "Owners can manage services" ON public.services FOR ALL USING (public.is_owner());
CREATE POLICY "Owners can manage services drafts" ON public.services_draft FOR ALL USING (public.is_owner());

-- GALLERY
CREATE POLICY "Anyone can read published gallery" ON public.gallery_images FOR SELECT USING (is_published = true);
CREATE POLICY "Owners can manage gallery" ON public.gallery_images FOR ALL USING (public.is_owner());

-- ENQUIRIES
CREATE POLICY "Anyone can submit enquiry" ON public.enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can read own enquiries" ON public.enquiries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owners can manage enquiries" ON public.enquiries FOR ALL USING (public.is_owner());

-- ANALYTICS
CREATE POLICY "Anyone can insert analytics" ON public.analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Owners can read analytics" ON public.analytics_events FOR SELECT USING (public.is_owner());

-- SUPPORT REQUESTS
CREATE POLICY "Users can insert support request" ON public.support_requests FOR INSERT WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "Users can read own support requests" ON public.support_requests FOR SELECT USING (auth.uid() = submitted_by);
CREATE POLICY "Owners can manage all support requests" ON public.support_requests FOR ALL USING (public.is_owner());

-- FAQ
CREATE POLICY "Anyone can read active FAQs" ON public.faq_items FOR SELECT USING (is_active = true);
CREATE POLICY "Owners can manage FAQs" ON public.faq_items FOR ALL USING (public.is_owner());

-- ==============================================================
-- PRE-POPULATED SALON SEED DATA (Ready for Client Demo)
-- ==============================================================

-- 1. Published Content
INSERT INTO public.site_content (section, content) VALUES
  ('general', '{
    "salonName": "Aura Luxury Salon & Spa",
    "tagline": "Where Elegance Meets Perfection",
    "logo": "",
    "phone": "+91 98765 43210",
    "whatsapp": "+91 98765 43210",
    "email": "concierge@aurasalon.com",
    "address": "Plot 42, Luxury Boulevard, Near City Centre, Indiranagar, Bengaluru",
    "mapLink": "https://maps.google.com",
    "instagram": "https://instagram.com",
    "facebook": "https://facebook.com",
    "youtube": "https://youtube.com",
    "hours": [
      {"day": "Monday – Saturday", "time": "10:00 AM – 08:30 PM"},
      {"day": "Sunday", "time": "10:30 AM – 07:00 PM"}
    ]
  }'),
  ('home', '{
    "heroTagline": "Premium Unisex Luxury Salon",
    "heroTitle": "Experience the Art of Grooming &",
    "heroAccent": "Radiance",
    "heroDescription": "Bespoke styling and rejuvenating spa transformations tailored by certified master artists using 100% organic, world-class beauty formulations.",
    "heroCta": "Book Consultation",
    "heroCtaSecondary": "Explore Services"
  }'),
  ('about', '{
    "title": "Our Story & Craftsmanship",
    "description": "A passion for bespoke beauty, hospital-grade hygiene, and personalized aesthetic care.",
    "storyParagraphs": [
      "We started Aura Luxury Salon with a simple philosophy: beauty is an art form that deserves undivided attention, pure formulations, and a tranquil sanctuary.",
      "Our team of internationally trained master stylists brings over a decade of experience across balayage colouring, dermatological facials, and couture bridal makeovers.",
      "Every tool is hospital-grade sterilized, and every client receives an individualized consultation before service begins."
    ]
  }'),
  ('contact', '{
    "title": "Visit Our Sanctuary",
    "description": "Have a query or wish to reserve your bespoke salon session? Reach out to our concierge team."
  }'),
  ('gallery', '{
    "heroTitle": "Our Work & Craft",
    "heroDesc": "A glimpse of our salon, our artistry, and the transformations we create for our clients every day.",
    "images": [
      {
        "id": "1",
        "src": "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
        "alt": "Modern Salon Ambience & Styling Stations",
        "caption": "Our modern luxury salon space",
        "category": "Salon"
      },
      {
        "id": "2",
        "src": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
        "alt": "Bespoke Balayage & Gloss Transformation",
        "caption": "Hand-painted balayage color",
        "category": "Hair"
      },
      {
        "id": "3",
        "src": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
        "alt": "Hydra Glow Facial & Skin Rejuvenation",
        "caption": "Hydra collagen skin glow therapy",
        "category": "Skin"
      },
      {
        "id": "4",
        "src": "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=800&q=80",
        "alt": "Royal Bridal Makeover & Hair Couture",
        "caption": "Bridal couture hair & airbrush makeup",
        "category": "Bridal"
      },
      {
        "id": "5",
        "src": "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80",
        "alt": "Minimalist Gel Manicure & Pastel Nail Art",
        "caption": "Precision manicure & gel art",
        "category": "Nails"
      },
      {
        "id": "6",
        "src": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80",
        "alt": "Aroma Detox & Relaxation Spa Suite",
        "caption": "Ambient relaxation massage suite",
        "category": "Spa"
      }
    ]
  }')
ON CONFLICT (section) DO UPDATE SET content = EXCLUDED.content;

-- Copy to Draft as well
INSERT INTO public.site_content_draft (section, content)
SELECT section, content FROM public.site_content
ON CONFLICT (section) DO UPDATE SET content = EXCLUDED.content;

-- 2. Services List
INSERT INTO public.services (category, name, description, price, duration, sort_order, is_active) VALUES
  ('Hair', 'Signature Keratin Hair Spa', 'Deep botanical keratin infusion for silky smoothness, split-end repair, and intense shine.', '₹1,999', '60 min', 1, true),
  ('Hair', 'Bespoke Balayage & Hair Gloss', 'Hand-painted dimensional color tailored to your undertones with protective bond multiplier.', '₹3,999', '120 min', 2, true),
  ('Hair', 'Precision Creative Haircut — Women', 'Personalized face-framing cut, wash, and luxury blow-dry finish.', '₹1,299', '45 min', 3, true),
  ('Hair', 'Executive Style Haircut — Men', 'Precision scissor cut, beard line sculpting, and hot towel finish.', '₹799', '35 min', 4, true),
  ('Hair', 'Botox Hair Reconstruction Therapy', 'Anti-ageing protein treatment to restore elasticity and eliminate frizz for 3 months.', '₹4,499', '150 min', 5, true),
  ('Skin & Face', 'Hydra Glow Collagen Facial', 'Gentle suction deep-pore detox followed by cold peptide ultrasound infusion for glass skin.', '₹2,499', '60 min', 6, true),
  ('Skin & Face', '24K Pure Gold Radiance Facial', 'Pure gold leaf ritual to accelerate cellular renewal and deliver instant party radiance.', '₹3,499', '75 min', 7, true),
  ('Skin & Face', 'Organic Berry Skin Polishing & De-Tan', 'Botanical antioxidant scrub and restorative brightening pack for tanned skin.', '₹1,499', '40 min', 8, true),
  ('Nails', 'Luxury Gel Manicure & Minimal Nail Art', 'Exfoliating hand massage, cuticle therapy, long-wear UV gel, and custom nail art.', '₹1,199', '45 min', 9, true),
  ('Nails', 'Aroma Spa Pedicure with Paraffin Dip', 'Revitalizing foot soak, volcanic stone massage, and deep moisture paraffin mask.', '₹1,499', '55 min', 10, true),
  ('Spa', 'Aroma Stress-Relief Full Body Massage', 'Deep tissue tension relief using warm Ayurvedic botanicals in an ambient, private suite.', '₹2,799', '60 min', 11, true),
  ('Bridal', 'Royal HD Airbrush Bridal Makeover', 'Full bridal couture look with HD airbrush makeup, international hair couture, and draping.', '₹9,999', '180 min', 12, true),
  ('Bridal', 'Pre-Bridal Glow Package (2 Days)', 'Complete body polishing, Hydra Glow facial, manicure, pedicure, and hair spa.', '₹7,499', '240 min', 13, true),
  ('Grooming', 'Royal Beard Sculpting & Oil Spa', 'Straight razor contouring, hot steam therapy, and nourishing almond-argan massage.', '₹599', '25 min', 14, true)
ON CONFLICT DO NOTHING;

-- Copy to Services Draft
INSERT INTO public.services_draft (category, name, description, price, duration, sort_order, is_active)
SELECT category, name, description, price, duration, sort_order, is_active FROM public.services
ON CONFLICT DO NOTHING;

-- 3. Gallery Showcase Images
INSERT INTO public.gallery_images (image_url, caption, alt_text, category, sort_order, is_published) VALUES
  ('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80', 'Modern Salon Ambience & Styling Stations', 'Salon Ambience', 'Salon', 1, true),
  ('https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80', 'Bespoke Balayage & Gloss Transformation', 'Hair Colour', 'Hair', 2, true),
  ('https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80', 'Hydra Glow Facial & Skin Rejuvenation', 'Facial Treatment', 'Skin', 3, true),
  ('https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=800&q=80', 'Royal Bridal Makeover & Hair Couture', 'Bridal Makeup', 'Bridal', 4, true),
  ('https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80', 'Minimalist Gel Manicure & Pastel Nail Art', 'Nail Art', 'Nails', 5, true),
  ('https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80', 'Aroma Detox & Relaxation Spa Suite', 'Spa Room', 'Spa', 6, true)
ON CONFLICT DO NOTHING;

-- 4. Initial Sample Enquiries (So inbox is not empty in client demo)
INSERT INTO public.enquiries (name, phone, email, message, status) VALUES
  ('Sneha Kapoor', '+91 98201 44521', 'sneha.k@gmail.com', 'Interested in Bespoke Balayage hair coloring for this Saturday afternoon.', 'New'),
  ('Rohan Mehra', '+91 99302 55198', 'rohan.m@yahoo.com', 'Would like to book an appointment for Signature Keratin Hair Spa tomorrow at 4 PM.', 'In Progress'),
  ('Pooja Verma', '+91 97110 88234', 'pooja.verma@outlook.com', 'Hydra Glow Collagen Facial inquiry for attending an upcoming wedding.', 'Resolved')
ON CONFLICT DO NOTHING;
