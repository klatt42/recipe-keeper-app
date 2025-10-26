# API Usage Dashboard - Complete Guide

## Overview

The Usage Dashboard provides comprehensive analytics and cost tracking for all AI API calls in Recipe Keeper. Monitor your spending, track usage patterns, and stay within budget.

## Features

### 1. Summary Statistics
- **Total Cost**: Cumulative spending across selected time period
- **Recipe Imports**: Total number of recipes imported with average cost
- **Images Generated**: AI-generated food photos count
- **Total Operations**: All API calls made

### 2. Time Period Filters
- **Last 7 Days**: Weekly usage overview
- **Last 30 Days**: Monthly spending analysis (default)
- **All Time**: Complete historical data

### 3. Cost by Service
Visual breakdown showing:
- Gemini 2.0 Flash (recipe import OCR + parsing)
- FAL.ai (AI image generation)
- Percentage of total cost per service
- Number of calls per service

### 4. Daily Usage Chart
- Bar chart showing daily costs
- Operation counts per day
- Visual comparison across dates
- Last 14 days displayed

### 5. Recent Activity Table
Detailed log of recent API calls:
- Timestamp
- Service used
- Operation type
- Token counts
- Estimated cost

### 6. Cost Insights
Helpful information:
- Average cost per recipe import (~$0.0003)
- Free tier limits (15/min, 1,500/day)
- Cost projections (100, 1,000, 10,000 imports)
- Your actual average cost

## Accessing the Dashboard

### From the App
1. Go to http://localhost:3003
2. Log in to your account
3. Click **"API Usage"** in the top navigation bar
4. View your analytics

### Direct URL
Navigate directly to: http://localhost:3003/usage

## Understanding the Data

### Token Counts
- **Input Tokens**: Image data + prompt sent to AI
- **Output Tokens**: JSON recipe data returned
- **Total Tokens**: Sum of input + output

### Cost Calculation

**Gemini 2.0 Flash Pricing:**
- Input: $0.075 per 1M tokens
- Output: $0.30 per 1M tokens

**Example Recipe Import:**
```
Input:  1,800 tokens × $0.075/1M = $0.000135
Output:   500 tokens × $0.30/1M  = $0.000150
Total:                             $0.000285
```

**FAL.ai Image Generation:**
- ~$0.003 per image (FLUX Schnell model)

### What Affects Costs?

**Higher costs:**
- Large/complex recipe images
- Long recipes (many ingredients/steps)
- AI image generation (optional)

**Doesn't affect cost:**
- PDF file size
- Number of pages in document
- Image resolution (images are auto-resized)

## Usage Scenarios

### Scenario 1: Personal Use (Free Tier)
- **Limits**: 15 imports/min, 1,500/day
- **Monthly budget**: Import 100 recipes/month
- **Estimated cost**: ~$0.03/month
- **Recommendation**: Perfect for home cooks

### Scenario 2: Heavy User (Paid Tier)
- **Usage**: Import 1,000 recipes/month
- **Estimated cost**: ~$0.30/month
- **Recommendation**: Great for cookbook digitization

### Scenario 3: Professional (Paid Tier)
- **Usage**: Import 10,000 recipes
- **Estimated cost**: ~$3.00 total
- **Recommendation**: Ideal for recipe businesses

## Cost Optimization Tips

1. **Skip AI image generation** if you have your own photos
   - Saves ~$0.003 per recipe
   - Upload your own images instead

2. **Compress images before upload**
   - Reduces token count
   - Faster processing
   - Lower costs

3. **Batch similar recipes**
   - Process all recipes at once
   - Monitor costs in real-time
   - Stay within free tier limits

4. **Use PDF text extraction**
   - PDFs with text are cheaper than images
   - No OCR needed if text is extractable
   - Better accuracy

## Database Schema

All usage is tracked in the `api_usage` table:

```sql
CREATE TABLE api_usage (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  service TEXT,           -- 'gemini-2.0-flash', 'fal-ai'
  operation TEXT,         -- 'recipe-import', 'image-generation'
  input_tokens INTEGER,
  output_tokens INTEGER,
  total_tokens INTEGER,
  estimated_cost DECIMAL(10, 6),  -- Dollars with 6 decimals
  created_at TIMESTAMPTZ
);
```

## Privacy & Security

### Row Level Security (RLS)
- Users can only view their own usage data
- Automatic user_id filtering
- Secure by default

### Data Retention
- All usage history preserved
- No automatic deletion
- Export capabilities (coming soon)

### Cost Accuracy
- Real-time calculation
- Based on official API pricing
- Includes both input and output tokens
- Updated with each API call

## Troubleshooting

### No data showing
**Possible causes:**
- Haven't imported any recipes yet
- Database migration not run
- Not logged in

**Solutions:**
1. Import a test recipe first
2. Run `migrations/add_api_usage_tracking.sql` in Supabase
3. Verify you're logged in

### Costs seem incorrect
**Check:**
- Time period filter (7d/30d/all)
- Look at Recent Activity table for details
- Verify token counts match expectations

**Expected costs:**
- Recipe import: ~$0.0003
- Image generation: ~$0.003

### Dashboard not loading
**Possible causes:**
- Database connection issue
- RLS policy blocking access

**Solutions:**
1. Check Supabase connection
2. Verify RLS policies are set up
3. Check browser console for errors

## API Reference

### Track Usage Programmatically

The `trackAPIUsage()` function is called automatically after each import:

```typescript
import { trackAPIUsage } from '@/lib/actions/usage-tracking'

await trackAPIUsage({
  userId: user.id,
  service: 'gemini-2.0-flash',
  operation: 'recipe-import',
  inputTokens: 1800,
  outputTokens: 500,
  totalTokens: 2300,
  estimatedCost: 0.000285
})
```

### Get Usage Summary

```typescript
import { getUserUsageStats } from '@/lib/actions/usage-tracking'

const stats = await getUserUsageStats()
// Returns: { totalCost, totalTokens, totalImports, ... }
```

## Future Enhancements

Coming soon:
- 📊 Export usage data as CSV
- 📈 Cost projections and budgets
- 🔔 Usage alerts and notifications
- 📅 Monthly reports
- 💳 Payment integration
- 🎯 Custom date ranges

## Support

**Questions about costs?**
- Check the Cost Insights section
- Review Recent Activity for details
- See GEMINI_IMPORT_SETUP.md for pricing

**Technical issues?**
- Verify database migration was run
- Check Supabase RLS policies
- Review browser console for errors

---

**Summary**: The Usage Dashboard gives you complete visibility into API costs, helping you optimize spending while building your recipe collection efficiently!
