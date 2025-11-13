# Pricing Tiers & Usage Limits Implementation Plan

## Overview
Restructure pricing to control AI costs and create value tiers for users.

## Current State
- Single pricing tier with minimal limits
- No AI usage restrictions (recipe variations, nutrition facts)
- Risk of high AI costs from power users

## New Pricing Structure

### 🆓 Free Tier - Get Started for Free
**Perfect for getting started**

**Price**: $0/month
- ✨ **No credit card required**
- ✅ **25 recipes** (great for testing)
- 📸 **Multi-image OCR** (both sides of recipe cards)
- 📚 **2 cookbooks**
- 👁️ **View shared cookbooks** (read-only access)
- ✨ **5 AI variations** (lifetime, not per month)
- 🥗 **5 Nutrition Facts** (lifetime, not per month)
- ⚡ **All core features**
  - Recipe timeline
  - Quick cook mode
  - Search and filters
  - Categories and tags

**Purpose**: Trial tier to let users experience the value before subscribing

### 💰 Regular Tier - $4.99/month
**Target**: Casual home cooks who want digital recipes

**Limits**:
- ✅ **50 recipe additions per month**
  - Counter resets on billing cycle
  - Can view/edit unlimited existing recipes
- ✅ **AI Recipe Variations**: 10/month
  - Generate recipe variations (different cuisine, dietary restrictions, etc.)
- ✅ **Nutrition Facts**: 25/month
  - AI-generated nutrition information
- ✅ **OCR Import**: Unlimited (already paid for Anthropic)
- ✅ **Manual Recipe Entry**: Unlimited
- ✅ **Recipe Sharing**: Unlimited
- ✅ **Family Cookbooks**: Unlimited

**Value Proposition**: "Perfect for home cooks who want to digitize and organize their family recipes"

### 💎 Premium Tier - $9.95/month
**Target**: Power users, meal planners, recipe enthusiasts

**Limits**:
- ✅ **100 recipe additions per month** (or unlimited - monitor usage first)
  - Start with 100, increase to unlimited if costs are manageable
- ✅ **AI Recipe Variations**: Unlimited
  - No restrictions on variations
- ✅ **Nutrition Facts**: Unlimited
  - Generate for any recipe anytime
- ✅ **Priority Support**: Email support within 24 hours
- ✅ **Early Access**: New features first
- ✅ **Everything in Regular tier**

**Value Proposition**: "For serious cooks who want unlimited AI-powered recipe features"

## Implementation Steps

### 1. Database Schema Updates

#### Add to `subscriptions` table:
```sql
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS monthly_recipe_limit INTEGER DEFAULT 25;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS monthly_ai_variations_limit INTEGER DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS monthly_nutrition_facts_limit INTEGER DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS cookbook_limit INTEGER DEFAULT 2;

-- For free users, track lifetime AI usage (not monthly)
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS lifetime_ai_variations_used INTEGER DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS lifetime_nutrition_facts_used INTEGER DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS lifetime_ai_variations_limit INTEGER DEFAULT 5;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS lifetime_nutrition_facts_limit INTEGER DEFAULT 5;

-- Update existing subscriptions based on plan_type
UPDATE subscriptions
SET
  monthly_recipe_limit = 50,
  monthly_ai_variations_limit = 10,
  monthly_nutrition_facts_limit = 25,
  cookbook_limit = 999999, -- unlimited for paid tiers
  lifetime_ai_variations_limit = NULL, -- only free users have lifetime limits
  lifetime_nutrition_facts_limit = NULL
WHERE plan_type = 'regular' OR plan_type = 'monthly';

UPDATE subscriptions
SET
  monthly_recipe_limit = 100, -- or 999999 for unlimited
  monthly_ai_variations_limit = 999999,
  monthly_nutrition_facts_limit = 999999,
  cookbook_limit = 999999,
  lifetime_ai_variations_limit = NULL,
  lifetime_nutrition_facts_limit = NULL
WHERE plan_type = 'premium' OR plan_type = 'annual';

-- Free users keep default values:
-- monthly_recipe_limit = 25
-- cookbook_limit = 2
-- lifetime_ai_variations_limit = 5
-- lifetime_nutrition_facts_limit = 5
```

#### Create `user_monthly_usage` table:
```sql
CREATE TABLE user_monthly_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,

  -- Usage counters
  recipes_added INTEGER DEFAULT 0,
  ai_variations_generated INTEGER DEFAULT 0,
  nutrition_facts_generated INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, billing_period_start)
);

CREATE INDEX idx_user_monthly_usage_user_period ON user_monthly_usage(user_id, billing_period_start);
```

### 2. Stripe Product Setup

#### Products to Create:
1. **Regular Plan**
   - Price: $4.99/month
   - Metadata:
     ```json
     {
       "plan_type": "regular",
       "recipe_limit": 50,
       "ai_variations_limit": 10,
       "nutrition_limit": 25
     }
     ```

