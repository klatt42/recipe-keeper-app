# Database Backup & Recovery Guide

**Status**: Configuration needed in Supabase Dashboard
**Time**: ~30 minutes for initial setup
**Critical**: Required before production launch

---

## Why Database Backups Are Critical

**Data Loss Scenarios**:
- Accidental deletion of recipes or cookbooks
- Database corruption or hardware failure
- Security breach requiring rollback
- Migration errors during updates
- User requests for data recovery

**Legal Requirements**:
- Privacy Policy promises 90-day backup retention
- GDPR requires data restoration capabilities
- Business continuity requirement

**Without Backups**:
- ❌ Permanent data loss
- ❌ Legal compliance violations
- ❌ User trust damage
- ❌ Business reputation risk

**With Backups**:
- ✅ Point-in-time recovery
- ✅ Legal compliance
- ✅ User trust
- ✅ Peace of mind

---

## Supabase Backup Types

### 1. Daily Automated Backups (Recommended)

**Pro Plan** (required for production):
- **Frequency**: Automatic daily backups
- **Retention**: 7 days (configurable up to 30 days)
- **Recovery**: Point-in-time recovery (PITR)
- **Storage**: Included in plan
- **Cost**: $25/month (Pro Plan)

**Free Tier**:
- ❌ No automated backups
- ⚠️ Must use manual exports
- ⚠️ Not suitable for production

### 2. Point-in-Time Recovery (PITR)

**Available on**: Pro Plan and above
- Restore to any point in the last 7-30 days
- Granularity: Down to the second
- Use case: Recover from accidental deletions, bad migrations

### 3. Manual Exports

**Available on**: All tiers (including Free)
- Export full database as SQL dump
- Download and store externally
- Restore by re-running SQL
- Use case: Pre-migration backups, external storage

---

## Current Setup

**Supabase Project**: `kbksmusflftsakmalgkl`
**URL**: https://kbksmusflftsakmalgkl.supabase.co
**Region**: (Check in dashboard)

**Database Schema**:
- ✅ Migration files tracked in `/migrations`
- ✅ Schema version control with Git
- ✅ RLS policies configured

**Tables** (from migrations):
- `profiles` - User accounts
- `recipes` - Recipe data
- `recipe_images` - Recipe photos
- `recipe_books` - Cookbooks
- `recipe_book_members` - Sharing permissions
- `shared_recipes` - Recipe-cookbook links
- `api_usage` - Usage tracking

---

## Setup Instructions

### Step 1: Verify Supabase Plan

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select project: `kbksmusflftsakmalgkl`
3. Click **Settings** → **Billing**
4. Check current plan:
   - **Free Tier**: ⚠️ No automated backups (upgrade required)
   - **Pro Plan** ($25/month): ✅ Daily backups + PITR
   - **Team/Enterprise**: ✅ Advanced backup options

**Recommendation**: Upgrade to Pro Plan before production launch

### Step 2: Enable Automated Backups (Pro Plan)

1. **Navigate to Backups**:
   - Dashboard → Project → **Database** → **Backups**

2. **Configure Daily Backups**:
   - **Enable**: Toggle "Automated Backups" ON
   - **Retention**: Set to **30 days** (maximum allowed)
   - **Schedule**: Daily at 2:00 AM UTC (low traffic time)

3. **Enable Point-in-Time Recovery (PITR)**:
   - Toggle "PITR" ON
   - **Window**: 7-30 days (choose 30 days)
   - **Cost**: Included in Pro Plan

4. **Save Configuration**

### Step 3: Set Up Manual Backup Schedule (Free Tier)

If you're on Free Tier temporarily, set up weekly manual backups:

#### A. Manual Database Export

1. **Via Supabase CLI** (recommended):
   ```bash
   # Install Supabase CLI (if not installed)
   npm install -g supabase

   # Login
   supabase login

   # Link project
   supabase link --project-ref kbksmusflftsakmalgkl

   # Export database
   supabase db dump --file backups/backup-$(date +%Y%m%d).sql
   ```

2. **Via Dashboard** (alternative):
   - Dashboard → **Database** → **Backups**
   - Click **Create Backup** (manual)
   - Download SQL file
   - Store in secure location

#### B. Automated Backup Script

Create a cron job for weekly backups:

