# Recipe Import with Gemini 2.0 Flash - Setup Guide

## 🎉 What's New?

We've switched to **Google Gemini 2.0 Flash** for recipe import - it's **40x cheaper** than Claude and does **both OCR and parsing in one API call**!

### Cost Comparison

| Solution | OCR Cost | Parsing Cost | Total per Recipe |
|----------|----------|--------------|------------------|
| **Gemini 2.0 Flash** ✅ | FREE (built-in) | ~$0.0003 | **~$0.0003** |
| DocTR + Claude | FREE | ~$0.012 | ~$0.012 |
| Google Vision + Claude | ~$0.0015 | ~$0.012 | ~$0.0135 |

**Gemini is 40x cheaper and simpler!** 🚀

## Features

✅ **One-step OCR + Parsing** - No separate OCR service needed
✅ **Multi-format support** - Images (JPG, PNG, WEBP), PDFs
✅ **Camera capture** - Take photos directly
✅ **Usage tracking** - Monitor API costs in real-time
✅ **Cost estimation** - See exact cost per import
✅ **AI image generation** - Auto-generate food photos (optional)

## Setup Instructions

### 1. Get Google AI API Key

1. Go to https://aistudio.google.com/apikey
2. Click "Create API Key"
3. Copy the key (starts with `AIza...`)

**Free tier**: 15 requests per minute, 1500 per day
**Paid tier**: Pay-as-you-go, very cheap

### 2. Add API Key to Environment

Edit `.env.local`:

```env
# Required for recipe import
GOOGLE_AI_API_KEY=AIzaSy...your-key-here

# Optional - for AI image generation
FAL_KEY=your-fal-ai-key
```

### 3. Run Database Migration

Go to your **Supabase SQL Editor** and run:

```sql
-- Create API usage tracking table
CREATE TABLE api_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service TEXT NOT NULL,
  operation TEXT NOT NULL,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  estimated_cost DECIMAL(10, 6) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX idx_api_usage_created_at ON api_usage(created_at DESC);

ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
ON api_usage FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage"
ON api_usage FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

### 4. Restart Dev Server

```bash
# Stop current server (Ctrl+C)
PORT=3003 npm run dev
```

## How It Works

### The Magic of Gemini 2.0 Flash

Gemini can see images AND extract structured data in one API call:

```
User uploads recipe photo
       ↓
Gemini 2.0 Flash
  - Reads text from image (OCR)
  - Parses into structured JSON
  - All in one API call!
       ↓
Returns recipe data + usage stats
       ↓
