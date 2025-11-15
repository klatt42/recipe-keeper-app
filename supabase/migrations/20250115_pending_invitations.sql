-- Create pending_invitations table for invite-first flow
CREATE TABLE IF NOT EXISTS pending_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  book_id UUID NOT NULL REFERENCES recipe_books(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('viewer', 'editor')),
  invitation_token UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  UNIQUE(email, book_id)
);

-- Index for fast lookup by token
CREATE INDEX IF NOT EXISTS idx_pending_invitations_token ON pending_invitations(invitation_token);

-- Index for fast lookup by email
CREATE INDEX IF NOT EXISTS idx_pending_invitations_email ON pending_invitations(email);

-- RLS Policies
ALTER TABLE pending_invitations ENABLE ROW LEVEL SECURITY;

-- Users can see invitations they sent
CREATE POLICY "Users can view invitations they sent"
  ON pending_invitations
  FOR SELECT
  USING (invited_by = auth.uid());

-- Users can create invitations for books they own/edit
CREATE POLICY "Users can create invitations for their books"
  ON pending_invitations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipe_books
      WHERE id = book_id AND owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM book_members
      WHERE book_id = pending_invitations.book_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'editor')
    )
  );

-- Users can delete invitations they sent
CREATE POLICY "Users can delete invitations they sent"
  ON pending_invitations
  FOR DELETE
  USING (invited_by = auth.uid());

COMMENT ON TABLE pending_invitations IS 'Stores pending cookbook invitations for users who haven''t signed up yet';
