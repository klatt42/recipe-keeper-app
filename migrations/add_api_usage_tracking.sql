-- Create API usage tracking table
CREATE TABLE api_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service TEXT NOT NULL, -- 'gemini-2.0-flash', 'fal-ai', 'anthropic'
  operation TEXT NOT NULL, -- 'recipe-import', 'image-generation', etc.
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  estimated_cost DECIMAL(10, 6) DEFAULT 0, -- Store cost in dollars with 6 decimal places
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX idx_api_usage_service ON api_usage(service);
CREATE INDEX idx_api_usage_created_at ON api_usage(created_at DESC);
CREATE INDEX idx_api_usage_user_created ON api_usage(user_id, created_at DESC);

-- RLS Policies
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Users can only view their own usage
CREATE POLICY "Users can view own usage"
ON api_usage FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- System can insert usage records
CREATE POLICY "System can insert usage"
ON api_usage FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create a function to get usage summary
CREATE OR REPLACE FUNCTION get_user_usage_summary(p_user_id UUID)
RETURNS TABLE (
  total_cost DECIMAL,
  total_tokens BIGINT,
  total_imports INTEGER,
  last_7_days_cost DECIMAL,
  last_30_days_cost DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(estimated_cost), 0) as total_cost,
    COALESCE(SUM(total_tokens), 0) as total_tokens,
    COUNT(*)::INTEGER as total_imports,
    COALESCE(SUM(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN estimated_cost ELSE 0 END), 0) as last_7_days_cost,
    COALESCE(SUM(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN estimated_cost ELSE 0 END), 0) as last_30_days_cost
  FROM api_usage
  WHERE user_id = p_user_id;
END;
$$;
