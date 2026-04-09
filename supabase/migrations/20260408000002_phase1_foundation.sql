-- ============================================================
-- Phase 1: Foundation — Properties (extended), Units, Tenants (extended), Leases
-- ============================================================

-- ── Extend existing properties table ─────────────────────────────────────────
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS address_street   TEXT,
  ADD COLUMN IF NOT EXISTS address_city     TEXT,
  ADD COLUMN IF NOT EXISTS address_state    TEXT,
  ADD COLUMN IF NOT EXISTS address_zip      TEXT,
  ADD COLUMN IF NOT EXISTS property_type    TEXT CHECK (property_type IN ('single_family','multi_family','commercial','mixed')),
  ADD COLUMN IF NOT EXISTS total_units      INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS year_built       INTEGER,
  ADD COLUMN IF NOT EXISTS square_footage   INTEGER,
  ADD COLUMN IF NOT EXISTS purchase_date    DATE,
  ADD COLUMN IF NOT EXISTS purchase_price   NUMERIC,
  ADD COLUMN IF NOT EXISTS management_fee_percent NUMERIC,
  ADD COLUMN IF NOT EXISTS notes            TEXT,
  ADD COLUMN IF NOT EXISTS updated_at       TIMESTAMPTZ DEFAULT now();

-- ── Extend existing tenants table ────────────────────────────────────────────
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS first_name              TEXT,
  ADD COLUMN IF NOT EXISTS last_name               TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth           DATE,
  ADD COLUMN IF NOT EXISTS emergency_contact_name  TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS employer_name           TEXT,
  ADD COLUMN IF NOT EXISTS monthly_income          NUMERIC,
  ADD COLUMN IF NOT EXISTS previous_address        TEXT,
  ADD COLUMN IF NOT EXISTS notes                   TEXT;

-- ── Units ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.units (
  id               UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id      UUID        NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  unit_number      TEXT        NOT NULL,
  bedrooms         INTEGER,
  bathrooms        NUMERIC,
  square_footage   INTEGER,
  market_rent      NUMERIC,
  deposit_amount   NUMERIC,
  status           TEXT        NOT NULL DEFAULT 'vacant'
                     CHECK (status IN ('vacant','occupied','maintenance','pending_move_in')),
  amenities        TEXT[],
  current_lease_id UUID,       -- set when lease is active; FK added after leases table
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage units via property" ON public.units
  FOR ALL
  USING  (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.user_id = auth.uid()));

CREATE TRIGGER update_units_updated_at
  BEFORE UPDATE ON public.units
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── Leases ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.leases (
  id                  UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id             UUID        NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  tenant_id           UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  start_date          DATE        NOT NULL,
  end_date            DATE        NOT NULL,
  monthly_rent        NUMERIC     NOT NULL,
  security_deposit    NUMERIC,
  rent_due_day        INTEGER     DEFAULT 1,
  late_fee_amount     NUMERIC,
  late_fee_grace_days INTEGER     DEFAULT 5,
  auto_renew          BOOLEAN     DEFAULT false,
  status              TEXT        NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('active','expired','pending','terminated')),
  move_in_date        DATE,
  move_out_date       DATE,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id             UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own leases" ON public.leases
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_leases_updated_at
  BEFORE UPDATE ON public.leases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add FK from units.current_lease_id → leases now that leases table exists
ALTER TABLE public.units
  ADD CONSTRAINT fk_units_current_lease
  FOREIGN KEY (current_lease_id) REFERENCES public.leases(id) ON DELETE SET NULL
  NOT VALID; -- NOT VALID so existing rows aren't blocked
