# Legal Documents Setup Guide

**Status**: ✅ Templates created, needs customization
**Time**: ~30 minutes to customize

---

## What's Been Created

✅ **Privacy Policy** (`app/privacy/page.tsx`)
✅ **Terms of Service** (`app/terms/page.tsx`)

Both are:
- User-friendly and easy to read
- Compliant with common privacy regulations
- Tailored to Recipe Keeper's features
- Mobile-responsive
- SEO-friendly

---

## Required Customization

Before launching, you MUST customize these placeholders:

### 1. Contact Information

**Find and replace** in both files:

```
privacy@recipekeeper.com → your-privacy-email@yourdomain.com
support@recipekeeper.com → your-support-email@yourdomain.com
legal@recipekeeper.com → your-legal-email@yourdomain.com
copyright@recipekeeper.com → your-copyright-email@yourdomain.com
[Your Company Address] → Your actual business address
```

### 2. Legal Jurisdiction

**In Terms of Service** (app/terms/page.tsx):

Find and replace:
```
[Your State/Country] → Your state, e.g., "California, United States"
[Your Jurisdiction] → e.g., "San Francisco County, California"
```

### 3. Company Information

If you have a registered business entity, add:
- Company legal name
- Registration number
- Tax ID (if applicable)

---

## URLs Created

After deployment, these pages will be accessible at:

- Privacy Policy: `https://yourdomain.com/privacy`
- Terms of Service: `https://yourdomain.com/terms`

---

## Where to Link These Pages

### 1. Footer (Required)

Add to your app footer (e.g., `components/layout/footer.tsx`):

```tsx
<footer className="bg-gray-900 text-white py-8">
  <div className="container mx-auto px-4">
    <div className="flex flex-wrap justify-between">
      <div>
        <h3 className="font-semibold mb-2">Recipe Keeper</h3>
        <p className="text-gray-400 text-sm">
          Preserve your family's culinary heritage
        </p>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Legal</h4>
        <ul className="space-y-1 text-sm">
          <li>
            <a href="/privacy" className="text-gray-400 hover:text-white">
              Privacy Policy
            </a>
          </li>
          <li>
            <a href="/terms" className="text-gray-400 hover:text-white">
              Terms of Service
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div className="mt-8 pt-4 border-t border-gray-800 text-center text-gray-400 text-sm">
      © {new Date().getFullYear()} Recipe Keeper. All rights reserved.
    </div>
  </div>
</footer>
```

### 2. Signup Page (Required)

Add checkbox to signup form:

```tsx
<label className="flex items-start gap-2 text-sm">
  <input
    type="checkbox"
    required
    className="mt-1"
  />
  <span className="text-gray-700">
    I agree to the{' '}
    <a href="/terms" className="text-blue-600 hover:underline" target="_blank">
      Terms of Service
    </a>
    {' '}and{' '}
    <a href="/privacy" className="text-blue-600 hover:underline" target="_blank">
      Privacy Policy
    </a>
  </span>
</label>
```

### 3. Settings Page (Optional)

Add link in account settings:

```tsx
<div className="mt-6 pt-6 border-t">
  <h3 className="font-semibold mb-2">Legal</h3>
  <div className="space-y-2 text-sm">
    <a href="/privacy" className="text-blue-600 hover:underline block">
      Privacy Policy
    </a>
    <a href="/terms" className="text-blue-600 hover:underline block">
      Terms of Service
    </a>
  </div>
</div>
```

---

## Legal Compliance Checklist

### Privacy Regulations

#### GDPR (EU Users)
If you have EU users, ensure:
- [ ] Users can export their data
- [ ] Users can delete their data
- [ ] Cookie consent banner (if using tracking cookies)
- [ ] Data processing agreements with third parties
- [ ] Privacy policy mentions data transfer to US

**Current status**: ✅ Privacy policy covers GDPR basics, ✅ Delete account feature exists

#### CCPA (California Users)
If you have California users:
- [ ] Privacy policy discloses data collection
- [ ] Users can request data deletion
- [ ] "Do Not Sell My Personal Information" link (if applicable)

**Current status**: ✅ Privacy policy compliant, ❌ No data selling

#### COPPA (Children's Privacy)
- [ ] Service not targeted at children under 13
- [ ] Privacy policy states no collection from children

**Current status**: ✅ Privacy policy states not for children under 13

### Terms of Service

- [ ] Acceptable use policy defined
- [ ] User content ownership clarified
- [ ] AI usage terms explained
- [ ] Rate limits documented
- [ ] Refund policy stated
- [ ] Termination conditions clear

**Current status**: ✅ All covered in Terms of Service

---

## Email Template Compliance

When sending emails, include:

### 1. Unsubscribe Link (Required for marketing emails)

```tsx
<p style="text-align: center; margin-top: 20px; font-size: 12px; color: #666;">
  Don't want these emails?{' '}
  <a href="{unsubscribe_url}" style="color: #3B82F6;">Unsubscribe</a>
</p>
```

### 2. Company Information (Required by CAN-SPAM)

```tsx
<p style="text-align: center; font-size: 12px; color: #666;">
  Recipe Keeper<br>
  [Your Company Address]<br>
  <a href="https://yourdomain.com/privacy" style="color: #3B82F6;">Privacy Policy</a> ·
  <a href="https://yourdomain.com/terms" style="color: #3B82F6;">Terms</a>
</p>
```

**Current status**: ⚠️ Email templates need unsubscribe link and address

