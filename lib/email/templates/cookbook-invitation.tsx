import * as React from 'react'

interface CookbookInvitationEmailProps {
  inviterName: string
  cookbookName: string
  role: 'editor' | 'viewer'
  acceptUrl: string
}

export const CookbookInvitationEmail = ({
  inviterName,
  cookbookName,
  role,
  acceptUrl,
}: CookbookInvitationEmailProps) => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.logo}>🍳 My Family Recipe Keeper</h1>
        </div>

        {/* Content */}
        <div style={styles.content}>
          <h2 style={styles.title}>You&apos;ve been invited!</h2>

          <p style={styles.text}>
            <strong>{inviterName}</strong> has invited you to collaborate on their cookbook:
          </p>

          <div style={styles.cookbookCard}>
            <p style={styles.cookbookName}>❤️ {cookbookName}</p>
            <p style={styles.roleText}>
              Role: <span style={styles.roleBadge}>{role === 'editor' ? 'Editor' : 'Viewer'}</span>
            </p>
          </div>

          {role === 'editor' ? (
            <p style={styles.text}>
              As an <strong>Editor</strong>, you can:
            </p>
          ) : (
            <p style={styles.text}>
              As a <strong>Viewer</strong>, you can:
            </p>
          )}

          <ul style={styles.list}>
            <li style={styles.listItem}>📖 View all recipes in the cookbook</li>
            <li style={styles.listItem}>🖨️ Print recipes</li>
            <li style={styles.listItem}>📋 Copy recipes to your personal cookbook</li>
            {role === 'editor' && (
              <>
                <li style={styles.listItem}>➕ Add new recipes</li>
                <li style={styles.listItem}>✏️ Edit existing recipes</li>
              </>
            )}
          </ul>

          {/* CTA Button */}
          <div style={styles.buttonContainer}>
            <a href={acceptUrl} style={styles.button}>
              Accept Invitation
            </a>
          </div>

          <p style={styles.footerText}>
            Or copy and paste this URL into your browser:
          </p>
          <p style={styles.urlText}>{acceptUrl}</p>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerSmall}>
            This invitation was sent by {inviterName} via My Family Recipe Keeper.
          </p>
          <p style={styles.footerSmall}>
            If you don&apos;t want to accept this invitation, you can safely ignore this email.
          </p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    backgroundColor: '#f3f4f6',
    padding: '40px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  card: {
    backgroundColor: '#ffffff',
    maxWidth: '600px',
    margin: '0 auto',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  header: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    padding: '32px 24px',
    textAlign: 'center' as const,
  },
  logo: {
    color: '#ffffff',
    fontSize: '28px',
    fontWeight: 'bold' as const,
    margin: 0,
  },
  content: {
    padding: '32px 24px',
  },
  title: {
    color: '#111827',
    fontSize: '24px',
    fontWeight: 'bold' as const,
    marginTop: 0,
    marginBottom: '16px',
  },
  text: {
    color: '#374151',
    fontSize: '16px',
    lineHeight: '24px',
    marginTop: 0,
    marginBottom: '16px',
  },
  cookbookCard: {
    backgroundColor: '#fef3c7',
    border: '2px solid #fbbf24',
    borderRadius: '8px',
    padding: '16px',
    margin: '24px 0',
  },
  cookbookName: {
    color: '#92400e',
    fontSize: '20px',
    fontWeight: 'bold' as const,
    margin: '0 0 8px 0',
  },
  roleText: {
    color: '#78350f',
    fontSize: '14px',
    margin: 0,
  },
  roleBadge: {
    backgroundColor: '#fbbf24',
    color: '#78350f',
    padding: '4px 12px',
    borderRadius: '12px',
    fontWeight: 'bold' as const,
  },
  list: {
    color: '#374151',
    fontSize: '16px',
    lineHeight: '24px',
    paddingLeft: '20px',
    marginTop: '12px',
    marginBottom: '24px',
  },
  listItem: {
    marginBottom: '8px',
  },
  buttonContainer: {
    textAlign: 'center' as const,
    margin: '32px 0',
  },
  button: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold' as const,
    padding: '14px 32px',
    borderRadius: '8px',
    textDecoration: 'none',
    display: 'inline-block',
  },
  footerText: {
    color: '#6b7280',
    fontSize: '14px',
    textAlign: 'center' as const,
    marginTop: '24px',
    marginBottom: '8px',
  },
  urlText: {
    color: '#3b82f6',
    fontSize: '12px',
    textAlign: 'center' as const,
    wordBreak: 'break-all' as const,
    margin: '0 0 24px 0',
  },
  footer: {
    backgroundColor: '#f9fafb',
    padding: '24px',
    borderTop: '1px solid #e5e7eb',
  },
  footerSmall: {
    color: '#6b7280',
    fontSize: '12px',
    textAlign: 'center' as const,
    margin: '4px 0',
  },
}

export default CookbookInvitationEmail
