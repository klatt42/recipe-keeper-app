# Recipe Import Feature - Setup Guide

## Overview

The Recipe Import feature allows users to digitize existing recipes from photos, PDFs, and recipe cards using:
- **DocTR** - Free, open-source OCR (Optical Character Recognition)
- **Claude AI** - Intelligent recipe parsing and structuring
- **FAL.ai** - AI-generated food images

## Architecture

```
User Upload (Photo/PDF)
  ↓
DocTR OCR Service (Python)
  ↓
Extract Text
  ↓
Claude AI Parser
  ↓
Structured Recipe Data
  ↓
FAL.ai Image Generation (optional)
  ↓
User Review & Save
```

## Setup Instructions

### 1. Set up Python OCR Service (DocTR)

```bash
cd ~/Developer/projects/recipe-keeper-app/python-services

# Run the setup script
./setup.sh

# Or manually:
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Start the OCR Service

In a **new terminal**:

```bash
cd ~/Developer/projects/recipe-keeper-app/python-services
source venv/bin/activate
python ocr_service.py
```

The OCR service will run on `http://localhost:8000`

You should see:
```
Loading DocTR OCR model...
DocTR model loaded successfully!
Starting DocTR OCR Service on http://localhost:8000
```

### 3. Configure API Keys

Edit `.env.local` and add your API keys:

```env
# Anthropic API (for Claude AI parsing)
ANTHROPIC_API_KEY=sk-ant-api03-...  # Get from https://console.anthropic.com

# FAL.ai API (for AI image generation)
FAL_KEY=your-fal-ai-key             # Get from https://fal.ai/dashboard
```

#### Getting API Keys:

**Anthropic API** (Required):
1. Go to https://console.anthropic.com
2. Sign up / Log in
3. Go to API Keys
4. Create new key
5. Cost: ~$0.003 per recipe import

**FAL.ai API** (Optional - for AI-generated images):
1. Go to https://fal.ai
2. Sign up / Log in
3. Dashboard → API Keys
4. Create new key
5. Cost: ~$0.003 per image

### 4. Restart Next.js Dev Server

```bash
# In your main terminal
# Ctrl+C to stop current server
PORT=3003 npm run dev
```

## How to Use

### Import a Recipe

1. **Navigate** to http://localhost:3003
2. **Click** "Import Recipe" button
3. **Upload** a recipe image, PDF, or take a photo
4. **Wait** for OCR + AI processing (~5-10 seconds)
5. **Review** extracted recipe data
6. **Edit** any fields if needed
7. **Save** to your Recipe Keeper

### Supported Formats

- **Images**: JPG, PNG, WEBP, GIF
- **Documents**: PDF
- **Camera**: Take photos directly (mobile/tablet)

### What Can Be Imported

✅ Recipe cards
✅ Cookbook pages
✅ Handwritten recipes
✅ PDF recipes
✅ Screenshot of online recipes
✅ Photos of recipes on phone/tablet

## Testing

### Test the OCR Service

```bash
curl http://localhost:8000/health
```

Should return:
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

### Test with Sample Image

1. Take a photo of any recipe
2. Go to Import page
3. Upload the image
4. Verify OCR extracts text correctly
5. Verify Claude parses it into structured fields

## Troubleshooting

### OCR Service Won't Start

**Error**: `ModuleNotFoundError: No module named 'doctr'`

**Solution**:
```bash
cd python-services
source venv/bin/activate
pip install python-doctr[torch]
```

### Import Button Shows Error

**Error**: "OCR service error: Failed to fetch"

**Solution**: Make sure OCR service is running on port 8000
```bash
cd python-services
source venv/bin/activate
python ocr_service.py
```

### No Text Extracted from Image

**Possible causes**:
- Image quality too low
- Text too small or blurry
- Handwriting too messy

**Solutions**:
- Take a clearer photo
- Use better lighting
- Crop image to focus on recipe text

### Claude API Error

**Error**: "Authentication error" or "API key invalid"

**Solution**: Check your `ANTHROPIC_API_KEY` in `.env.local`

## Architecture Details

### Services Running

1. **Next.js** (port 3003) - Main web application
2. **DocTR OCR** (port 8000) - Python OCR service

### Data Flow

```typescript
// 1. User uploads image
RecipeImportUpload.tsx → File selected

// 2. Convert to base64
RecipeImportWizard.tsx → FileReader API

// 3. Call OCR service
lib/actions/import.ts → performOCR() → http://localhost:8000/extract-text

// 4. Parse with Claude
lib/actions/import.ts → extractRecipeFromImage() → Anthropic API

// 5. Generate AI image (optional)
lib/services/image-generation.ts → generateRecipeImage() → FAL.ai API

// 6. Show review screen
RecipeImportWizard.tsx → step='review'

// 7. Save to database
RecipeForm.tsx → createRecipe()
```

## Cost Breakdown

Per imported recipe:
- **DocTR OCR**: FREE (open-source, runs locally)
- **Claude AI parsing**: ~$0.003
- **FAL.ai image**: ~$0.003 (optional)

**Total: ~$0.006 per recipe (less than a penny!)**

## Development Notes

### Key Files

```
python-services/
├── ocr_service.py         # FastAPI OCR service
├── requirements.txt       # Python dependencies
└── setup.sh              # Setup script

lib/
├── actions/import.ts      # OCR + AI parsing logic
└── services/image-generation.ts  # AI image generation

components/recipes/
├── RecipeImportUpload.tsx    # File upload UI
└── RecipeImportWizard.tsx    # 3-step wizard

app/recipes/import/page.tsx   # Import route
```

### Environment Variables

```env
# Required
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Optional
FAL_KEY=...                    # For AI image generation
```

## Future Enhancements

- [ ] Batch import multiple recipes at once
- [ ] Support for DOCX/TXT files
- [ ] OCR confidence visualization
- [ ] Auto-detect duplicate recipes
- [ ] Recipe import history/audit log
- [ ] Export recipes back to PDF
- [ ] Multi-language OCR support

## Support

For issues or questions:
1. Check this guide
2. Verify all services are running
3. Check browser console for errors
4. Check OCR service logs
5. Report issue with error details