```bash
# Create backup directory
mkdir -p ~/recipe-keeper-backups

# Create backup script
cat > ~/recipe-keeper-backups/backup.sh << 'EOF'
#!/bin/bash

# Configuration
PROJECT_REF="kbksmusflftsakmalgkl"
BACKUP_DIR="$HOME/recipe-keeper-backups"
RETENTION_DAYS=90

# Create backup filename with timestamp
BACKUP_FILE="$BACKUP_DIR/recipe-keeper-$(date +%Y%m%d-%H%M%S).sql"

# Export database
cd ~/projects/recipe-keeper-app
supabase db dump --file "$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"

# Delete old backups (older than 90 days)
find "$BACKUP_DIR" -name "recipe-keeper-*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Log result
echo "$(date): Backup completed - $BACKUP_FILE.gz" >> "$BACKUP_DIR/backup.log"
EOF

# Make executable
chmod +x ~/recipe-keeper-backups/backup.sh

# Test backup
~/recipe-keeper-backups/backup.sh
```

#### C. Schedule Weekly Backups

```bash
# Edit crontab
crontab -e

# Add weekly backup (every Sunday at 2 AM)
0 2 * * 0 ~/recipe-keeper-backups/backup.sh

# Alternative: Daily backups
0 2 * * * ~/recipe-keeper-backups/backup.sh
```

---

## Restore Procedures

### Restore from Automated Backup (Pro Plan)

1. **Access Backup Dashboard**:
   - Supabase Dashboard → **Database** → **Backups**

2. **Choose Restore Method**:

   **Option A: Point-in-Time Recovery**
   - Click **Restore** → **Point-in-Time**
   - Select date and time
   - Preview changes
   - Click **Restore Database**
   - ⚠️ This will replace current database

   **Option B: Restore from Daily Backup**
   - View list of daily backups
   - Select backup date
   - Click **Restore**
   - Confirm restoration

3. **Verify Restoration**:
   ```bash
   # Check recipe count
   curl -X POST 'https://kbksmusflftsakmalgkl.supabase.co/rest/v1/rpc/count_recipes' \
     -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_ANON_KEY"

   # Test app functionality
   npm run dev
   # Verify recipes load correctly
   ```

### Restore from Manual Backup

#### 1. Prepare Restoration

```bash
# Navigate to project
cd ~/projects/recipe-keeper-app

# Create restoration directory
mkdir -p restore-temp

# Extract backup if compressed
gunzip -c ~/recipe-keeper-backups/backup-20250108.sql.gz > restore-temp/restore.sql
```

#### 2. Reset Database (DANGER: Deletes all data!)

⚠️ **ONLY do this if you need a full restore**

```bash
# Option A: Via Supabase Dashboard
# Dashboard → Settings → Database → Reset Database

# Option B: Via CLI
supabase db reset --linked
```

#### 3. Restore from SQL File

```bash
# Restore via psql (requires direct database access)
psql "$DATABASE_URL" < restore-temp/restore.sql

# Or via Supabase CLI
supabase db push --file restore-temp/restore.sql
```

#### 4. Verify Restoration

```bash
# Check tables exist
supabase db remote-queries "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"

# Check recipe count
supabase db remote-queries "SELECT COUNT(*) FROM recipes;"

# Test app
npm run dev
```

---

## Partial Recovery (Single Table)

If you only need to restore specific data (e.g., accidentally deleted recipes):

### 1. Extract Table from Backup

```bash
# Extract only recipes table from backup
pg_restore --table=recipes --data-only ~/recipe-keeper-backups/backup.sql > recipes-only.sql
```

### 2. Restore Specific Rows

```sql
-- Find deleted recipe in backup file
-- Manually extract INSERT statement

-- Insert into current database
INSERT INTO recipes (id, user_id, title, ingredients, instructions, created_at)
VALUES ('uuid-here', 'user-id', 'Recipe Title', '...', '...', '2025-01-08');
```

### 3. Use PITR for Specific Deletion (Pro Plan)

If you know when data was deleted:

1. Dashboard → **Database** → **Backups** → **PITR**
2. Select timestamp **before deletion**
3. **Export deleted data** to CSV
4. **Import into current database**

---

## Testing Backup & Restore

### Monthly Backup Test Checklist

