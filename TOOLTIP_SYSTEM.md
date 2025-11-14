# Tooltip System Documentation

## Overview
The Recipe Keeper App includes a sophisticated, animated tooltip system that provides contextual help to users. The system features a global on/off toggle, allowing seasoned users to hide tooltips while keeping them available for new users.

## Features

### ✨ Core Features
- **Animated Tooltips**: Smooth fade-in animations with directional positioning
- **Global Toggle**: "Tips On/Off" button to enable/disable all tooltips
- **Persistent State**: User preference saved to localStorage
- **Smart Positioning**: Automatically adjusts to stay within viewport
- **Stylish Design**: Gradient dark theme with blue info icons
- **Performance Optimized**: Tooltips only render when enabled

### 🎨 Design
- Gradient dark background (gray-900 to gray-800)
- Blue info icon for visual consistency
- Directional arrows pointing to trigger element
- Smooth animations (fade-in, slide-in)
- Maximum width to prevent overflow
- Border and shadow for depth

## Components

### 1. Tooltip Component
**Location**: `components/ui/Tooltip.tsx`

Main tooltip component with full positioning control:

```typescript
<Tooltip
  content="Your helpful message here"
  position="top" // top, bottom, left, right
  delay={500} // milliseconds
>
  <button>Hover me</button>
</Tooltip>
```

### 2. ButtonTooltip Component
**Location**: `components/ui/Tooltip.tsx`

Simplified version optimized for buttons:

```typescript
<ButtonTooltip content="Click to add a new recipe">
  <button>Add Recipe</button>
</ButtonTooltip>
```

### 3. TooltipProvider Context
**Location**: `lib/contexts/TooltipContext.tsx`

Manages global tooltip state:

```typescript
const { enabled, toggle, enable, disable } = useTooltips()
```

### 4. TooltipToggle Button
**Location**: `components/ui/TooltipToggle.tsx`

User-facing toggle button in navigation:
- Shows green icon with "Tips On" when enabled
- Shows gray icon with "Tips Off" when disabled
- Animated indicator dot
- Toast notifications on toggle

## Usage

### Adding Tooltips to Buttons

```typescript
import { ButtonTooltip } from '@/components/ui/Tooltip'

// Wrap any button or link
<ButtonTooltip content="Brief, helpful description">
  <button onClick={handleClick}>
    Click Me
  </button>
</ButtonTooltip>
```

### Custom Position

```typescript
import { Tooltip } from '@/components/ui/Tooltip'

<Tooltip content="Appears on the right" position="right" delay={300}>
  <div>Hover me</div>
</Tooltip>
```

### Accessing Tooltip State

```typescript
'use client'
import { useTooltips } from '@/lib/contexts/TooltipContext'

function MyComponent() {
  const { enabled, toggle } = useTooltips()

  return (
    <div>
      {enabled ? 'Tooltips are enabled' : 'Tooltips are disabled'}
      <button onClick={toggle}>Toggle</button>
    </div>
  )
}
```

## Currently Tooltipped Elements

### Homepage Navigation
- **👑 Admin Dashboard**: "View business metrics, manage users and promo codes"
- **📊 API Usage**: "Monitor API usage costs and track spending"
- **🚪 Sign out**: "Sign out of your account"

### Recipe Actions
- **📥 Import from Cookbook**: "Copy recipes from another cookbook into this one"
- **📸 Import Recipe**: "Scan a recipe card or photo with AI-powered OCR"
- **✨ Add Recipe**: "Create a new recipe by typing it out manually"

## Best Practices

### Writing Tooltip Content
1. **Be Brief**: Keep messages under 10-12 words
2. **Be Helpful**: Explain what happens, not just what it is
3. **Use Action Verbs**: "Click to...", "Scan a...", "View your..."
4. **Avoid Redundancy**: Don't repeat what the button text says

✅ Good Examples:
- "Scan a recipe card or photo with AI-powered OCR"
- "Copy recipes from another cookbook into this one"
- "View business metrics and manage users"

❌ Bad Examples:
- "This button imports recipes" (redundant)
- "Click here to access the admin dashboard settings page for managing your application" (too long)
- "Import" (not helpful enough)

### When to Add Tooltips
✅ Add tooltips for:
- Actions that aren't immediately obvious
- Buttons with technical terms (OCR, API, etc.)
- Features that new users might not understand
- Admin/power user features

❌ Don't add tooltips for:
- Obvious actions ("Search", "Cancel", "Close")
- Self-explanatory buttons
- Every single element (tooltip fatigue)

## Styling

### Tooltip Appearance
```css
/* Gradient dark background */
background: linear-gradient(to-bottom-right, gray-900, gray-800)

/* Blue info icon */
color: blue-400

/* Smooth animations */
animation: fade-in, slide-in-from-top

/* Smart positioning with arrows */
position: fixed (viewport-aware)
```

### Toggle Button States
- **Enabled**: Green icon, pulse animation, "Tips On"
- **Disabled**: Gray icon, no animation, "Tips Off"
- **Hover**: Lighter background, border highlight

## Technical Implementation

### How It Works
1. **TooltipProvider** wraps the entire app in `app/layout.tsx`
2. User preference stored in `localStorage` as `tooltips-enabled`
3. Each tooltip checks `enabled` state via `useTooltips()` hook
4. Tooltips calculate position dynamically to stay in viewport
5. Delay prevents accidental triggers during mouse movement

### Performance
- Tooltips only mount when `enabled = true`
- DOM positioning calculated on-demand
- No re-renders when disabled
- LocalStorage prevents unnecessary state checks

## Future Enhancements

### Potential Additions
- [ ] Tooltip themes (light/dark/auto)
- [ ] Keyboard shortcuts to show all tooltips
- [ ] First-time user tour mode
- [ ] Animated "pulse" hints for new features
- [ ] Admin dashboard to edit tooltip content
- [ ] A/B testing for tooltip effectiveness
- [ ] Analytics on which tooltips are most viewed

## Migration Guide

### Adding Tooltips to Existing Pages

1. Import the component:
```typescript
import { ButtonTooltip } from '@/components/ui/Tooltip'
```

2. Wrap your buttons:
```typescript
<ButtonTooltip content="Your helpful message">
  <YourExistingButton />
</ButtonTooltip>
```

3. No other changes needed!

### Removing the Tooltip System

If you ever need to disable the system:

1. Remove `<TooltipProvider>` from `app/layout.tsx`
2. Remove `<TooltipToggle />` from navigation
3. Tooltips will automatically not render

## FAQs

**Q: Can users permanently disable tooltips?**
A: Yes! The preference is saved to localStorage and persists across sessions.

**Q: Do tooltips work on mobile?**
A: Tooltips are designed for hover interactions (desktop). On mobile, they won't trigger since there's no hover state. Consider adding tap-to-show functionality for mobile.

**Q: Can I have different tooltip styles for different sections?**
A: Yes! You can create custom tooltip components by extending the base `Tooltip` component and changing the className props.

**Q: What happens if tooltip content is very long?**
A: The tooltip has a `max-width` of `24rem` (384px) and will wrap text. Try to keep content brief!

**Q: Can I add images or rich content to tooltips?**
A: Currently, tooltips only support text. You'd need to modify the `Tooltip` component to accept React nodes instead of strings.

## Credits

Created with Claude Code for Recipe Keeper App
Design inspired by modern SaaS applications with a focus on user experience
