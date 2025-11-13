-- Activity Tracking Migration
-- Adds user activity tracking for DAU/MAU calculations

-- ============================================================================
-- ADD ACTIVITY FIELDS TO PROFILES
-- ============================================================================

-- Add last_active_at to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_profiles_last_active_at ON public.profiles(last_active_at);

-- Update existing profiles to have a last_active_at
UPDATE public.profiles
SET last_active_at = created_at
WHERE last_active_at IS NULL;

COMMENT ON COLUMN public.profiles.last_active_at IS 'Last time user was active in the app (for DAU/MAU tracking)';


-- ============================================================================
-- USER ACTIVITY LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  page_views INTEGER DEFAULT 1,
  recipes_viewed INTEGER DEFAULT 0,
  recipes_created INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one row per user per day
  UNIQUE(user_id, activity_date)
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON public.user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_activity_date ON public.user_activity_log(activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_date ON public.user_activity_log(user_id, activity_date);

-- Enable RLS
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own activity
CREATE POLICY "Users can view own activity log"
  ON public.user_activity_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role has full access
CREATE POLICY "Service role has full access to activity log"
  ON public.user_activity_log
  FOR ALL
  USING (auth.role() = 'service_role');

COMMENT ON TABLE public.user_activity_log IS 'Daily user activity tracking for DAU/MAU calculations';


-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id UUID,
  p_activity_type TEXT DEFAULT 'page_view'
)
RETURNS VOID AS $$
DECLARE
  v_today DATE;
BEGIN
  v_today := CURRENT_DATE;

  -- Update profiles last_active_at
  UPDATE public.profiles
  SET last_active_at = NOW()
  WHERE id = p_user_id;

  -- Insert or update daily activity log
  INSERT INTO public.user_activity_log (user_id, activity_date, page_views, last_activity_at)
  VALUES (p_user_id, v_today, 1, NOW())
  ON CONFLICT (user_id, activity_date)
  DO UPDATE SET
    page_views = user_activity_log.page_views + 1,
    last_activity_at = NOW();

  -- Update specific activity counters
  IF p_activity_type = 'recipe_view' THEN
    UPDATE public.user_activity_log
    SET recipes_viewed = recipes_viewed + 1
    WHERE user_id = p_user_id AND activity_date = v_today;
  ELSIF p_activity_type = 'recipe_create' THEN
    UPDATE public.user_activity_log
    SET recipes_created = recipes_created + 1
    WHERE user_id = p_user_id AND activity_date = v_today;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION log_user_activity IS 'Log user activity for DAU/MAU tracking';


-- Function to get DAU (Daily Active Users)
CREATE OR REPLACE FUNCTION get_dau(p_date DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT user_id)
    FROM public.user_activity_log
    WHERE activity_date = p_date
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to get MAU (Monthly Active Users)
CREATE OR REPLACE FUNCTION get_mau(p_date DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER AS $$
DECLARE
  v_start_date DATE;
BEGIN
  v_start_date := p_date - INTERVAL '30 days';

  RETURN (
    SELECT COUNT(DISTINCT user_id)
    FROM public.user_activity_log
    WHERE activity_date > v_start_date AND activity_date <= p_date
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to get WAU (Weekly Active Users)
CREATE OR REPLACE FUNCTION get_wau(p_date DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER AS $$
DECLARE
  v_start_date DATE;
BEGIN
  v_start_date := p_date - INTERVAL '7 days';

  RETURN (
    SELECT COUNT(DISTINCT user_id)
    FROM public.user_activity_log
    WHERE activity_date > v_start_date AND activity_date <= p_date
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- TRIGGER TO AUTO-LOG RECIPE CREATION
-- ============================================================================

CREATE OR REPLACE FUNCTION on_recipe_created_log_activity()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM log_user_activity(NEW.user_id, 'recipe_create');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only create trigger if recipes table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'recipes') THEN
    DROP TRIGGER IF EXISTS on_recipe_created_log_activity_trigger ON public.recipes;
    CREATE TRIGGER on_recipe_created_log_activity_trigger
      AFTER INSERT ON public.recipes
      FOR EACH ROW
      EXECUTE FUNCTION on_recipe_created_log_activity();
  END IF;
END $$;

COMMENT ON FUNCTION get_dau IS 'Get Daily Active Users count for a given date';
COMMENT ON FUNCTION get_mau IS 'Get Monthly Active Users count (last 30 days)';
COMMENT ON FUNCTION get_wau IS 'Get Weekly Active Users count (last 7 days)';
