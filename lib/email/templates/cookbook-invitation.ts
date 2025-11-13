/**
 * Email template for cookbook invitation
 */

interface CookbookInvitationProps {
  inviterName: string
  cookbookName: string
  role: 'owner' | 'editor' | 'viewer'
  acceptUrl: string
  recipesCount?: number
}

export function CookbookInvitationEmail(props: CookbookInvitationProps) {
  const roleDescriptions = {
    owner: 'full control of this cookbook (can add recipes, manage members, and delete the cookbook)',
    editor: 'add and edit recipes in this cookbook',
    viewer: 'view recipes in this cookbook'
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>You've been invited to a cookbook!</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9fafb;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
            padding: 40px 30px;
            text-align: center;
          }
          .header-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }
          .header h1 {
            color: #ffffff;
            font-size: 24px;
            margin: 0;
            font-weight: 600;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            margin-bottom: 24px;
            color: #111827;
          }
          .cookbook-name {
            font-weight: 600;
            color: #f59e0b;
          }
          .message {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 24px;
            line-height: 1.8;
          }
          .info-box {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px 20px;
            margin: 24px 0;
            border-radius: 4px;
          }
          .info-box strong {
            color: #92400e;
          }
          .cta {
            text-align: center;
            margin: 32px 0;
          }
          .button {
            display: inline-block;
            background-color: #f59e0b;
            color: #ffffff !important;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            transition: background-color 0.2s;
          }
          .button:hover {
            background-color: #d97706;
          }
          .footer {
            text-align: center;
            padding: 30px;
            background-color: #f9fafb;
            border-top: 1px solid #e5e7eb;
          }
          .footer p {
            margin: 8px 0;
            font-size: 14px;
            color: #6b7280;
          }
          .footer a {
            color: #f59e0b;
            text-decoration: none;
          }
          .stats {
            display: flex;
            justify-content: space-around;
            margin: 24px 0;
          }
          .stat {
            text-align: center;
          }
          .stat-number {
            font-size: 32px;
            font-weight: 700;
            color: #f59e0b;
          }
          .stat-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-icon">📚</div>
            <h1>Cookbook Invitation</h1>
          </div>

          <div class="content">
            <p class="greeting">
              <strong>${props.inviterName}</strong> has invited you to collaborate on their family cookbook!
            </p>

            <p class="message">
              You've been given access to <span class="cookbook-name">"${props.cookbookName}"</span>.
              ${props.recipesCount ? `This cookbook already has <strong>${props.recipesCount} recipe${props.recipesCount !== 1 ? 's' : ''}</strong> waiting for you to explore.` : ''}
            </p>

            <div class="info-box">
              <strong>Your Role:</strong> ${props.role.charAt(0).toUpperCase() + props.role.slice(1)}<br>
              <strong>Permissions:</strong> You can ${roleDescriptions[props.role]}
            </div>

            ${props.recipesCount ? `
            <div class="stats">
              <div class="stat">
                <div class="stat-number">${props.recipesCount}</div>
                <div class="stat-label">Recipes</div>
              </div>
              <div class="stat">
                <div class="stat-number">∞</div>
                <div class="stat-label">Possibilities</div>
              </div>
            </div>
            ` : ''}

            <div class="cta">
              <a href="${props.acceptUrl}" class="button">
                View Cookbook →
              </a>
            </div>

            <p class="message" style="font-size: 14px; color: #6b7280; text-align: center;">
              Or copy and paste this link into your browser:<br>
              <a href="${props.acceptUrl}" style="color: #f59e0b; word-break: break-all;">${props.acceptUrl}</a>
            </p>
          </div>

          <div class="footer">
            <p><strong>My Family Recipe Keeper</strong></p>
            <p>Preserve your family's culinary heritage</p>
            <p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}">Visit My Family Recipe Keeper</a> ·
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/help">Help</a>
            </p>
            <p style="font-size: 12px; margin-top: 16px;">
              This email was sent because ${props.inviterName} invited you to a cookbook on My Family Recipe Keeper.
              If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
        </div>
      </body>
    </html>
  `
}

/**
 * Plain text version for email clients that don't support HTML
 */
export function CookbookInvitationText(props: CookbookInvitationProps) {
  return `
You've been invited to a cookbook!

${props.inviterName} has invited you to collaborate on their family cookbook "${props.cookbookName}".

Your Role: ${props.role.charAt(0).toUpperCase() + props.role.slice(1)}

${props.recipesCount ? `This cookbook already has ${props.recipesCount} recipe${props.recipesCount !== 1 ? 's' : ''} waiting for you to explore.` : ''}

Click here to view the cookbook:
${props.acceptUrl}

---
My Family Recipe Keeper - Preserve your family's culinary heritage
${process.env.NEXT_PUBLIC_APP_URL}

This email was sent because ${props.inviterName} invited you to a cookbook.
If you didn't expect this invitation, you can safely ignore this email.
  `.trim()
}
