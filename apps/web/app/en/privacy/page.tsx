import PageLayout from '../../../components/page-layout'

export const metadata = {
  title: 'Privacy Policy — Lens Veritas',
  description: 'Privacy policy of Lens Veritas, a global news aggregator with AI anti-bias analysis',
}

const LAST_UPDATED = 'May 15, 2026'

export default function PrivacyPageEN() {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto px-4 py-12">

        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-h)', color: 'var(--text)' }}>
            Privacy Policy
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        {/* Banner versione multilingua + clausola "authoritative version" */}
        <div
          className="mb-8 rounded-lg p-3 text-xs flex items-center justify-between gap-3"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
        >
          <span>This document is also available in Italian.</span>
          <a href="/privacy" className="underline shrink-0 hover:opacity-80" style={{ color: 'var(--accent)' }}>
            Versione italiana →
          </a>
        </div>
        <div
          className="mb-10 rounded-lg p-3 text-[11px] leading-relaxed"
          style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.2)', color: 'var(--text-2)' }}
        >
          <strong style={{ color: 'var(--text)' }}>Authoritative version.</strong> This English translation is provided for convenience. The Italian version of this document remains the legally authoritative text. In case of any discrepancy between the two versions, the Italian version shall prevail.
        </div>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>1. Who we are</h2>
            <p>
              Lens Veritas (<strong>lensveritas.com</strong>) is a global news aggregator with AI anti-bias analysis. The service is operated on a personal, non-commercial basis. For any privacy-related matter you may contact us at: <a href="mailto:paolo_fantinel@hotmail.com" className="underline" style={{ color: 'var(--accent)' }}>paolo_fantinel@hotmail.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>2. Data we collect</h2>
            <div className="space-y-3">
              <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <p className="font-medium mb-1" style={{ color: 'var(--text)' }}>User account (optional)</p>
                <p>If you choose to register: email address, display name, authentication provider used (email, Google, or Facebook). Registration is not required to use the site.</p>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <p className="font-medium mb-1" style={{ color: 'var(--text)' }}>Usage activity (registered users only)</p>
                <p>Articles read and searches performed on Veritas, to show your history in your profile. This data is never sold or shared with third parties.</p>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <p className="font-medium mb-1" style={{ color: 'var(--text)' }}>Display preferences</p>
                <p>Theme (Noir/Bureau), language, and accent color, saved as local cookies in your browser. These are not transmitted to our servers.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>3. Legal basis for processing (GDPR Art. 6)</h2>
            <div className="space-y-2">
              {[
                { base: 'Contract (Art. 6(1)(b))', desc: 'Authentication and management of the user account' },
                { base: 'Consent (Art. 6(1)(a))', desc: 'Reading and search history (toggleable/revocable from your profile), non-technical preference cookies, AI features and error monitoring' },
                { base: 'Legitimate interest (Art. 6(1)(f))', desc: 'Service security, abuse prevention, aggregate and anonymous improvement of the service' },
              ].map((r) => (
                <div key={r.base} className="rounded-xl p-3 flex gap-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <span className="font-medium shrink-0" style={{ color: 'var(--text)' }}>{r.base}:</span>
                  <span>{r.desc}</span>
                </div>
              ))}
            </div>
            <p className="mt-3">We do not use your data for advertising, commercial profiling, or sale to third parties.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>4. Third-party services used</h2>
            <div className="space-y-2">
              {[
                { name: 'Supabase', use: 'User database and authentication', link: 'https://supabase.com/privacy' },
                { name: 'Vercel', use: 'Site hosting and infrastructure', link: 'https://vercel.com/legal/privacy-policy' },
                { name: 'Google OAuth', use: 'Login with Google account (optional)', link: 'https://policies.google.com/privacy' },
                { name: 'Meta / Facebook', use: 'Login with Facebook account (optional)', link: 'https://www.facebook.com/privacy/policy' },
                { name: 'DeepSeek', use: 'Primary AI provider for Veritas analysis and translations', link: 'https://platform.deepseek.com/privacy' },
                { name: 'Anthropic Claude', use: 'Fallback AI provider (anti-bias analysis, translations)', link: 'https://www.anthropic.com/privacy' },
                { name: 'Google Gemini', use: 'Voice synthesis for articles (Audio Reader)', link: 'https://policies.google.com/privacy' },
                { name: 'Upstash Redis', use: 'Temporary article cache (max 3 minutes)', link: 'https://upstash.com/trust/privacy.pdf' },
                { name: 'NewsAPI / GNews / The Guardian API', use: 'Source of news articles', link: '#' },
                { name: 'GDELT Project', use: 'Source of articles and geolocated data (public domain)', link: 'https://www.gdeltproject.org/about.html' },
                { name: 'Replicate', use: 'AI image generation for social media content (Instagram)', link: 'https://replicate.com/privacy' },
              ].map((s) => (
                <div key={s.name} className="flex items-start justify-between gap-4 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <span className="font-medium" style={{ color: 'var(--text)' }}>{s.name}</span>
                    <span className="ml-2">{s.use}</span>
                  </div>
                  {s.link !== '#' && (
                    <a href={s.link} target="_blank" rel="noopener noreferrer"
                      className="text-xs shrink-0 hover:underline" style={{ color: 'var(--accent)' }}>
                      Privacy ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs" style={{ color: 'var(--text-3)' }}>
              Fonts (Geist, Geist Mono) are self-hosted on our server via <code>next/font</code> and do not result in requests to external CDNs during navigation.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>5. Cookies and local storage</h2>
            <p className="mb-2 font-medium" style={{ color: 'var(--text)' }}>Technical cookies (always active):</p>
            <ul className="space-y-1 list-disc list-inside mb-3">
              <li><code className="text-xs px-1 py-0.5 rounded" style={{ background: 'var(--bg-card)' }}>nlv_lang</code> — selected language (365 days)</li>
              <li><code className="text-xs px-1 py-0.5 rounded" style={{ background: 'var(--bg-card)' }}>nlv_palette</code> — visual theme (365 days)</li>
              <li><code className="text-xs px-1 py-0.5 rounded" style={{ background: 'var(--bg-card)' }}>nlv_font</code> — font preference (365 days)</li>
              <li><code className="text-xs px-1 py-0.5 rounded" style={{ background: 'var(--bg-card)' }}>sb-*</code> — Supabase authentication session (registered users only)</li>
            </ul>
            <p className="mb-2 font-medium" style={{ color: 'var(--text)' }}>localStorage (only in your browser, never transmitted to servers):</p>
            <ul className="space-y-1 list-disc list-inside mb-3">
              <li><code className="text-xs px-1 py-0.5 rounded" style={{ background: 'var(--bg-card)' }}>nlv_consent_v2</code> — record of your cookie consent choices</li>
              <li><code className="text-xs px-1 py-0.5 rounded" style={{ background: 'var(--bg-card)' }}>nlv_session_id</code> — anonymous session identifier for the consent registry</li>
              <li>Visual preferences (accent color, grid/list layout)</li>
            </ul>
            <p>We do not use tracking, analytics, or third-party advertising cookies without your explicit consent.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>6. International data transfers</h2>
            <p>
              Some sub-processors are based in the USA (Anthropic, Google, Upstash, NewsAPI, Replicate, GDELT). Transfers take place on the basis of the Standard Contractual Clauses (SCCs) adopted by the European Commission under Art. 46(2)(c) GDPR, or adequacy decisions where applicable.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>7. Data retention</h2>
            <div className="space-y-2">
              {[
                { tipo: 'Account data (email, name)', periodo: 'Until account deletion' },
                { tipo: 'Reading and search history', periodo: 'Until account deletion or upon request' },
                { tipo: 'Consent registry (anonymised IP)', periodo: '12 months (IP removed after 12 months, record retained for legal obligation)' },
                { tipo: 'Article cache (Redis)', periodo: 'Maximum 3 minutes' },
              ].map((r) => (
                <div key={r.tipo} className="flex justify-between gap-4 py-2 text-xs" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text)' }}>{r.tipo}</span>
                  <span className="text-right">{r.periodo}</span>
                </div>
              ))}
            </div>
            <p className="mt-3">
              You can request early deletion at any time from the <a href="/privacy/elimina-dati" className="underline" style={{ color: 'var(--accent)' }}>Delete your data</a> page or by writing to <a href="mailto:paolo_fantinel@hotmail.com" className="underline" style={{ color: 'var(--accent)' }}>paolo_fantinel@hotmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>8. Your rights (GDPR)</h2>
            <p className="mb-2">If you are an EU resident, you have the right to:</p>
            <ul className="space-y-1 list-disc list-inside mb-3">
              <li>Access your personal data (Art. 15)</li>
              <li>Request rectification (Art. 16) or erasure (Art. 17)</li>
              <li>Restrict or object to processing (Arts. 18-21)</li>
              <li>Request data portability (Art. 20)</li>
              <li>Withdraw consent at any time, without affecting the lawfulness of prior processing (Art. 7(3))</li>
            </ul>
            <p className="mb-2">
              To exercise these rights write to <a href="mailto:paolo_fantinel@hotmail.com" className="underline" style={{ color: 'var(--accent)' }}>paolo_fantinel@hotmail.com</a>.
            </p>
            <p className="mt-2 text-xs" style={{ color: 'var(--text-3)' }}>
              You also have the right to lodge a complaint with the <strong>Italian Data Protection Authority (Garante per la Protezione dei Dati Personali)</strong> at www.garanteprivacy.it — Piazza Venezia 11, 00187 Rome, Italy.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>9. Changes to this policy</h2>
            <p>
              Any updates will be posted on this page along with the revision date. Continued use of the service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-6 flex items-center justify-between text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-3)' }}>
          <span>Lens Veritas · {LAST_UPDATED}</span>
          <a href="/" className="hover:opacity-80" style={{ color: 'var(--accent)' }}>← Back to home</a>
        </div>

      </div>
    </PageLayout>
  )
}
