-- ============================================================
-- Phase 2: Accounting, Maintenance, Employees / Time Cards / Tasks / Calendar
-- ============================================================

-- ── Vendors ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.vendors (
  id             UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name           TEXT        NOT NULL,
  contact_name   TEXT,
  email          TEXT,
  phone          TEXT,
  address        TEXT,
  service_type   TEXT,
  tax_id         TEXT,
  payment_terms  TEXT,
  notes          TEXT,
  is_active      BOOLEAN     DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own vendors" ON public.vendors
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── Chart of Accounts ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chart_of_accounts (
  id               UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_number   TEXT,
  account_name     TEXT        NOT NULL,
  account_type     TEXT        CHECK (account_type IN ('asset','liability','equity','income','expense')),
  parent_account_id UUID,
  is_default       BOOLEAN     DEFAULT false,
  description      TEXT,
  is_active        BOOLEAN     DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own accounts" ON public.chart_of_accounts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Transactions ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transactions (
  id               UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date             DATE        NOT NULL,
  description      TEXT,
  amount           NUMERIC     NOT NULL,
  transaction_type TEXT        CHECK (transaction_type IN ('charge','payment','credit','refund','adjustment')),
  category         TEXT        CHECK (category IN ('rent','late_fee','security_deposit','maintenance','utility','insurance','tax','management_fee','application_fee','pet_fee','parking','other')),
  property_id      UUID        REFERENCES public.properties(id) ON DELETE SET NULL,
  unit_id          UUID        REFERENCES public.units(id) ON DELETE SET NULL,
  tenant_id        UUID        REFERENCES public.tenants(id) ON DELETE SET NULL,
  lease_id         UUID        REFERENCES public.leases(id) ON DELETE SET NULL,
  vendor_id        UUID        REFERENCES public.vendors(id) ON DELETE SET NULL,
  account_id       UUID        REFERENCES public.chart_of_accounts(id) ON DELETE SET NULL,
  reference_number TEXT,
  is_reconciled    BOOLEAN     DEFAULT false,
  notes            TEXT,
  receipt_url      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own transactions" ON public.transactions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Invoices ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.invoices (
  id             UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id      UUID        NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  property_id    UUID        REFERENCES public.properties(id) ON DELETE SET NULL,
  invoice_number TEXT,
  invoice_date   DATE,
  due_date       DATE,
  amount         NUMERIC     NOT NULL,
  status         TEXT        NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','approved','paid','overdue','cancelled')),
  description    TEXT,
  work_order_id  UUID,
  receipt_url    TEXT,
  paid_date      DATE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own invoices" ON public.invoices
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Employees ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.employees (
  id                     UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name             TEXT        NOT NULL,
  last_name              TEXT        NOT NULL,
  email                  TEXT,
  phone                  TEXT,
  role                   TEXT        CHECK (role IN ('property_manager','maintenance_tech','leasing_agent','office_admin','other')),
  department             TEXT,
  hire_date              DATE,
  hourly_rate            NUMERIC,
  overtime_rate          NUMERIC,
  employment_type        TEXT        CHECK (employment_type IN ('full_time','part_time','contractor')),
  status                 TEXT        NOT NULL DEFAULT 'active'
                           CHECK (status IN ('active','inactive','terminated')),
  emergency_contact_name  TEXT,
  emergency_contact_phone TEXT,
  profile_photo_url      TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id                UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own employees" ON public.employees
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── Work Orders (comprehensive, replacing simple work_orders) ─────────────────
-- Drop old simple table and recreate with comprehensive schema
DROP TABLE IF EXISTS public.work_orders CASCADE;

CREATE TABLE public.work_orders (
  id                       UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title                    TEXT        NOT NULL,
  description              TEXT,
  property_id              UUID        NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  unit_id                  UUID        REFERENCES public.units(id) ON DELETE SET NULL,
  tenant_id                UUID        REFERENCES public.tenants(id) ON DELETE SET NULL,
  category                 TEXT        CHECK (category IN ('plumbing','electrical','hvac','appliance','structural','landscaping','pest_control','general','other')),
  priority                 TEXT        NOT NULL DEFAULT 'routine'
                             CHECK (priority IN ('emergency','urgent','routine','low')),
  maintenance_type         TEXT        DEFAULT 'corrective'
                             CHECK (maintenance_type IN ('routine','preventive','corrective','emergency')),
  status                   TEXT        NOT NULL DEFAULT 'submitted'
                             CHECK (status IN ('submitted','assessed','assigned','scheduled','in_progress','completed','cancelled')),
  assigned_to_employee_id  UUID        REFERENCES public.employees(id) ON DELETE SET NULL,
  assigned_to_vendor_id    UUID        REFERENCES public.vendors(id) ON DELETE SET NULL,
  scheduled_date           DATE,
  completed_date           DATE,
  estimated_cost           NUMERIC,
  actual_cost              NUMERIC,
  labor_hours              NUMERIC,
  materials_cost           NUMERIC,
  bill_to                  TEXT        DEFAULT 'owner'
                             CHECK (bill_to IN ('owner','tenant','insurance')),
  notes                    TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id                  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own work_orders" ON public.work_orders
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON public.work_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── Work Order Photos ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.work_order_photos (
  id            UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  work_order_id UUID        NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  photo_url     TEXT        NOT NULL,
  photo_type    TEXT        CHECK (photo_type IN ('before','during','after')),
  caption       TEXT,
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Work Order Comments ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.work_order_comments (
  id            UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  work_order_id UUID        NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  author_name   TEXT,
  comment       TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Preventive Maintenance Schedules ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.preventive_maintenance_schedules (
  id                      UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title                   TEXT        NOT NULL,
  description             TEXT,
  property_id             UUID        NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  unit_id                 UUID        REFERENCES public.units(id) ON DELETE SET NULL,
  category                TEXT        CHECK (category IN ('plumbing','electrical','hvac','appliance','structural','landscaping','pest_control','general','other')),
  frequency               TEXT        CHECK (frequency IN ('weekly','biweekly','monthly','quarterly','semiannual','annual')),
  next_due_date           DATE        NOT NULL,
  assigned_to_vendor_id   UUID        REFERENCES public.vendors(id) ON DELETE SET NULL,
  assigned_to_employee_id UUID        REFERENCES public.employees(id) ON DELETE SET NULL,
  estimated_cost          NUMERIC,
  is_active               BOOLEAN     DEFAULT true,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id                 UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.preventive_maintenance_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own pm_schedules" ON public.preventive_maintenance_schedules
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Time Entries ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.time_entries (
  id            UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id   UUID        NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  date          DATE        NOT NULL,
  clock_in      TIMESTAMPTZ,
  clock_out     TIMESTAMPTZ,
  total_hours   NUMERIC,
  break_minutes INTEGER     DEFAULT 0,
  entry_type    TEXT        DEFAULT 'regular'
                  CHECK (entry_type IN ('regular','overtime','holiday','pto','sick')),
  property_id   UUID        REFERENCES public.properties(id) ON DELETE SET NULL,
  work_order_id UUID        REFERENCES public.work_orders(id) ON DELETE SET NULL,
  notes         TEXT,
  status        TEXT        NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','approved','rejected','corrected')),
  approved_by   UUID,
  approved_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own time_entries" ON public.time_entries
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Tasks (comprehensive, replacing simple tasks table) ───────────────────────
DROP TABLE IF EXISTS public.tasks CASCADE;

CREATE TABLE public.tasks (
  id                  UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title               TEXT        NOT NULL,
  description         TEXT,
  assigned_to         UUID        REFERENCES public.employees(id) ON DELETE SET NULL,
  assigned_by         UUID,
  property_id         UUID        REFERENCES public.properties(id) ON DELETE SET NULL,
  category            TEXT        DEFAULT 'other'
                        CHECK (category IN ('administrative','leasing','maintenance_planning','compliance','training','financial','other')),
  priority            TEXT        NOT NULL DEFAULT 'medium'
                        CHECK (priority IN ('high','medium','low')),
  status              TEXT        NOT NULL DEFAULT 'todo'
                        CHECK (status IN ('todo','in_progress','completed','cancelled')),
  due_date            DATE,
  completed_date      DATE,
  is_recurring        BOOLEAN     DEFAULT false,
  recurrence_frequency TEXT       CHECK (recurrence_frequency IN ('daily','weekly','biweekly','monthly','quarterly','annual')),
  parent_task_id      UUID        REFERENCES public.tasks(id) ON DELETE SET NULL,
  sort_order          INTEGER     DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id             UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tasks" ON public.tasks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.task_checklist_items (
  id           UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id      UUID        NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  title        TEXT        NOT NULL,
  is_completed BOOLEAN     DEFAULT false,
  sort_order   INTEGER     DEFAULT 0,
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.task_comments (
  id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id     UUID        NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  author_name TEXT,
  comment     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Calendar Events (comprehensive, replacing simple calendar_events) ─────────
DROP TABLE IF EXISTS public.calendar_events CASCADE;

CREATE TABLE public.calendar_events (
  id                      UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title                   TEXT        NOT NULL,
  description             TEXT,
  event_type              TEXT        DEFAULT 'custom'
                            CHECK (event_type IN ('lease_expiry','move_in','move_out','maintenance','showing','task_due','pto','meeting','inspection','rent_due','custom')),
  start_datetime          TIMESTAMPTZ NOT NULL,
  end_datetime            TIMESTAMPTZ,
  all_day                 BOOLEAN     DEFAULT false,
  property_id             UUID        REFERENCES public.properties(id) ON DELETE SET NULL,
  unit_id                 UUID        REFERENCES public.units(id) ON DELETE SET NULL,
  employee_id             UUID        REFERENCES public.employees(id) ON DELETE SET NULL,
  tenant_id               UUID        REFERENCES public.tenants(id) ON DELETE SET NULL,
  related_id              UUID,
  related_type            TEXT,
  color                   TEXT,
  is_recurring            BOOLEAN     DEFAULT false,
  recurrence_rule         TEXT,
  reminder_minutes_before INTEGER,
  location                TEXT,
  notes                   TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id                 UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own calendar_events" ON public.calendar_events
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── PTO Requests ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pto_requests (
  id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID        NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  start_date  DATE        NOT NULL,
  end_date    DATE        NOT NULL,
  pto_type    TEXT        CHECK (pto_type IN ('vacation','sick','personal','bereavement','other')),
  hours       NUMERIC,
  status      TEXT        NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','approved','denied')),
  notes       TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.pto_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own pto_requests" ON public.pto_requests
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Seed chart_of_accounts defaults (inserted without user_id for discovery) ──
-- NOTE: In production use, seed these per-user when account is created.
-- For now this seeds a template. A function/trigger can copy them per user.
-- We skip the seed here since user_id is required and we don't know it at migration time.
-- The UI will insert default accounts on first load if none exist.