User reviews & saves
```

### Usage Tracking

Every import automatically tracks:
- Input tokens (image + prompt)
- Output tokens (JSON response)
- Total tokens
- Estimated cost (in dollars)

You can see this on the review screen after each import!

## Pricing Details

### Gemini 2.0 Flash Pricing

- **Input**: $0.075 per 1M tokens
- **Output**: $0.30 per 1M tokens

### Per Recipe Cost Breakdown

**Average recipe**:
- Input: ~1,800 tokens (image + prompt)
- Output: ~500 tokens (JSON)
- **Cost: ~$0.0003** (less than 1/30th of a penny!)

**Examples**:
- 10 recipes: ~$0.003 (1/3 penny)
- 100 recipes: ~$0.03 (3 cents)
- 1,000 recipes: ~$0.30 (30 cents)

### What Affects Cost?

✅ Image size/complexity
✅ Recipe length (more ingredients/steps = more tokens)
❌ **NOT** number of pages in PDF
❌ **NOT** file size

## Testing

### Test the Import Feature

1. Go to http://localhost:3003
2. Click **"Import Recipe"**
3. Upload a recipe photo or PDF
4. Wait 3-5 seconds
5. Review extracted data
6. Check usage stats at bottom of screen
7. Save!

### Sample Test Images

Try these:
- Photo of a recipe card
- Screenshot of online recipe
- PDF from a cookbook
- Handwritten recipe (may need good lighting)

## Usage Stats

### Per-Import Stats

After each import, you'll see:
- Tokens used
- Estimated cost
- Extraction confidence

### Database Tracking

All usage is automatically saved to `api_usage` table:
- User ID
- Service (gemini-2.0-flash)
- Operation (recipe-import)
- Token counts
- Cost
- Timestamp

### Usage Dashboard

View your API costs and usage analytics:

1. Go to http://localhost:3003
2. Click **"API Usage"** in the navigation bar
3. View:
   - Total costs across time periods (7 days, 30 days, all time)
   - Cost breakdown by service (Gemini, FAL.ai)
   - Daily usage charts
   - Average cost per import
   - Recent activity log

The dashboard helps you:
- Track spending over time
- Identify usage patterns
- Monitor import costs
- Verify you're staying within budget

## Troubleshooting

### "API key not valid"

**Solution**: Check your `GOOGLE_AI_API_KEY` in `.env.local`
- Should start with `AIza`
- No spaces or quotes
- Restart dev server after changing

### "Failed to extract recipe"

**Possible causes**:
- Image quality too low
- No recipe visible in image
- PDF has no readable text

**Solutions**:
- Use clearer photo with better lighting
- Ensure recipe is visible and in focus
- Try a different image

### No usage stats showing

**Solution**: Run the database migration (step 3 above)

### Cost seems high

**Check**:
- Are you importing very long recipes?
- Are images very large? (compress before upload)
- Gemini should be ~$0.0003 per recipe

If costs are unexpectedly high, check the usage stats component or contact support.

## Comparison: Why Gemini?

### vs Claude

| Feature | Gemini 2.0 Flash | Claude Sonnet 4 |
|---------|------------------|-----------------|
| OCR | ✅ Built-in | ❌ Needs separate service |
| Cost/recipe | ~$0.0003 | ~$0.012 |
| Speed | Fast | Medium |
| Accuracy | Very good | Excellent |
| **Savings** | **40x cheaper** | Baseline |

### vs DocTR + Claude

| Feature | Gemini 2.0 Flash | DocTR + Claude |
|---------|------------------|----------------|
| Setup | Simple | Complex (Python service) |
| OCR | Built-in | Separate service |
| Cost/recipe | ~$0.0003 | ~$0.012 |
| Maintenance | Easy | Requires Python + FastAPI |

**Gemini wins**: Simpler, cheaper, easier!

## API Limits

### Free Tier

- 15 requests per minute
- 1,500 requests per day
- Perfect for personal use!

### If You Hit Limits

- Import ~1,000 recipes/day max (free tier)
- For more, upgrade to paid tier (still very cheap)
- Paid: $0.075/$0.30 per 1M tokens

## Files Changed

```
lib/actions/
├── import-gemini.ts          # NEW - Gemini-based import
├── usage-tracking.ts         # NEW - Track API costs

components/
├── recipes/RecipeImportWizard.tsx  # Updated to use Gemini
├── usage/UsageStats.tsx            # NEW - Show cost stats
└── usage/UsageDashboard.tsx        # NEW - Full analytics dashboard

app/
├── usage/page.tsx            # NEW - Usage dashboard page
└── page.tsx                  # Updated - Added usage link

migrations/
└── add_api_usage_tracking.sql      # NEW - Database table

.env.local                           # Add GOOGLE_AI_API_KEY
```

## Next Steps

1. ✅ Add Google AI API key
2. ✅ Run database migration
3. ✅ Test import feature
4. ✅ View usage dashboard
5. 🔜 Add batch import (coming soon)

## Support

**Gemini 2.0 Flash Documentation**:
https://ai.google.dev/gemini-api/docs

**Get API Key**:
https://aistudio.google.com/apikey

**Pricing**:
https://ai.google.dev/pricing

---

**Summary**: Gemini 2.0 Flash is the perfect solution for recipe import - it's cheap, fast, and does everything in one API call!
