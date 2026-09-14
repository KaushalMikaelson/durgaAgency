-- =========================================================
-- Durga Tractor Agency - Supabase Database Schema
-- =========================================================
-- Copy and paste this script into your Supabase SQL Editor:
-- Supabase Dashboard -> Project -> SQL Editor -> New query -> Run
-- =========================================================

-- 1. BILLS TABLE
CREATE TABLE IF NOT EXISTS public.bills (
    id TEXT PRIMARY KEY,
    bill_number TEXT NOT NULL,
    date TEXT,
    customer_name TEXT,
    address TEXT,
    phone TEXT,
    vehicle TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    total_rupees INTEGER DEFAULT 0,
    total_paise INTEGER DEFAULT 0,
    amount_words TEXT,
    payment_status TEXT DEFAULT 'Paid',
    paid_amount NUMERIC DEFAULT 0,
    due_amount NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure payment fields exist if table was previously created
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Paid';
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS paid_amount NUMERIC DEFAULT 0;
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS due_amount NUMERIC DEFAULT 0;

-- 2. LEADS TABLE
CREATE TABLE IF NOT EXISTS public.leads (
    id TEXT PRIMARY KEY,
    name TEXT,
    phone TEXT,
    village TEXT,
    stage TEXT DEFAULT 'Enquiry',
    buying_score INTEGER DEFAULT 0,
    interested_model_id TEXT,
    land_acres NUMERIC DEFAULT 0,
    budget_max NUMERIC DEFAULT 0,
    crops JSONB DEFAULT '[]'::jsonb,
    soil_type TEXT,
    current_tractor TEXT,
    next_action TEXT,
    last_contact_date TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TRACTORS TABLE
CREATE TABLE IF NOT EXISTS public.tractors (
    id TEXT PRIMARY KEY,
    brand TEXT,
    model TEXT,
    hp INTEGER,
    price NUMERIC DEFAULT 0,
    dealer_purchase_cost NUMERIC DEFAULT 0,
    stock_count INTEGER DEFAULT 0,
    chassis_list JSONB DEFAULT '[]'::jsonb,
    drive TEXT,
    data JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'In Stock',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY,
    date TEXT,
    category TEXT,
    amount NUMERIC DEFAULT 0,
    paid_to TEXT,
    payment_mode TEXT,
    status TEXT DEFAULT 'Pending',
    approved_by TEXT,
    chassis_tag TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. CASH TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.cash_transactions (
    id TEXT PRIMARY KEY,
    date TEXT,
    type TEXT DEFAULT 'IN',
    category TEXT,
    amount NUMERIC DEFAULT 0,
    party_name TEXT,
    payment_mode TEXT,
    notes TEXT,
    ref TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. DEMOS TABLE
CREATE TABLE IF NOT EXISTS public.demos (
    id TEXT PRIMARY KEY,
    farmer_name TEXT,
    phone TEXT,
    village TEXT,
    tractor_model TEXT,
    implement TEXT,
    scheduled_date TEXT,
    soil_type TEXT,
    status TEXT DEFAULT 'Scheduled',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY,
    data JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. QUOTES TABLE
CREATE TABLE IF NOT EXISTS public.quotes (
    id TEXT PRIMARY KEY,
    quote_number TEXT,
    date TEXT,
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================================
-- Enable Row Level Security (RLS) & Public Policies
-- =========================================================
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Allow anon key full CRUD access (can be restricted later if auth is added)
DROP POLICY IF EXISTS "Allow all on bills" ON public.bills;
CREATE POLICY "Allow all on bills" ON public.bills FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on leads" ON public.leads;
CREATE POLICY "Allow all on leads" ON public.leads FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on tractors" ON public.tractors;
CREATE POLICY "Allow all on tractors" ON public.tractors FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on expenses" ON public.expenses;
CREATE POLICY "Allow all on expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on cash_transactions" ON public.cash_transactions;
CREATE POLICY "Allow all on cash_transactions" ON public.cash_transactions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on demos" ON public.demos;
CREATE POLICY "Allow all on demos" ON public.demos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on settings" ON public.settings;
CREATE POLICY "Allow all on settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on quotes" ON public.quotes;
CREATE POLICY "Allow all on quotes" ON public.quotes FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime publications for all tables safely (Idempotent)
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.bills;
    EXCEPTION WHEN duplicate_object THEN
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
    EXCEPTION WHEN duplicate_object THEN
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.tractors;
    EXCEPTION WHEN duplicate_object THEN
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
    EXCEPTION WHEN duplicate_object THEN
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.cash_transactions;
    EXCEPTION WHEN duplicate_object THEN
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.demos;
    EXCEPTION WHEN duplicate_object THEN
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
    EXCEPTION WHEN duplicate_object THEN
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.quotes;
    EXCEPTION WHEN duplicate_object THEN
    END;
END $$;
