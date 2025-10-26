-- Add email column to book_members for display purposes
-- This avoids needing admin API access

ALTER TABLE book_members ADD COLUMN IF NOT EXISTS user_email TEXT;

-- Create a trigger to auto-populate email when a member is added
CREATE OR REPLACE FUNCTION set_member_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the user's email from auth.users
  SELECT email INTO NEW.user_email
  FROM auth.users
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS set_member_email_trigger ON book_members;

-- Create trigger
CREATE TRIGGER set_member_email_trigger
  BEFORE INSERT ON book_members
  FOR EACH ROW
  EXECUTE FUNCTION set_member_email();

-- Backfill existing members with emails
UPDATE book_members bm
SET user_email = au.email
FROM auth.users au
WHERE bm.user_id = au.id
AND bm.user_email IS NULL;
