-- Admin and Promo Code System Migration
-- This migration adds promo codes, subscription events, and admin functionality

-- ============================================================================
-- PROMO CODES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Code details
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,

  -- Type and features
  type TEXT NOT NULL CHECK (type IN ('family', 'trial', 'discount', 'limited', 'influencer')),
  max_recipes INTEGER, -- NULL means unlimited
  features_enabled JSONB DEFAULT '{"premium": true}'::jsonb,

  -- Usage limits
  max_uses INTEGER, -- NULL means unlimited
  current_uses INTEGER DEFAULT 0,

  -- Pricing
  discount_percent INTEGER DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  months_free INTEGER DEFAULT 0,

  -- Duration
  duration_days INTEGER, -- NULL means unlimited duration
  expires_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Tracking
  created_by TEXT NOT NULL, -- Admin email
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_type ON public.promo_codes(type);
CREATE INDEX IF NOT EXISTS idx_promo_codes_is_active ON public.promo_codes(is_active);

-- Enable RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can read active promo codes to validate them
CREATE POLICY "Anyone can view active promo codes"
  ON public.promo_codes
  FOR SELECT
  USING (is_active = true);

-- Service role can do everything
CREATE POLICY "Service role has full access to promo codes"
  ON public.promo_codes
  FOR ALL
  USING (auth.role() = 'service_role');

COMMENT ON TABLE public.promo_codes IS 'Promotional codes for free trials, discounts, and special access';


-- ============================================================================
-- USER PROMO CODES (Junction Table)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  promo_code_id UUID NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,

  -- Usage tracking
  recipes_used INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  -- Dates
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Calculated when applied
  deactivated_at TIMESTAMPTZ,

  -- Unique constraint: one active promo per user
  UNIQUE(user_id, promo_code_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_promo_codes_user_id ON public.user_promo_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_promo_codes_promo_code_id ON public.user_promo_codes(promo_code_id);
CREATE INDEX IF NOT EXISTS idx_user_promo_codes_active ON public.user_promo_codes(is_active);

-- Enable RLS
ALTER TABLE public.user_promo_codes ENABLE ROW LEVEL SECURITY;

-- Users can view their own promo codes
CREATE POLICY "Users can view own promo codes"
  ON public.user_promo_codes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role has full access
CREATE POLICY "Service role has full access to user promo codes"
  ON public.user_promo_codes
  FOR ALL
  USING (auth.role() = 'service_role');

COMMENT ON TABLE public.user_promo_codes IS 'Tracks which promo codes users have applied';


-- ============================================================================
-- SUBSCRIPTION EVENTS (For Churn Tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Event details
  event_type TEXT NOT NULL CHECK (event_type IN (
    'created', 'subscribed', 'upgraded', 'downgraded',
    'cancelled', 'renewed', 'expired', 'promo_applied'
  )),

  -- State change
  from_tier TEXT CHECK (from_tier IN ('free', 'monthly', 'annual', 'promo')),
  to_tier TEXT CHECK (to_tier IN ('free', 'monthly', 'annual', 'promo')),

  -- Stripe reference
  stripe_subscription_id TEXT,
  stripe_event_id TEXT,

  -- Financial impact
  mrr_change DECIMAL(10, 2) DEFAULT 0, -- Monthly Recurring Revenue change

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timing
  occurred_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON public.subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_event_type ON public.subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_subscription_events_occurred_at ON public.subscription_events(occurred_at DESC);

-- Enable RLS
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own events
CREATE POLICY "Users can view own subscription events"
  ON public.subscription_events
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role has full access
CREATE POLICY "Service role has full access to subscription events"
  ON public.subscription_events
  FOR ALL
  USING (auth.role() = 'service_role');

COMMENT ON TABLE public.subscription_events IS 'Audit log of subscription changes for analytics and churn tracking';


-- ============================================================================
-- ADMIN USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'support')),
  is_active BOOLEAN DEFAULT true,
  permissions JSONB DEFAULT '{
    "view_dashboard": true,
    "manage_users": true,
    "manage_promo_codes": true,
    "view_revenue": true,
    "export_data": true,
    "send_emails": true
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert the main admin
INSERT INTO public.admin_users (email, role, is_active)
VALUES ('klatt42@gmail.com', 'super_admin', true)
ON CONFLICT (email) DO UPDATE SET role = 'super_admin', is_active = true;

-- Index
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only service role can access
CREATE POLICY "Service role has full access to admin users"
  ON public.admin_users
  FOR ALL
  USING (auth.role() = 'service_role');

COMMENT ON TABLE public.admin_users IS 'Admin users with elevated permissions';