Perform these tests monthly to ensure backups work:

```bash
# 1. Create test recipe via API
curl -X POST 'http://localhost:3004/api/recipes' \
  -H 'Content-Type: application/json' \
  -d '{"title": "Backup Test Recipe", "ingredients": "Test", "instructions": "Test"}'

# 2. Create manual backup
supabase db dump --file backups/test-backup.sql

# 3. Delete test recipe
# (via app UI)

# 4. Restore from backup
# (follow restore procedures above)

# 5. Verify test recipe is restored
# (check app UI)

# 6. Clean up test data
```

### Automated Backup Verification

Create a verification script:

```bash
#!/bin/bash
# ~/recipe-keeper-backups/verify-backup.sh

LATEST_BACKUP=$(ls -t ~/recipe-keeper-backups/recipe-keeper-*.sql.gz | head -1)

if [ -z "$LATEST_BACKUP" ]; then
  echo "ERROR: No backup found!"
  exit 1
fi

# Check backup age (should be < 7 days)
BACKUP_AGE=$(find "$LATEST_BACKUP" -mtime +7)
if [ -n "$BACKUP_AGE" ]; then
  echo "WARNING: Backup is older than 7 days!"
  exit 1
fi

# Check backup size (should be > 1MB for Recipe Keeper)
BACKUP_SIZE=$(stat -f%z "$LATEST_BACKUP" 2>/dev/null || stat -c%s "$LATEST_BACKUP")
if [ "$BACKUP_SIZE" -lt 1048576 ]; then
  echo "WARNING: Backup size is suspiciously small (< 1MB)"
  exit 1
fi

echo "✓ Backup verification passed"
echo "  Latest backup: $LATEST_BACKUP"
echo "  Size: $(du -h $LATEST_BACKUP | cut -f1)"
echo "  Age: $(find "$LATEST_BACKUP" -mtime +0 -mtime -7 && echo '< 7 days' || echo '> 7 days')"
```

Run monthly:
```bash
chmod +x ~/recipe-keeper-backups/verify-backup.sh
~/recipe-keeper-backups/verify-backup.sh
```

---

## Backup Storage

### Local Storage (Current Setup)

**Location**: `~/recipe-keeper-backups/`
**Retention**: 90 days
**Compression**: gzip

**Pros**:
- ✅ Free
- ✅ Fast access
- ✅ Full control

**Cons**:
- ❌ Single point of failure (server failure = backup loss)
- ❌ No off-site protection
- ❌ Manual management required

### Cloud Storage (Recommended for Production)

#### Option 1: AWS S3

```bash
# Install AWS CLI
pip install awscli

# Configure AWS
aws configure

# Upload backups to S3
aws s3 sync ~/recipe-keeper-backups/ s3://recipe-keeper-backups/ \
  --storage-class STANDARD_IA \
  --exclude "*" --include "*.sql.gz"

# Set lifecycle policy (90-day retention)
aws s3api put-bucket-lifecycle-configuration \
  --bucket recipe-keeper-backups \
  --lifecycle-configuration file://s3-lifecycle.json
```

**Cost**: ~$0.50/month for 100GB of backups

#### Option 2: Supabase Storage

```bash
# Upload to Supabase Storage bucket
supabase storage create backups
supabase storage upload backups/backup-$(date +%Y%m%d).sql.gz ~/recipe-keeper-backups/latest.sql.gz
```

#### Option 3: External Hard Drive

```bash
# Mount external drive
sudo mount /dev/sdb1 /mnt/external-backup

# Copy backups
rsync -av ~/recipe-keeper-backups/ /mnt/external-backup/recipe-keeper/

# Unmount
sudo umount /mnt/external-backup
```

---

## Monitoring & Alerts

### Backup Health Monitoring

Create monitoring script:

```bash
#!/bin/bash
# ~/recipe-keeper-backups/monitor.sh

# Check if backup ran today
TODAY=$(date +%Y%m%d)
TODAYS_BACKUP=$(ls ~/recipe-keeper-backups/recipe-keeper-$TODAY*.sql.gz 2>/dev/null)

if [ -z "$TODAYS_BACKUP" ]; then
  # Send alert email
  echo "ALERT: Database backup did not run today!" | mail -s "Recipe Keeper Backup Failure" your-email@example.com
  exit 1
fi

echo "✓ Today's backup exists: $TODAYS_BACKUP"
```

