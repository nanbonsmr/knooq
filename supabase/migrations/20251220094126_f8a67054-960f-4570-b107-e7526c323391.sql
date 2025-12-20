-- Create subscription status enum
CREATE TYPE public.subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'paused', 'trialing');

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  paddle_subscription_id TEXT UNIQUE,
  paddle_customer_id TEXT,
  status subscription_status NOT NULL DEFAULT 'active',
  plan_type TEXT NOT NULL DEFAULT 'monthly',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view their own subscription"
ON public.subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- Create function to check if user has pro subscription
CREATE OR REPLACE FUNCTION public.is_pro_user(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions
    WHERE user_id = check_user_id
      AND status = 'active'
      AND (current_period_end IS NULL OR current_period_end > now())
  )
$$;

-- Create notes table for Pro users
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  article_title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pro users can manage their notes"
ON public.notes
FOR ALL
USING (auth.uid() = user_id AND public.is_pro_user(auth.uid()));

CREATE POLICY "Users can view their own notes"
ON public.notes
FOR SELECT
USING (auth.uid() = user_id);

-- Create highlights table for Pro users
CREATE TABLE public.highlights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  article_title TEXT NOT NULL,
  text TEXT NOT NULL,
  color TEXT DEFAULT 'yellow',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pro users can manage their highlights"
ON public.highlights
FOR ALL
USING (auth.uid() = user_id AND public.is_pro_user(auth.uid()));

CREATE POLICY "Users can view their own highlights"
ON public.highlights
FOR SELECT
USING (auth.uid() = user_id);

-- Trigger for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
BEFORE UPDATE ON public.notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();