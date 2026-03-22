-- Doktorkollen Database Schema
-- Run this in your Supabase SQL editor to set up the database

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for full-text search

-- =========================================
-- Cities
-- =========================================
CREATE TABLE IF NOT EXISTS cities (
  slug        TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  lat         DOUBLE PRECISION NOT NULL,
  lng         DOUBLE PRECISION NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- Services (Tjänster)
-- =========================================
CREATE TABLE IF NOT EXISTS services (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug             TEXT UNIQUE NOT NULL,
  name             TEXT NOT NULL,
  description      TEXT NOT NULL,
  long_description TEXT NOT NULL,
  icon             TEXT NOT NULL DEFAULT 'Stethoscope',
  specialties      TEXT[] NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS services_slug_idx ON services (slug);
CREATE INDEX IF NOT EXISTS services_name_trgm_idx ON services USING gin (name gin_trgm_ops);

-- =========================================
-- Conditions (Tillstånd)
-- =========================================
CREATE TABLE IF NOT EXISTS conditions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug             TEXT UNIQUE NOT NULL,
  name             TEXT NOT NULL,
  description      TEXT NOT NULL,
  symptoms         TEXT[] NOT NULL DEFAULT '{}',
  treatments       TEXT[] NOT NULL DEFAULT '{}',
  when_to_visit    TEXT NOT NULL DEFAULT '',
  faq              JSONB NOT NULL DEFAULT '[]',
  related_services TEXT[] NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS conditions_slug_idx ON conditions (slug);
CREATE INDEX IF NOT EXISTS conditions_name_trgm_idx ON conditions USING gin (name gin_trgm_ops);

-- =========================================
-- Clinics (Kliniker)
-- =========================================
CREATE TABLE IF NOT EXISTS clinics (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  address     TEXT NOT NULL,
  city        TEXT NOT NULL,
  city_slug   TEXT NOT NULL REFERENCES cities (slug) ON DELETE RESTRICT,
  phone       TEXT NOT NULL DEFAULT '',
  email       TEXT NOT NULL DEFAULT '',
  website     TEXT NOT NULL DEFAULT '',
  booking_url TEXT NOT NULL DEFAULT '',
  lat         DOUBLE PRECISION NOT NULL,
  lng         DOUBLE PRECISION NOT NULL,
  services    TEXT[] NOT NULL DEFAULT '{}',
  description TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS clinics_slug_idx ON clinics (slug);
CREATE INDEX IF NOT EXISTS clinics_city_slug_idx ON clinics (city_slug);
CREATE INDEX IF NOT EXISTS clinics_name_trgm_idx ON clinics USING gin (name gin_trgm_ops);

-- =========================================
-- Professionals (Vårdgivare)
-- =========================================
CREATE TABLE IF NOT EXISTS professionals (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  title         TEXT NOT NULL,
  specialties   TEXT[] NOT NULL DEFAULT '{}',
  city_slug     TEXT NOT NULL REFERENCES cities (slug) ON DELETE RESTRICT,
  city          TEXT NOT NULL,
  introduction  TEXT NOT NULL DEFAULT '',
  booking_url   TEXT NOT NULL DEFAULT '',
  lat           DOUBLE PRECISION NOT NULL,
  lng           DOUBLE PRECISION NOT NULL,
  image_url     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS professionals_slug_idx ON professionals (slug);
CREATE INDEX IF NOT EXISTS professionals_city_slug_idx ON professionals (city_slug);
CREATE INDEX IF NOT EXISTS professionals_name_trgm_idx ON professionals USING gin (name gin_trgm_ops);

-- =========================================
-- Junction: Professional <-> Clinic
-- =========================================
CREATE TABLE IF NOT EXISTS professional_clinics (
  professional_id UUID NOT NULL REFERENCES professionals (id) ON DELETE CASCADE,
  clinic_id       UUID NOT NULL REFERENCES clinics (id) ON DELETE CASCADE,
  PRIMARY KEY (professional_id, clinic_id)
);

CREATE INDEX IF NOT EXISTS prof_clinics_clinic_idx ON professional_clinics (clinic_id);

-- =========================================
-- Junction: Professional <-> Service
-- =========================================
CREATE TABLE IF NOT EXISTS professional_services (
  professional_id UUID NOT NULL REFERENCES professionals (id) ON DELETE CASCADE,
  service_id      UUID NOT NULL REFERENCES services (id) ON DELETE CASCADE,
  PRIMARY KEY (professional_id, service_id)
);

CREATE INDEX IF NOT EXISTS prof_services_service_idx ON professional_services (service_id);

-- =========================================
-- Junction: Professional <-> Condition
-- =========================================
CREATE TABLE IF NOT EXISTS professional_conditions (
  professional_id UUID NOT NULL REFERENCES professionals (id) ON DELETE CASCADE,
  condition_id    UUID NOT NULL REFERENCES conditions (id) ON DELETE CASCADE,
  PRIMARY KEY (professional_id, condition_id)
);

CREATE INDEX IF NOT EXISTS prof_conditions_condition_idx ON professional_conditions (condition_id);

-- =========================================
-- Updated_at triggers
-- =========================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER conditions_updated_at
  BEFORE UPDATE ON conditions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER clinics_updated_at
  BEFORE UPDATE ON clinics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER professionals_updated_at
  BEFORE UPDATE ON professionals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =========================================
-- Row Level Security (RLS)
-- =========================================
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_conditions ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables
CREATE POLICY "Public read cities" ON cities FOR SELECT USING (true);
CREATE POLICY "Public read services" ON services FOR SELECT USING (true);
CREATE POLICY "Public read conditions" ON conditions FOR SELECT USING (true);
CREATE POLICY "Public read clinics" ON clinics FOR SELECT USING (true);
CREATE POLICY "Public read professionals" ON professionals FOR SELECT USING (true);
CREATE POLICY "Public read professional_clinics" ON professional_clinics FOR SELECT USING (true);
CREATE POLICY "Public read professional_services" ON professional_services FOR SELECT USING (true);
CREATE POLICY "Public read professional_conditions" ON professional_conditions FOR SELECT USING (true);

-- =========================================
-- Helper views for easy querying
-- =========================================

-- Professional with all related data
CREATE OR REPLACE VIEW v_professionals AS
SELECT
  p.*,
  array_agg(DISTINCT pc.clinic_id) FILTER (WHERE pc.clinic_id IS NOT NULL) AS clinic_ids,
  array_agg(DISTINCT ps.service_id) FILTER (WHERE ps.service_id IS NOT NULL) AS service_ids,
  array_agg(DISTINCT pco.condition_id) FILTER (WHERE pco.condition_id IS NOT NULL) AS condition_ids
FROM professionals p
LEFT JOIN professional_clinics pc ON p.id = pc.professional_id
LEFT JOIN professional_services ps ON p.id = ps.professional_id
LEFT JOIN professional_conditions pco ON p.id = pco.professional_id
GROUP BY p.id;

-- Clinic with professional IDs
CREATE OR REPLACE VIEW v_clinics AS
SELECT
  c.*,
  array_agg(DISTINCT pc.professional_id) FILTER (WHERE pc.professional_id IS NOT NULL) AS professional_ids
FROM clinics c
LEFT JOIN professional_clinics pc ON c.id = pc.clinic_id
GROUP BY c.id;