---

## Cookie Policy (If Needed)

Recipe Keeper currently uses only **essential cookies** (authentication). No cookie banner needed.

If you add analytics (Google Analytics, etc.), you'll need:
1. Cookie consent banner
2. Cookie policy page
3. Cookie preference settings

**Recommended tool**: [cookie-consent](https://www.npmjs.com/package/vanilla-cookieconsent) (free, GDPR-compliant)

---

## Third-Party Data Processing Agreements

Current third-party services and their DPAs:

| Service | Purpose | DPA Required? | Link |
|---------|---------|---------------|------|
| Supabase | Database | ✅ Yes | [supabase.com/dpa](https://supabase.com/dpa) |
| Google Gemini | AI OCR | ✅ Yes | [cloud.google.com/terms/data-processing-addendum](https://cloud.google.com/terms/data-processing-addendum) |
| Anthropic | AI Variations | ✅ Yes | [anthropic.com/legal/commercial-terms](https://www.anthropic.com/legal/commercial-terms) |
| Resend | Email | ✅ Yes | [resend.com/legal/dpa](https://resend.com/legal/dpa) |
| Sentry | Error Tracking | ✅ Yes | [sentry.io/legal/dpa/](https://sentry.io/legal/dpa/) |
| Upstash | Rate Limiting | ✅ Yes | [upstash.com/trust/dpa](https://upstash.com/trust/dpa) |

**Action needed**: Sign DPAs for all services (usually done through their dashboards)

---

## Data Retention Policy

**Current implementation**:
- Account data: Deleted 30 days after account deletion
- Backups: Automatically deleted after 90 days
- Logs (Sentry): 90-day retention
- Rate limit data (Upstash): 24-48 hour TTL

✅ This is documented in Privacy Policy section 8

---

## User Rights Implementation

Verify these features exist:

| Right | Implementation | Status |
|-------|----------------|--------|
| Access data | Download recipes | ✅ Needs export feature |
| Correct data | Edit recipes/profile | ✅ Exists |
| Delete data | Delete account | ✅ Exists |
| Export data | Download JSON/CSV | ⚠️ Needs implementation |
| Opt-out emails | Unsubscribe link | ⚠️ Needs implementation |

**Priority actions**:
1. Add "Export Data" feature to settings
2. Add unsubscribe handling to email system

---

## Legal Review (Recommended)

While these templates are comprehensive, consider:

1. **Lawyer review** ($500-1500 one-time)
   - Especially if you plan to raise funds
   - Or have significant user base
   - Or operate in multiple countries

2. **Legal tech services** ($50-200/month)
   - [Termly](https://termly.io/) - Auto-generate policies
   - [GetTerms](https://getterms.io/) - One-time policies
   - [iubenda](https://www.iubenda.com/) - Privacy compliance platform

3. **Self-review checklist**:
   - [ ] All placeholders replaced
   - [ ] Contact emails work
   - [ ] Links tested
   - [ ] Dates updated
   - [ ] Company info accurate
   - [ ] Third-party services listed
   - [ ] Rate limits match implementation

---

## Update Schedule

Review and update legal documents:
- **Quarterly**: Review for accuracy
- **When adding features**: Update if needed (e.g., new AI features, payment methods)
- **When laws change**: Update for GDPR/CCPA changes
- **Annually**: Full legal review

**Track in calendar**:
- Q1 2025: Review
- Q2 2025: Review
- Q3 2025: Review + Annual legal review
- Q4 2025: Review

---

## Notification of Changes

When updating Terms/Privacy:

1. **Email users** (at least 30 days before major changes)
2. **Show banner** in app: "We've updated our Privacy Policy"
3. **Log the change** (keep history in git)
4. **Update "Last updated" date**

**Implementation**:
```tsx
// app/components/legal-update-banner.tsx
export function LegalUpdateBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="bg-blue-50 border-b border-blue-200 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <p className="text-sm text-blue-900">
          We've updated our{' '}
          <a href="/privacy" className="font-semibold hover:underline">
            Privacy Policy
          </a>
          {' '}and{' '}
          <a href="/terms" className="font-semibold hover:underline">
            Terms of Service
          </a>
          . Please review the changes.
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="text-blue-600 hover:text-blue-800"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
```

---

## Next Steps

1. **Customize templates** (30 min) ✓
   - Replace placeholders
   - Add company info
   - Set jurisdiction

2. **Add footer links** (10 min)
   - Create footer component
   - Link to /privacy and /terms

3. **Update signup form** (5 min)
   - Add Terms/Privacy checkbox

4. **Implement export data** (2 hours)
   - Add export button to settings
   - Generate JSON/CSV of user's recipes

5. **Add unsubscribe handling** (1 hour)
   - Create unsubscribe endpoint
   - Add unsubscribe link to emails

6. **Sign DPAs** (1 hour)
   - Sign DPAs for all third-party services

7. **Test all links** (10 min)
   - Verify /privacy and /terms load
   - Check all links in documents

---

## Resources

- [Termly Policy Generator](https://termly.io/products/privacy-policy-generator/)
- [GDPR Checklist](https://gdpr.eu/checklist/)
- [CCPA Compliance Guide](https://oag.ca.gov/privacy/ccpa)
- [CAN-SPAM Act](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business)

---

**Status**: ✅ Legal templates created and ready for customization
**Priority**: HIGH - Required before public launch
**Estimated time**: 30 min customization + 3-4 hours for full compliance features
