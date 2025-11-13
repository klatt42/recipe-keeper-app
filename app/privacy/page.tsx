import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | My Family Recipe Keeper',
  description: 'Privacy policy for My Family Recipe Keeper - How we collect, use, and protect your data',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8 md:p-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Welcome to My Family Recipe Keeper. We respect your privacy and are committed to protecting your personal data.
              This privacy policy explains how we collect, use, and safeguard your information when you use our service.
            </p>
            <p className="text-gray-700 leading-relaxed">
              My Family Recipe Keeper is a family recipe management app that helps you preserve and share your culinary heritage.
              We only collect data necessary to provide our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">1. Account Information</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>Email address (required for account creation)</li>
              <li>Name (optional)</li>
              <li>Password (encrypted and never stored in plain text)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">2. Recipe Data</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>Recipe titles, ingredients, instructions, and notes</li>
              <li>Recipe images you upload</li>
              <li>Recipe categories and tags</li>
              <li>Cookbook names and descriptions</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">3. Usage Data</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>How you interact with the service (features used, pages viewed)</li>
              <li>AI feature usage (number of imports, variations generated)</li>
              <li>Error logs and crash reports (via Sentry)</li>
              <li>Device type and browser information</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">4. Cookies and Similar Technologies</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use essential cookies to maintain your session and preferences. We do not use tracking cookies
              or sell your data to third parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">We use your information to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Provide our services</strong>: Store and manage your recipes, enable sharing with family members</li>
              <li><strong>AI features</strong>: Process recipe images for import, generate recipe variations</li>
              <li><strong>Improve the service</strong>: Analyze usage patterns to enhance features</li>
              <li><strong>Communication</strong>: Send important updates, security alerts, and cookbook invitations</li>
              <li><strong>Security</strong>: Detect and prevent fraud, abuse, and security issues</li>
              <li><strong>Legal compliance</strong>: Comply with applicable laws and regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Services</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use the following third-party services to provide My Family Recipe Keeper:
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Supabase (Database & Authentication)</h3>
              <p className="text-gray-700 mb-2">Stores your account information and recipe data.</p>
              <p className="text-sm text-gray-600">
                Privacy Policy: <a href="https://supabase.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener">supabase.com/privacy</a>
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Google Gemini AI</h3>
              <p className="text-gray-700 mb-2">Processes recipe images for OCR (optical character recognition).</p>
              <p className="text-sm text-gray-600">
                Privacy Policy: <a href="https://policies.google.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener">policies.google.com/privacy</a>
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Anthropic Claude AI</h3>
              <p className="text-gray-700 mb-2">Generates recipe variations based on your recipes.</p>
              <p className="text-sm text-gray-600">
                Privacy Policy: <a href="https://www.anthropic.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener">anthropic.com/privacy</a>
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Sentry (Error Monitoring)</h3>
              <p className="text-gray-700 mb-2">Collects error logs to improve service reliability. Personal data is filtered before sending.</p>
              <p className="text-sm text-gray-600">
                Privacy Policy: <a href="https://sentry.io/privacy/" className="text-blue-600 hover:underline" target="_blank" rel="noopener">sentry.io/privacy</a>
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Resend (Email Delivery)</h3>
              <p className="text-gray-700 mb-2">Sends transactional emails (invitations, notifications).</p>
              <p className="text-sm text-gray-600">
                Privacy Policy: <a href="https://resend.com/legal/privacy-policy" className="text-blue-600 hover:underline" target="_blank" rel="noopener">resend.com/legal/privacy-policy</a>
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Sharing and Disclosure</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>We do not sell your personal data.</strong> We only share data in these situations:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>With your consent</strong>: When you share recipes or cookbooks with family members</li>
              <li><strong>Service providers</strong>: Third-party services listed above (under data processing agreements)</li>
              <li><strong>Legal requirements</strong>: If required by law, court order, or government request</li>
              <li><strong>Business transfers</strong>: In the event of a merger, acquisition, or sale (users will be notified)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4">We protect your data using:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Encryption in transit (HTTPS/TLS) and at rest</li>
              <li>Secure authentication with industry-standard protocols</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and role-based permissions</li>
              <li>Rate limiting to prevent abuse</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              While we implement strong security measures, no system is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights and Choices</h2>
            <p className="text-gray-700 leading-relaxed mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Access your data</strong>: Request a copy of all data we have about you</li>
              <li><strong>Correct your data</strong>: Update inaccurate or incomplete information</li>
              <li><strong>Delete your data</strong>: Request deletion of your account and all associated data</li>
              <li><strong>Export your data</strong>: Download your recipes in a portable format</li>
              <li><strong>Opt-out of emails</strong>: Unsubscribe from non-essential communications</li>
              <li><strong>Object to processing</strong>: Object to certain uses of your data</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              To exercise these rights, contact us at{' '}
              <a href="mailto:privacy@recipekeeper.com" className="text-blue-600 hover:underline">
                privacy@recipekeeper.com
              </a>
              {' '}or use the account settings in the app.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your data for as long as your account is active or as needed to provide services.
              When you delete your account, we permanently delete your personal data within 30 days, except:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mt-4">
              <li>Data required for legal compliance (e.g., financial records)</li>
              <li>Anonymized usage data for analytics</li>
              <li>Backups (which are automatically deleted after 90 days)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              My Family Recipe Keeper is not intended for children under 13. We do not knowingly collect personal information
              from children. If we learn we have collected data from a child under 13, we will delete it immediately.
              If you believe a child has provided us with personal data, please contact us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">International Users</h2>
            <p className="text-gray-700 leading-relaxed">
              My Family Recipe Keeper is operated in the United States. If you are located outside the U.S., your data will be
              transferred to and processed in the U.S. By using our service, you consent to this transfer.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of significant changes by
              email or through the app. Your continued use of My Family Recipe Keeper after changes constitutes acceptance
              of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions about this privacy policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700"><strong>Email:</strong> privacy@recipekeeper.com</p>
              <p className="text-gray-700 mt-2"><strong>Address:</strong> [Your Company Address]</p>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              By using My Family Recipe Keeper, you agree to this Privacy Policy and our{' '}
              <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
