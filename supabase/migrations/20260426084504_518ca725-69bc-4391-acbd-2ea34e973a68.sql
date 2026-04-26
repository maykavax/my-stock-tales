CREATE TABLE public.stock_names (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  short_name TEXT,
  long_name TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, symbol)
);

ALTER TABLE public.stock_names ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stock names"
ON public.stock_names FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stock names"
ON public.stock_names FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stock names"
ON public.stock_names FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own stock names"
ON public.stock_names FOR DELETE TO authenticated
USING (auth.uid() = user_id);