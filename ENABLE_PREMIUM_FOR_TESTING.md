# Enable Premium for Testing

To enable yourself as a premium user for unlimited testing, run this SQL in Supabase:

## Get Your User ID

1. Open Supabase SQL Editor
2. Run this to find your user ID:

```sql
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;
```

Copy your user ID.

## Enable Premium Status

Replace `YOUR_USER_ID_HERE` with your actual user ID:

```sql
UPDATE profiles
SET is_premium = true
WHERE id = 'YOUR_USER_ID_HERE';
```

## Verify Premium Status

```sql
SELECT id, is_premium FROM profiles WHERE id = 'YOUR_USER_ID_HERE';
```

Should show `is_premium: true`

## Result

After running this:
- ✅ You'll see "Premium Member - Unlimited Variations" badge
- ✅ No usage limits on AI variations
- ✅ Can test as much as you want!

---

**Note**: This is for testing only. In production, premium status would be set by Stripe webhooks after payment.
