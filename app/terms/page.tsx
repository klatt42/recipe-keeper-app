import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | My Family Recipe Keeper',
  description: 'Terms of Service for My Family Recipe Keeper',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8 md:p-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using My Family Recipe Keeper ("Service"), you accept and agree to be bound by these Terms of Service
              ("Terms"). If you do not agree to these Terms, please do not use the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              My Family Recipe Keeper is a family recipe management platform that allows you to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Store and organize your family recipes</li>
              <li>Import recipes from photos using AI-powered OCR</li>
              <li>Generate recipe variations using AI</li>
              <li>Share cookbooks with family members</li>
              <li>Collaborate on family recipe collections</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              The Service is provided "as is" and may be modified, suspended, or discontinued at any time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Account Registration</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To use certain features, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information to keep it accurate</li>
              <li>Maintain the security of your password</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              You must be at least 13 years old to create an account. Accounts are for individual use only and may not be shared.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights of others</li>
              <li>Upload offensive, harmful, or inappropriate content</li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Use automated tools to access the Service (scraping, bots, etc.)</li>
              <li>Abuse AI features (excessive requests, malicious inputs)</li>
              <li>Impersonate others or provide false information</li>
              <li>Collect personal data from other users without consent</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. User Content</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Your Content</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You retain ownership of all content you upload ("User Content"), including recipes, images, and notes.
              By uploading content, you grant us a limited license to store, process, and display it to provide the Service.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Content Standards</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You are responsible for your User Content. It must not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Infringe on copyrights, trademarks, or other intellectual property</li>
              <li>Contain malicious code or viruses</li>
              <li>Violate privacy rights of others</li>
              <li>Contain offensive, harmful, or illegal content</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.3 Content Removal</h3>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to remove User Content that violates these Terms or is otherwise objectionable,
              without notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. AI Features and Usage Limits</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 AI Processing</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our AI features use third-party services (Google Gemini, Anthropic Claude) to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>Extract text from recipe images (OCR)</li>
              <li>Generate recipe variations and suggestions</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              By using AI features, you acknowledge that:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>AI-generated content may contain errors or inaccuracies</li>
              <li>You are responsible for reviewing and verifying AI outputs</li>
              <li>Your content may be processed by third-party AI services</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.2 Rate Limits</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              To ensure fair usage and prevent abuse, we enforce rate limits:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Recipe imports</strong>: 5 per hour</li>
              <li><strong>AI variations (free tier)</strong>: 5 per month, 10 per day</li>
              <li><strong>API requests</strong>: 100 per minute</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Premium users may have higher limits. Exceeding rate limits may result in temporary restrictions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Subscription and Payment</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">7.1 Free Tier</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              The free tier includes basic features with usage limits. We may modify free tier limits with notice.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">7.2 Premium Subscription</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Premium subscriptions provide:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>Unlimited AI variations</li>
              <li>Higher rate limits</li>
              <li>Priority support</li>
              <li>Additional features as announced</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              Subscriptions renew automatically unless cancelled. You may cancel at any time through account settings.
              Refunds are provided on a case-by-case basis.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">7.3 Price Changes</h3>
            <p className="text-gray-700 leading-relaxed">
              We may change subscription prices with 30 days' notice. Existing subscribers will be grandfathered
              at their current price for 6 months.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Your privacy is important to us. Please review our{' '}
              <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
              {' '}to understand how we collect, use, and protect your data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Intellectual Property</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">9.1 Our Rights</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Service, including its design, features, and content (excluding User Content), is owned by
              My Family Recipe Keeper and protected by copyright, trademark, and other intellectual property laws.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">9.2 Trademark</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              "My Family Recipe Keeper" and our logo are trademarks. You may not use them without written permission.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">9.3 Copyright Complaints</h3>
            <p className="text-gray-700 leading-relaxed">
              If you believe content infringes your copyright, contact us at{' '}
              <a href="mailto:copyright@recipekeeper.com" className="text-blue-600 hover:underline">
                copyright@recipekeeper.com
              </a>
              {' '}with details.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Termination</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">10.1 By You</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You may delete your account at any time through account settings. This will permanently delete
              your data within 30 days.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">10.2 By Us</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may suspend or terminate your account if you:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Violate these Terms</li>
              <li>Abuse the Service or AI features</li>
              <li>Engage in fraudulent activity</li>
              <li>Fail to pay subscription fees</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              We will provide notice when possible, but may terminate immediately for serious violations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Disclaimers</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <p className="text-gray-700 leading-relaxed font-medium">
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
              </p>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not warrant that:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>The Service will be uninterrupted or error-free</li>
              <li>AI features will be accurate or complete</li>
              <li>Defects will be corrected</li>
              <li>The Service is free from viruses or harmful components</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              <strong>Recipes and Safety</strong>: We are not responsible for the accuracy of recipes or their safety.
              Always use your judgment when preparing food, especially regarding allergies, dietary restrictions,
              and food safety.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Limitation of Liability</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <p className="text-gray-700 leading-relaxed font-medium">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, RECIPE KEEPER SHALL NOT BE LIABLE FOR ANY INDIRECT,
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
              </p>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Our total liability for any claim arising from the Service is limited to the amount you paid us in
              the past 12 months, or $100, whichever is greater.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Indemnification</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify and hold harmless My Family Recipe Keeper from any claims, damages, losses, or expenses
              (including legal fees) arising from:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mt-4">
              <li>Your use of the Service</li>
              <li>Your User Content</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another person</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Dispute Resolution</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">14.1 Informal Resolution</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Before filing a claim, please contact us at{' '}
              <a href="mailto:support@recipekeeper.com" className="text-blue-600 hover:underline">
                support@recipekeeper.com
              </a>
              {' '}to resolve the issue informally.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">14.2 Governing Law</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              These Terms are governed by the laws of [Your State/Country], without regard to conflict of law principles.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">14.3 Jurisdiction</h3>
            <p className="text-gray-700 leading-relaxed">
              Any legal action must be brought in the courts located in [Your Jurisdiction]. You consent to
              personal jurisdiction in these courts.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update these Terms from time to time. We will notify you of significant changes by email
              or through the Service. Continued use after changes constitutes acceptance of the updated Terms.
              Material changes take effect 30 days after notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. General Provisions</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">16.1 Entire Agreement</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and My Family Recipe Keeper.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">16.2 Severability</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              If any provision is found unenforceable, the remaining provisions continue in full effect.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">16.3 Waiver</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Failure to enforce any provision does not constitute a waiver of that provision.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">16.4 Assignment</h3>
            <p className="text-gray-700 leading-relaxed">
              You may not assign these Terms without our consent. We may assign these Terms in connection with
              a merger, acquisition, or sale of assets.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">17. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Questions about these Terms? Contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700"><strong>Email:</strong> legal@recipekeeper.com</p>
              <p className="text-gray-700 mt-2"><strong>Support:</strong> support@recipekeeper.com</p>
              <p className="text-gray-700 mt-2"><strong>Address:</strong> [Your Company Address]</p>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              By using My Family Recipe Keeper, you agree to these Terms of Service and our{' '}
              <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