2. **Premium Plan**
   - Price: $9.95/month
   - Metadata:
     ```json
     {
       "plan_type": "premium",
       "recipe_limit": 100,
       "ai_variations_limit": 999999,
       "nutrition_limit": 999999
     }
     ```

### 3. Code Changes Needed

#### A. Usage Tracking Function (`lib/actions/usage-tracking.ts`)
```typescript
export async function checkAndIncrementUsage(
  userId: string,
  usageType: 'recipe' | 'ai_variation' | 'nutrition_fact'
): Promise<{ allowed: boolean; remaining: number; limit: number; isFreeUser: boolean }> {
  const supabase = await createClient()

  // Get user's subscription and limits
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (!subscription) {
    return { allowed: false, remaining: 0, limit: 0, isFreeUser: true }
  }

  const isFreeUser = !subscription.plan_type || subscription.plan_type === 'free'

  // For AI features on free tier, use lifetime limits
  if (isFreeUser && (usageType === 'ai_variation' || usageType === 'nutrition_fact')) {
    let currentUsage = 0
    let limit = 0
    let field = ''

    if (usageType === 'ai_variation') {
      currentUsage = subscription.lifetime_ai_variations_used || 0
      limit = subscription.lifetime_ai_variations_limit || 5
      field = 'lifetime_ai_variations_used'
    } else {
      currentUsage = subscription.lifetime_nutrition_facts_used || 0
      limit = subscription.lifetime_nutrition_facts_limit || 5
      field = 'lifetime_nutrition_facts_used'
    }

    const allowed = currentUsage < limit
    const remaining = Math.max(0, limit - currentUsage)

    if (allowed) {
      // Increment lifetime usage on subscription record
      await supabase
        .from('subscriptions')
        .update({ [field]: currentUsage + 1 })
        .eq('id', subscription.id)
    }

    return { allowed, remaining, limit, isFreeUser }
  }

  // For paid users (or recipes on free tier), use monthly limits
  const billingStart = new Date(subscription.current_period_start)
  const billingEnd = new Date(subscription.current_period_end)

  // Get or create usage record for this period
  let { data: usage } = await supabase
    .from('user_monthly_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('billing_period_start', billingStart.toISOString().split('T')[0])
    .single()

  if (!usage) {
    const { data: newUsage } = await supabase
      .from('user_monthly_usage')
      .insert({
        user_id: userId,
        billing_period_start: billingStart.toISOString().split('T')[0],
        billing_period_end: billingEnd.toISOString().split('T')[0],
      })
      .select()
      .single()
    usage = newUsage
  }

  // Check limits based on usage type
  let currentUsage = 0
  let limit = 0
  let field = ''

  switch (usageType) {
    case 'recipe':
      currentUsage = usage.recipes_added
      limit = subscription.monthly_recipe_limit
      field = 'recipes_added'
      break
    case 'ai_variation':
      currentUsage = usage.ai_variations_generated
      limit = subscription.monthly_ai_variations_limit
      field = 'ai_variations_generated'
      break
    case 'nutrition_fact':
      currentUsage = usage.nutrition_facts_generated
      limit = subscription.monthly_nutrition_facts_limit
      field = 'nutrition_facts_generated'
      break
  }

  const allowed = currentUsage < limit
  const remaining = Math.max(0, limit - currentUsage)

  if (allowed) {
    // Increment usage
    await supabase
      .from('user_monthly_usage')
      .update({ [field]: currentUsage + 1 })
      .eq('id', usage.id)
  }

  return { allowed, remaining, limit, isFreeUser }
}
```

#### B. Update Recipe Creation (`lib/actions/recipes.ts`)
```typescript
export async function createRecipe(data: RecipeFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Check recipe limit
  const usageCheck = await checkAndIncrementUsage(user.id, 'recipe')

  if (!usageCheck.allowed) {
    const upgradeMessage = usageCheck.isFreeUser
      ? `Recipe limit reached (${usageCheck.limit}). Upgrade to Regular ($4.99/month) for 50 recipes per month!`
      : `Monthly recipe limit reached (${usageCheck.limit}). Upgrade to Premium for more recipes or wait until next billing cycle.`

    throw new Error(upgradeMessage)
  }

  // Continue with recipe creation...
}
```

#### C. Update Cookbook Creation (`lib/actions/recipe-books.ts`)
```typescript
export async function createRecipeBook(data: RecipeBookFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Check cookbook limit
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  const cookbookLimit = subscription?.cookbook_limit || 2

  // Count existing cookbooks
  const { count } = await supabase
    .from('recipe_books')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (count >= cookbookLimit) {
    throw new Error(
      `Cookbook limit reached (${cookbookLimit}). ` +
      `Upgrade to Regular for unlimited cookbooks!`
    )
  }

  // Continue with cookbook creation...
}
```

