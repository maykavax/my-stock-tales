-- Create metal_transactions table mirroring transactions for stocks
CREATE TABLE public.metal_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
  metal_type public.metal_type NOT NULL,
  grams NUMERIC NOT NULL CHECK (grams > 0),
  price_per_gram NUMERIC NOT NULL CHECK (price_per_gram > 0),
  source TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.metal_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own metal transactions"
ON public.metal_transactions FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own metal transactions"
ON public.metal_transactions FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own metal transactions"
ON public.metal_transactions FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own metal transactions"
ON public.metal_transactions FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Migrate existing metal_holdings to metal_transactions as 'buy' entries
INSERT INTO public.metal_transactions (user_id, type, metal_type, grams, price_per_gram, source, date, created_at)
SELECT
  user_id,
  'buy',
  metal_type,
  grams,
  avg_cost_try,
  purchase_source,
  COALESCE(created_at::date, CURRENT_DATE),
  created_at
FROM public.metal_holdings;

-- Drop the old table
DROP TABLE public.metal_holdings;