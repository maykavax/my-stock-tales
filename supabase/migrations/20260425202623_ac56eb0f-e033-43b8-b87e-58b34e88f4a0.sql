-- Enum for metal types
CREATE TYPE public.metal_type AS ENUM ('gold', 'silver', 'platinum', 'palladium');

-- Metal holdings table
CREATE TABLE public.metal_holdings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  metal_type public.metal_type NOT NULL,
  grams NUMERIC NOT NULL,
  avg_cost_try NUMERIC NOT NULL,
  purchase_source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.metal_holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own metal holdings"
ON public.metal_holdings FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own metal holdings"
ON public.metal_holdings FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own metal holdings"
ON public.metal_holdings FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own metal holdings"
ON public.metal_holdings FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX idx_metal_holdings_user ON public.metal_holdings(user_id);