#### D. Add Usage Display Component (`components/subscription/UsageMeter.tsx`)
```typescript
'use client'

export function UsageMeter({
  current,
  limit,
  type
}: {
  current: number
  limit: number
  type: 'recipes' | 'variations' | 'nutrition'
}) {
  const percentage = (current / limit) * 100
  const isNearLimit = percentage >= 80
  const isAtLimit = current >= limit

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">
          {type === 'recipes' && '📚 Recipes This Month'}
          {type === 'variations' && '✨ AI Variations'}
          {type === 'nutrition' && '🥗 Nutrition Facts'}
        </span>
        <span className={isAtLimit ? 'text-red-600 font-bold' : isNearLimit ? 'text-amber-600' : ''}>
          {current} / {limit === 999999 ? '∞' : limit}
        </span>
      </div>
      {limit !== 999999 && (
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              isAtLimit ? 'bg-red-500' :
              isNearLimit ? 'bg-amber-500' :
              'bg-green-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
      {isAtLimit && (
        <p className="text-xs text-red-600">
          Limit reached. Upgrade to Premium for unlimited {type}!
        </p>
      )}
    </div>
  )
}
```

### 4. Pricing Page Updates

Update `/app/pricing/page.tsx` to show new tiers:

```typescript
const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: '',
    tagline: 'Perfect for getting started',
    description: 'No credit card required',
    features: [
      '25 recipes (great for testing)',
      'Multi-image OCR (both sides of cards)',
      '2 cookbooks',
      'View shared cookbooks (read-only)',
      '5 AI variations (lifetime)',
      '5 Nutrition Facts (lifetime)',
      'All core features included',
    ],
    cta: 'Get Started for Free',
    highlighted: false,
  },
  {
    name: 'Regular',
    price: '$4.99',
    period: '/month',
    description: 'Perfect for home cooks',
    features: [
      '50 new recipes per month',
      'Unlimited OCR imports',
      '10 AI recipe variations/month',
      '25 nutrition facts/month',
      'Family cookbook sharing',
      'Recipe organization',
    ],
    cta: 'Subscribe Now',
    popular: false,
  },
  {
    name: 'Premium',
    price: '$9.95',
    period: '/month',
    description: 'For recipe enthusiasts',
    features: [
      '100 new recipes per month',
      'Unlimited OCR imports',
      'Unlimited AI variations',
      'Unlimited nutrition facts',
      'Priority support',
      'Early access to features',
      'Everything in Regular',
    ],
    cta: 'Go Premium',
    popular: true,
  },
]
```

## Monitoring & Adjustments

### Track These Metrics:
1. **Average AI API costs per user per tier**
2. **% of users hitting limits**
3. **Conversion rate from Regular → Premium**
4. **Churn rate by tier**

### Decision Points:
- If Premium users average < $3/month in AI costs → Make recipes unlimited
- If Regular users consistently hit 50 recipe limit → Consider 75 recipes
- If < 5% use AI variations → Increase Regular tier limit to 20
- If AI costs are sustainable → Remove limits entirely

## Migration Strategy

1. **Existing Users**:
   - Grandfather current paid users at their current rate
   - OR: Upgrade all current users to "Premium" features for 3 months
   - Send email explaining new features and limits

2. **Communication**:
   - Email blast about new Premium tier
   - In-app banner for Regular users showing Premium benefits
   - Usage meters visible on dashboard

3. **Rollout**:
   - Week 1: Update database schema
   - Week 2: Implement usage tracking (soft limits, logging only)
   - Week 3: Enable hard limits with upgrade prompts
   - Week 4: Launch Premium tier marketing

## Success Metrics

- **Target**: Keep AI costs under $2/user/month on Regular tier
- **Target**: 15% of Regular users upgrade to Premium
- **Target**: < 10% churn when limits introduced
- **Target**: Premium users = 2x value (features used vs. Regular)

## Free Tier Strategy Summary

### Key Design Decisions:
1. **Lifetime AI Limits (not monthly)**: Free users get 5 AI variations and 5 nutrition facts EVER, not per month
   - Creates urgency to upgrade for power users
   - Minimizes AI costs from free tier abuse
   - Still allows users to test the AI features

2. **Cookbook Limit**: 2 cookbooks (vs unlimited for paid)
   - Enough to organize recipes meaningfully
   - Encourages upgrade for serious users with many categories

3. **Read-Only Shared Cookbooks**: Free users can VIEW family cookbooks but not create shared ones
   - Introduces collaboration feature value
   - Creates upgrade path when they want to share with family

4. **Full Feature Access**: All core features included (timeline, quick cook, etc.)
   - Users experience full value proposition
   - No feature gates, only capacity gates
   - Better conversion because they know what they're buying

### Why This Works:
- **Try Before You Buy**: Users can fully test all features with real limits
- **Natural Upgrade Path**: When they hit 25 recipes or run out of AI features, they're already invested
- **Cost Protection**: Lifetime AI limits prevent runaway costs from free users
- **Value Clear**: The limitations make paid tiers obviously valuable

## Notes

- Start conservative with limits, can always increase
- Monitor usage patterns for 30 days before making adjustments
- Consider annual plans: Regular $49/year (save $10), Premium $99/year (save $20)
- Add "Usage" section to user dashboard (non-admin) showing their monthly usage meters
- Track "Free users who hit limits" as a key conversion metric