-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to apply promo code
CREATE OR REPLACE FUNCTION apply_promo_code(
  p_user_id UUID,
  p_code TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_promo_code RECORD;
  v_expires_at TIMESTAMPTZ;
  v_new_limit INTEGER;
BEGIN
  -- Get promo code
  SELECT * INTO v_promo_code
  FROM public.promo_codes
  WHERE code = UPPER(p_code)
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (max_uses IS NULL OR current_uses < max_uses);

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid or expired promo code'
    );
  END IF;

  -- Check if user already has this promo code
  IF EXISTS (
    SELECT 1 FROM public.user_promo_codes
    WHERE user_id = p_user_id AND promo_code_id = v_promo_code.id
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Promo code already applied'
    );
  END IF;

  -- Calculate expiration
  IF v_promo_code.duration_days IS NOT NULL THEN
    v_expires_at := NOW() + (v_promo_code.duration_days || ' days')::INTERVAL;
  ELSE
    v_expires_at := NULL;
  END IF;

  -- Apply promo code to user
  INSERT INTO public.user_promo_codes (
    user_id,
    promo_code_id,
    expires_at
  ) VALUES (
    p_user_id,
    v_promo_code.id,
    v_expires_at
  );

  -- Update promo code usage count
  UPDATE public.promo_codes
  SET current_uses = current_uses + 1,
      updated_at = NOW()
  WHERE id = v_promo_code.id;

  -- Update user's recipe limit if applicable
  IF v_promo_code.max_recipes IS NOT NULL THEN
    v_new_limit := v_promo_code.max_recipes;
  ELSE
    v_new_limit := 999999; -- Unlimited
  END IF;

  UPDATE public.subscriptions
  SET recipe_limit = v_new_limit,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Log the event
  INSERT INTO public.subscription_events (
    user_id,
    event_type,
    to_tier,
    metadata
  ) VALUES (
    p_user_id,
    'promo_applied',
    'promo',
    jsonb_build_object(
      'promo_code', v_promo_code.code,
      'promo_name', v_promo_code.name,
      'promo_type', v_promo_code.type
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'promo_code', v_promo_code.code,
    'promo_name', v_promo_code.name,
    'max_recipes', v_new_limit,
    'expires_at', v_expires_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to check if user has active promo code
CREATE OR REPLACE FUNCTION get_active_promo_code(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result RECORD;
BEGIN
  SELECT
    pc.code,
    pc.name,
    pc.type,
    pc.max_recipes,
    upc.recipes_used,
    upc.expires_at,
    upc.applied_at
  INTO v_result
  FROM public.user_promo_codes upc
  JOIN public.promo_codes pc ON pc.id = upc.promo_code_id
  WHERE upc.user_id = p_user_id
    AND upc.is_active = true
    AND (upc.expires_at IS NULL OR upc.expires_at > NOW())
  LIMIT 1;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'has_promo', true,
      'code', v_result.code,
      'name', v_result.name,
      'type', v_result.type,
      'max_recipes', v_result.max_recipes,
      'recipes_used', v_result.recipes_used,
      'expires_at', v_result.expires_at,
      'applied_at', v_result.applied_at
    );
  ELSE
    RETURN jsonb_build_object('has_promo', false);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to log subscription event
CREATE OR REPLACE FUNCTION log_subscription_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_from_tier TEXT DEFAULT NULL,
  p_to_tier TEXT DEFAULT NULL,
  p_mrr_change DECIMAL DEFAULT 0,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.subscription_events (
    user_id,
    event_type,
    from_tier,
    to_tier,
    mrr_change,
    metadata
  ) VALUES (
    p_user_id,
    p_event_type,
    p_from_tier,
    p_to_tier,
    p_mrr_change,
    p_metadata
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(p_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE email = p_email AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Updated function to check if user can create recipe (includes promo codes)
CREATE OR REPLACE FUNCTION can_create_recipe(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
  v_limit INTEGER;
  v_status TEXT;
  v_promo JSONB;
BEGIN
  SELECT recipe_count, recipe_limit, status
  INTO v_count, v_limit, v_status
  FROM public.subscriptions
  WHERE user_id = p_user_id;

  -- Premium users have unlimited recipes
  IF v_status = 'active' THEN
    RETURN TRUE;
  END IF;

  -- Check for active promo code
  v_promo := get_active_promo_code(p_user_id);

  IF (v_promo->>'has_promo')::boolean = true THEN
    -- Has active promo code
    IF (v_promo->>'max_recipes') IS NULL THEN
      -- Unlimited recipes with promo
      RETURN TRUE;
    ELSE
      -- Check promo limit
      RETURN (v_promo->>'recipes_used')::integer < (v_promo->>'max_recipes')::integer;
    END IF;
  END IF;

  -- Free users are limited
  RETURN v_count < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Trigger to update promo code recipe count
CREATE OR REPLACE FUNCTION update_promo_recipe_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user_promo_codes if user has active promo
  UPDATE public.user_promo_codes
  SET recipes_used = recipes_used + 1
  WHERE user_id = NEW.user_id
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on recipes table to update promo usage
-- Note: This assumes recipes table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'recipes') THEN
    DROP TRIGGER IF EXISTS on_recipe_created_update_promo ON public.recipes;
    CREATE TRIGGER on_recipe_created_update_promo
      AFTER INSERT ON public.recipes
      FOR EACH ROW
      EXECUTE FUNCTION update_promo_recipe_count();
  END IF;
END $$;


-- ============================================================================
-- SAMPLE PROMO CODES
-- ============================================================================

-- FAMILY promo code (as requested)
INSERT INTO public.promo_codes (
  code,
  name,
  description,
  type,
  max_recipes,
  features_enabled,
  is_active,
  created_by
) VALUES (
  'FAMILY2025',
  'Family & Friends',
  'Free access with up to 50 recipes for family and friends testing',
  'family',
  50,
  '{"premium": true, "ai_features": true, "export": true}'::jsonb,
  true,
  'klatt42@gmail.com'
) ON CONFLICT (code) DO NOTHING;

-- Optional: Trial promo
INSERT INTO public.promo_codes (
  code,
  name,
  description,
  type,
  max_recipes,
  duration_days,
  features_enabled,
  is_active,
  created_by
) VALUES (
  'TRIAL30',
  '30-Day Free Trial',
  'Full access for 30 days',
  'trial',
  NULL, -- Unlimited during trial
  30,
  '{"premium": true, "ai_features": true, "export": true}'::jsonb,
  true,
  'klatt42@gmail.com'
) ON CONFLICT (code) DO NOTHING;

COMMENT ON FUNCTION apply_promo_code IS 'Apply a promo code to a user account';
COMMENT ON FUNCTION get_active_promo_code IS 'Get the active promo code for a user';
COMMENT ON FUNCTION is_admin IS 'Check if an email belongs to an admin user';
