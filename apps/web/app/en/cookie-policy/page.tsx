import PageLayout from '../../../components/page-layout'
import ConsentReopenButton from '../../../components/consent-reopen-button'

export const metadata = {
  title: 'Cookie Policy — Lens Veritas',
  description: 'Extended policy on cookies and tracking technologies used by Lens Veritas',
}

const LAST_UPDATED = 'May 15, 2026'

export default function CookiePolicyPageEN() {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto px-4 py-12">

        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-h)', color: 'var(--text)' }}>
            Cookie Policy
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
          <a href="/cookie-policy" className="underline shrink-0 hover:opacity-80" style={{ color: 'var(--accent)' }}>
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
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>1. What cookies are</h2>
            <p>
              Cookies are small text files that websites save on the user&apos;s device to store information useful for site operation or browsing experience. Alongside cookies, similar technologies exist such as <strong>localStorage</strong>, <strong>sessionStorage</strong>, and <strong>fingerprinting</strong>, which serve similar purposes. This policy treats them as equivalent from a regulatory perspective.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>2. Types of cookies used</h2>
            <div className="space-y-2">
              <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <p className="font-medium mb-1" style={{ color: 'var(--text)' }}>Strictly necessary technical cookies</p>
                <p>No consent required under Art. 122 of Italian Legislative Decree 196/2003 (implementing the ePrivacy Directive). Essential for site operation (session, language, consent registry).</p>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <p className="font-medium mb-1" style={{ color: 'var(--text)' }}>Analytics / monitoring cookies</p>
                <p>Require explicit user consent. Currently disabled by default (Sentry for error tracking, opt-in via consent).</p>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)' }}>
                <p className="font-medium mb-1 text-green-400">Profiling / marketing cookies</p>
                <p><strong>NOT used by Lens Veritas.</strong> No retargeting, no advertising pixels, no social plugins with trackers.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>3. Full list of first-party technical cookies</h2>
            <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border)' }}>
              <table className="w-full text-xs">
                <thead style={{ background: 'var(--bg-card)' }}>
                  <tr>
                    <th className="text-left px-3 py-2" style={{ color: 'var(--text)' }}>Name</th>
                    <th className="text-left px-3 py-2" style={{ color: 'var(--text)' }}>Type</th>
                    <th className="text-left px-3 py-2" style={{ color: 'var(--text)' }}>Duration</th>
                    <th className="text-left px-3 py-2" style={{ color: 'var(--text)' }}>Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'nlv_lang', tipo: 'HTTP cookie', durata: '365 days', scopo: 'Interface language' },
                    { name: 'nlv_palette', tipo: 'HTTP cookie', durata: '365 days', scopo: 'Visual theme (Noir / Bureau)' },
                    { name: 'nlv_font', tipo: 'HTTP cookie', durata: '365 days', scopo: 'Font family' },
                    { name: 'nlv_ai_consent', tipo: 'HTTP cookie', durata: '365 days', scopo: 'Server-side mirror of "AI features" consent (required to gate Veritas analysis)' },
                    { name: 'sb-<project>-auth-token', tipo: 'HTTP cookie (Supabase)', durata: 'Session', scopo: 'User authentication (registered users only)' },
                    { name: 'nlv_consent_v2', tipo: 'localStorage', durata: '6 months', scopo: 'Stores cookie consent choices' },
                    { name: 'nlv_session_id', tipo: 'localStorage', durata: 'Persistent', scopo: 'Anonymous session identifier (UUID) for the consent registry' },
                    { name: 'nlv_layout', tipo: 'localStorage', durata: 'Persistent', scopo: 'Article layout preference (grid / list)' },
                    { name: 'nlv_accent_<palette>', tipo: 'localStorage', durata: 'Persistent', scopo: 'Custom accent color per palette' },
                  ].map((r) => (
                    <tr key={r.name} style={{ borderTop: '1px solid var(--border)' }}>
                      <td className="px-3 py-2 font-mono text-[11px]" style={{ color: 'var(--accent)' }}>{r.name}</td>
                      <td className="px-3 py-2" style={{ color: 'var(--text-2)' }}>{r.tipo}</td>
                      <td className="px-3 py-2" style={{ color: 'var(--text-2)' }}>{r.durata}</td>
                      <td className="px-3 py-2" style={{ color: 'var(--text-2)' }}>{r.scopo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>4. Third-party cookies and trackers</h2>
            <p className="mb-3">Third-party services that process data for technical or functional purposes. Services marked as consent-based are activated only after explicit acceptance via the cookie banner.</p>
            <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border)' }}>
              <table className="w-full text-xs">
                <thead style={{ background: 'var(--bg-card)' }}>
                  <tr>
                    <th className="text-left px-3 py-2" style={{ color: 'var(--text)' }}>Service</th>
                    <th className="text-left px-3 py-2" style={{ color: 'var(--text)' }}>Category</th>
                    <th className="text-left px-3 py-2" style={{ color: 'var(--text)' }}>Purpose</th>
                    <th className="text-left px-3 py-2" style={{ color: 'var(--text)' }}>Privacy</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Vercel', cat: 'Technical', scopo: 'Hosting, IP/UA logs for security', link: 'https://vercel.com/legal/privacy-policy' },
                    { name: 'Supabase', cat: 'Technical (auth)', scopo: 'User authentication and database', link: 'https://supabase.com/privacy' },
                    { name: 'Upstash Redis', cat: 'Technical (cache)', scopo: 'Article cache (TTL ~3 minutes)', link: 'https://upstash.com/trust/privacy.pdf' },
                    { name: 'Google OAuth', cat: 'Technical (login)', scopo: 'Sign-in with Google account (optional)', link: 'https://policies.google.com/privacy' },
                    { name: 'Meta / Facebook OAuth', cat: 'Technical (login)', scopo: 'Sign-in with Facebook account (optional)', link: 'https://www.facebook.com/privacy/policy' },
                    { name: 'DeepSeek', cat: 'AI Processing', scopo: 'Veritas analysis + translations (primary provider)', link: 'https://platform.deepseek.com/privacy' },
                    { name: 'Anthropic (Claude API)', cat: 'AI Processing', scopo: 'News anti-bias analysis (fallback if DeepSeek unavailable)', link: 'https://www.anthropic.com/legal/privacy' },
                    { name: 'Google (Gemini API)', cat: 'AI Processing', scopo: 'On-demand article voice synthesis', link: 'https://policies.google.com/privacy' },
                    { name: 'Sentry', cat: 'Analytics', scopo: 'Error monitoring (not yet active)', link: 'https://sentry.io/privacy/' },
                    { name: 'NewsAPI / GNews / The Guardian / GDELT', cat: 'Technical (server-side)', scopo: 'Article sources — server-side queries only, no cookies in the browser', link: '#' },
                    { name: 'Replicate', cat: 'Technical (server-side)', scopo: 'AI image generation for social media — server-side only', link: 'https://replicate.com/privacy' },
                  ].map((r) => (
                    <tr key={r.name} style={{ borderTop: '1px solid var(--border)' }}>
                      <td className="px-3 py-2 font-medium" style={{ color: 'var(--text)' }}>{r.name}</td>
                      <td className="px-3 py-2" style={{ color: 'var(--text-2)' }}>{r.cat}</td>
                      <td className="px-3 py-2" style={{ color: 'var(--text-2)' }}>{r.scopo}</td>
                      <td className="px-3 py-2">
                        {r.link === '#' ? (
                          <span style={{ color: 'var(--text-3)' }}>—</span>
                        ) : (
                          <a href={r.link} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--accent)' }}>↗</a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs" style={{ color: 'var(--text-3)' }}>
              Lens Veritas does not use Google Analytics, Google Tag Manager, Meta Pixel, Hotjar, Mixpanel, Plausible, or any other tracking platform. Fonts (Geist) are self-hosted via <code>next/font</code> and do not result in requests to external CDNs.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>5. Legal basis for processing</h2>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong style={{ color: 'var(--text)' }}>Technical cookies</strong> — legitimate interest of the Data Controller in the proper functioning of the service (Art. 6(1)(f) GDPR)</li>
              <li><strong style={{ color: 'var(--text)' }}>Analytics / AI cookies</strong> — explicit user consent (Art. 6(1)(a) GDPR), given via the cookie banner</li>
              <li><strong style={{ color: 'var(--text)' }}>Authentication cookies</strong> — performance of the contract with the registered user (Art. 6(1)(b) GDPR)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>6. Consent duration</h2>
            <p>
              The consent given is valid for <strong>6 months</strong>. Upon expiry you will be asked again. You can change or withdraw consent at any time via the &quot;Manage cookie preferences&quot; button in the site footer or by reopening the banner below:
            </p>
            <div className="mt-3">
              <ConsentReopenButton label="Manage cookie preferences" />
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>7. How to manage cookies</h2>
            <p className="mb-2">You can manage your cookies in two ways:</p>
            <ol className="space-y-1 list-decimal list-inside mb-3">
              <li>Via the <strong>&quot;Manage consent&quot;</strong> button in the site footer (changes only your Lens Veritas choices)</li>
              <li>From <strong>browser settings</strong> (delete saved cookies, block future cookies from all sites):</li>
            </ol>
            <ul className="space-y-1 list-disc list-inside text-xs">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--accent)' }}>Google Chrome ↗</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--accent)' }}>Mozilla Firefox ↗</a></li>
              <li><a href="https://support.apple.com/en-us/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--accent)' }}>Apple Safari ↗</a></li>
              <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--accent)' }}>Microsoft Edge ↗</a></li>
            </ul>
            <div className="rounded-xl p-4 mt-3" style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.3)' }}>
              <p className="text-xs" style={{ color: 'var(--text-2)' }}>
                ⚠ Disabling technical cookies may cause some parts of the site to malfunction (e.g. login session persistence).
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>8. Consent registry</h2>
            <p>
              Each consent given is recorded in a secure database (Supabase) containing: session identifier, accepted/rejected categories, timestamp, IP address (anonymised after 12 months), and policy version. This registry is kept as proof of consent under Art. 7(1) GDPR. You can request access, rectification, or deletion of this information by writing to{' '}
              <a href="mailto:paolo_fantinel@hotmail.com" className="underline" style={{ color: 'var(--accent)' }}>paolo_fantinel@hotmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>9. Changes to this Cookie Policy</h2>
            <p>
              Any significant changes will trigger a new consent request upon next access. The date of last modification is shown at the top of this page.
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
