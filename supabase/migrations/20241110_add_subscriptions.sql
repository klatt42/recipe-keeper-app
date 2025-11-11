-- Add subscription fields to users table
-- This migration adds Stripe subscription tracking to the auth.users metadata

-- Create a subscriptions table to track user subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Stripe IDs
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,

  -- Subscription status
  status TEXT NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'active', 'canceled', 'past_due', 'trialing')),
  plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'monthly', 'annual')),

  -- Dates
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,

  -- Referral tracking
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES auth.users(id),
  referral_credits INTEGER DEFAULT 0,

  -- Usage tracking
  recipe_count INTEGER DEFAULT 0,
  recipe_limit INTEGER DEFAULT 25, -- Free tier limit

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_referral_code ON public.subscriptions(referral_code);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read their own subscription
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own subscription (for client-side updates)
CREATE POLICY "Users can update own subscription"
  ON public.subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can do everything (for webhooks)
CREATE POLICY "Service role has full access to subscriptions"
  ON public.subscriptions
  FOR ALL
  USING (auth.role() = 'service_role');

-- Function to generate unique referral codes
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to create subscription on user signup
CREATE OR REPLACE FUNCTION create_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (
    user_id,
    status,
    plan_type,
    referral_code,
    recipe_limit
  ) VALUES (
    NEW.id,
    'free',
    'free',
    generate_referral_code(),
    25
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create subscription when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_subscription();

-- Function to update recipe count
CREATE OR REPLACE FUNCTION increment_recipe_count(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.subscriptions
  SET recipe_count = recipe_count + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can create recipe (under limit)
CREATE OR REPLACE FUNCTION can_create_recipe(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
  v_limit INTEGER;
  v_status TEXT;
BEGIN
  SELECT recipe_count, recipe_limit, status
  INTO v_count, v_limit, v_status
  FROM public.subscriptions
  WHERE user_id = p_user_id;

  -- Premium users have unlimited recipes
  IF v_status = 'active' THEN
    RETURN TRUE;
  END IF;

  -- Free users are limited
  RETURN v_count < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update subscription from Stripe webhook
CREATE OR REPLACE FUNCTION update_subscription_from_stripe(
  p_user_id UUID,
  p_stripe_customer_id TEXT,
  p_stripe_subscription_id TEXT,
  p_stripe_price_id TEXT,
  p_status TEXT,
  p_current_period_start TIMESTAMPTZ,
  p_current_period_end TIMESTAMPTZ,
  p_cancel_at TIMESTAMPTZ DEFAULT NULL,
  p_canceled_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_plan_type TEXT;
  v_recipe_limit INTEGER;
BEGIN
  -- Determine plan type from price ID
  IF p_stripe_price_id = 'price_1SS2OGKPbMFl0oo4qS3jfiQN' THEN
    v_plan_type := 'monthly';
  ELSIF p_stripe_price_id = 'price_1SS2ZOKPbMFl0oo4DavTGZ9' THEN
    v_plan_type := 'annual';
  ELSE
    v_plan_type := 'free';
  END IF;

  -- Set recipe limit based on status
  IF p_status = 'active' THEN
    v_recipe_limit := 999999; -- Unlimited for premium
  ELSE
    v_recipe_limit := 25; -- Free tier
  END IF;

  -- Update subscription
  UPDATE public.subscriptions
  SET
    stripe_customer_id = p_stripe_customer_id,
    stripe_subscription_id = p_stripe_subscription_id,
    stripe_price_id = p_stripe_price_id,
    status = p_status,
    plan_type = v_plan_type,
    recipe_limit = v_recipe_limit,
    current_period_start = p_current_period_start,
    current_period_end = p_current_period_end,
    cancel_at = p_cancel_at,
    canceled_at = p_canceled_at,
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON TABLE public.subscriptions IS 'Tracks user subscriptions and Stripe billing information';