### Supabase Dashboard Monitoring (Pro Plan)

1. **Dashboard** → **Database** → **Backups**
2. Check **Last Backup** timestamp
3. Enable **Email Notifications**:
   - Settings → Notifications
   - Enable "Backup Failed" alerts

### Sentry Integration

Add backup monitoring to Sentry:

```typescript
// lib/utils/backup-monitor.ts
import * as Sentry from '@sentry/nextjs'

export async function verifyBackupHealth() {
  try {
    // Check Supabase backup status via API
    const response = await fetch(
      'https://api.supabase.com/v1/projects/kbksmusflftsakmalgkl/backups',
      {
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    )

    const backups = await response.json()
    const latestBackup = backups[0]

    // Check if backup is recent (< 24 hours)
    const backupAge = Date.now() - new Date(latestBackup.created_at).getTime()
    const hoursSinceBackup = backupAge / (1000 * 60 * 60)

    if (hoursSinceBackup > 24) {
      Sentry.captureMessage('Database backup is stale', {
        level: 'warning',
        extra: {
          lastBackup: latestBackup.created_at,
          hoursSinceBackup,
        },
      })
    }

    return { success: true, latestBackup }
  } catch (error) {
    Sentry.captureException(error, {
      tags: { component: 'backup-monitor' },
    })
    return { success: false, error }
  }
}
```

Run daily via cron:
```typescript
// app/api/cron/backup-check/route.ts
import { verifyBackupHealth } from '@/lib/utils/backup-monitor'
import { NextResponse } from 'next/server'

export async function GET() {
  const result = await verifyBackupHealth()
  return NextResponse.json(result)
}
```

---

## Disaster Recovery Plan

### Full Database Loss Scenario

1. **Assess Damage**:
   - Determine cause (hardware failure, breach, corruption)
   - Identify last known good state

2. **Create New Supabase Project** (if needed):
   ```bash
   # Via Dashboard: Create new project
   # Get new credentials
   ```

3. **Restore Latest Backup**:
   ```bash
   # Option A: From Supabase automated backup (Pro Plan)
   # Use dashboard restore feature

   # Option B: From manual backup
   psql "$NEW_DATABASE_URL" < ~/recipe-keeper-backups/latest-backup.sql
   ```

4. **Verify Data Integrity**:
   ```bash
   # Check row counts
   psql "$DATABASE_URL" -c "SELECT
     (SELECT COUNT(*) FROM recipes) as recipes,
     (SELECT COUNT(*) FROM recipe_books) as books,
     (SELECT COUNT(*) FROM profiles) as users;"

   # Test app functionality
   npm run dev
   ```

5. **Update Environment Variables**:
   ```bash
   # Update .env.local and production environment
   NEXT_PUBLIC_SUPABASE_URL=new-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=new-key
   SUPABASE_SERVICE_ROLE_KEY=new-service-key
   ```

6. **Notify Users**:
   - Send email about incident
   - Explain what data was recovered
   - Apologize for any data loss

---

## Data Retention Policy

**As stated in Privacy Policy**:

### Production Data
- **Active accounts**: Indefinitely (while account exists)
- **Deleted accounts**: 30 days, then permanent deletion
- **Recipe data**: Deleted with account

### Backups
- **Automated backups**: 30 days (Pro Plan)
- **Manual backups**: 90 days (external storage)
- **Compliance backups**: 7 years (for legal/financial records)

### Logs
- **Application logs**: 90 days (Sentry)
- **Rate limit data**: 48 hours (Upstash)
- **API usage data**: 1 year (for billing/analytics)

---

## Migration Backup Best Practices

**Before ANY database migration**:

1. **Create Manual Backup**:
   ```bash
   supabase db dump --file backups/pre-migration-$(date +%Y%m%d-%H%M%S).sql
   ```

2. **Test Migration Locally**:
   ```bash
   # Create local test database
   supabase start

   # Apply migration
   supabase migration up

   # Verify
   supabase db diff
   ```

3. **Apply to Production**:
   ```bash
   # Create backup (again!)
   supabase db dump --file backups/pre-production-migration.sql

   # Apply migration
   supabase db push

   # Verify
   supabase migration list
   ```

