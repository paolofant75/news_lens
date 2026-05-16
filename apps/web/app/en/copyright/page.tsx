import PageLayout from '../../../components/page-layout'

export const metadata = {
  title: 'Copyright & Notices — Lens Veritas',
  description: 'Copyright infringement notice procedure for Lens Veritas',
}

const LAST_UPDATED = 'May 15, 2026'

export default function CopyrightPageEN() {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto px-4 py-12">

        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-h)', color: 'var(--text)' }}>
            Copyright & Notices
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
          <a href="/copyright" className="underline shrink-0 hover:opacity-80" style={{ color: 'var(--accent)' }}>
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
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>How Lens Veritas works</h2>
            <p>
              Lens Veritas aggregates headlines, excerpts, and links from third-party news sources (NewsAPI, The Guardian, GNews, GDELT, public RSS feeds). Original content remains the property of the respective publishers. Every article displayed includes a direct link to the original source. AI-generated analyses (Claude by Anthropic) are automatically produced editorial summaries, not verbatim copies of source articles.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>Reporting an infringement</h2>
            <p className="mb-4">
              If you hold rights over content displayed on Lens Veritas and believe there is a copyright infringement under Italian Law 633/1941 (Italian Copyright Act) or EU Directive 2019/790, you may request its removal by sending a notice to:
            </p>

            <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--accent)' }}>
              <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>Notice address</p>
              <a
                href="mailto:paolo_fantinel@hotmail.com?subject=Copyright%20Notice%20-%20Lens%20Veritas"
                className="underline text-base"
                style={{ color: 'var(--accent)' }}
              >
                paolo_fantinel@hotmail.com
              </a>
              <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
                Subject: <em>Copyright Notice — Lens Veritas</em>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>Information to include in the notice</h2>
            <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <ol className="space-y-2 list-decimal list-inside">
                <li>Your full name and contact details (email, phone)</li>
                <li>Description of the copyrighted content you own</li>
                <li>Exact URL of the Lens Veritas page where the contested content appears</li>
                <li>URL or reference of the original work</li>
                <li>Good-faith statement that the use is not authorised by the rights holder</li>
                <li>Statement, under your responsibility, that the information provided is accurate and that you are the rights holder or are authorised to act on the rights holder&apos;s behalf</li>
                <li>Signature (including electronic)</li>
              </ol>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>Procedure and timing</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-black shrink-0 mt-0.5" style={{ background: 'var(--accent)' }}>1</span>
                <p><strong style={{ color: 'var(--text)' }}>Receipt</strong> — We confirm receipt of the notice within 48 business hours.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-black shrink-0 mt-0.5" style={{ background: 'var(--accent)' }}>2</span>
                <p><strong style={{ color: 'var(--text)' }}>Review</strong> — We review the notice within 5 business days.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-black shrink-0 mt-0.5" style={{ background: 'var(--accent)' }}>3</span>
                <p><strong style={{ color: 'var(--text)' }}>Action</strong> — If infringement is confirmed, the content is removed within 24 hours from confirmation.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>Abusive notices</h2>
            <p>
              False notices or notices filed in bad faith may give rise to legal liability under Art. 96 of Italian Law 633/1941. Lens Veritas reserves the right to take legal action in case of manifestly unfounded notices.
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