4. **Rollback Plan**:
   ```bash
   # If migration fails, restore from backup
   psql "$DATABASE_URL" < backups/pre-migration.sql
   ```

---

## Compliance & Legal

### GDPR Requirements

✅ **Right to Access**: Users can export their data
✅ **Right to Erasure**: Account deletion removes data within 30 days
✅ **Data Portability**: Export feature provides JSON/CSV
✅ **Backup Transparency**: Privacy Policy discloses 90-day retention

### CCPA Requirements

✅ **Data Disclosure**: Privacy Policy lists all data collected
✅ **Data Deletion**: Users can request account deletion
✅ **Backup Retention**: 90 days disclosed in policy

---

## Cost Analysis

### Supabase Pro Plan
- **Monthly**: $25
- **Features**:
  - Daily automated backups
  - 30-day PITR
  - Included storage
  - No data transfer fees
- **ROI**: Prevents data loss worth thousands of dollars

### Manual Backup Costs (Free Tier)
- **Storage**: ~500MB/backup × 12 backups = 6GB
- **Local storage**: Free
- **S3 storage**: ~$0.15/month
- **Time cost**: ~2 hours/month manual management

**Recommendation**: Pro Plan ($25/month) is worth it for peace of mind and automation.

---

## Troubleshooting

### Backup Not Creating

1. **Check Supabase Plan**: Free tier = no auto backups
2. **Check Disk Space**: Ensure sufficient storage
3. **Check Permissions**: CLI needs project access
4. **Check Logs**: Dashboard → Logs → Backup logs

### Restore Failed

1. **Check SQL Syntax**: Ensure backup is valid SQL
2. **Check RLS Policies**: May need to disable during restore
3. **Check Foreign Keys**: Restore in correct order
4. **Manual Restore**: Import table by table if needed

### Backup Too Large

1. **Compress**: Use gzip (reduces size by 90%)
2. **Exclude Logs**: Don't backup temporary tables
3. **Archive Old Data**: Move old recipes to archive table

---

## Next Steps

1. **Upgrade to Pro Plan** (15 min) ✓
   - Dashboard → Billing → Upgrade to Pro
   - Add payment method
   - Confirm upgrade

2. **Enable Automated Backups** (5 min) ✓
   - Dashboard → Database → Backups
   - Enable daily backups
   - Set 30-day retention

3. **Set Up Manual Backup Script** (10 min)
   - Create backup.sh script
   - Test backup creation
   - Schedule cron job

4. **Test Restore** (30 min)
   - Create test backup
   - Restore to local database
   - Verify data integrity

5. **Set Up Monitoring** (15 min)
   - Create verification script
   - Enable Sentry alerts
   - Schedule monthly tests

6. **Document Procedures** (5 min)
   - Add credentials to password manager
   - Share restore procedures with team
   - Update runbook

---

## Resources

- [Supabase Backups Documentation](https://supabase.com/docs/guides/platform/backups)
- [PostgreSQL Backup Guide](https://www.postgresql.org/docs/current/backup.html)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli/usage)
- [Point-in-Time Recovery](https://supabase.com/docs/guides/platform/backups#point-in-time-recovery)

---

**Status**: Ready for configuration in Supabase Dashboard
**Priority**: CRITICAL - Required before production launch
**Estimated setup time**: 30 minutes
**Estimated cost**: $25/month (Pro Plan) or Free (manual backups)

---

## Quick Reference

### Create Manual Backup
```bash
supabase db dump --file backups/backup-$(date +%Y%m%d).sql
gzip backups/backup-$(date +%Y%m%d).sql
```

### Restore from Backup
```bash
gunzip -c backup.sql.gz | psql "$DATABASE_URL"
```

### Verify Backup Health
```bash
ls -lh ~/recipe-keeper-backups/
~/recipe-keeper-backups/verify-backup.sh
```

### Emergency Restore
```bash
# 1. Get latest backup
LATEST=$(ls -t ~/recipe-keeper-backups/*.sql.gz | head -1)

# 2. Restore
gunzip -c "$LATEST" | psql "$DATABASE_URL"

# 3. Verify
npm run dev
```

---

**🛡️ Remember: Backups are insurance. You hope to never need them, but you'll be thankful when you do!**
