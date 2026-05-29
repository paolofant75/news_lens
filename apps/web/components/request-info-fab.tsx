'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconMessageCircle, IconSend, IconClose } from './icons'

type Status = 'idle' | 'sending' | 'success' | 'error'

const MAX_CHARS = 500

export default function RequestInfoFab() {
  const [open, setOpen]     = useState(false)
  const [query, setQuery]   = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const textareaRef         = useRef<HTMLTextAreaElement>(null)

  /* Close on Escape */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  /* Auto-focus textarea when panel opens */
  useEffect(() => {
    if (open) setTimeout(() => textareaRef.current?.focus(), 200)
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim() || status === 'sending') return
    setStatus('sending')
    try {
      /* Placeholder: replace with actual API call */
      await new Promise(r => setTimeout(r, 1200))
      setStatus('success')
      setQuery('')
      setTimeout(() => { setStatus('idle'); setOpen(false) }, 2000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const charsLeft = MAX_CHARS - query.length

  return (
    <>
      {/* Backdrop (mobile only) */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-[59] sm:hidden"
            style={{ background: 'rgba(0,0,0,0.45)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Overlay panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label="Request more details about this news"
            className="fixed bottom-24 right-4 sm:right-6 z-[61] w-[calc(100vw-2rem)] sm:w-[340px]"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2)',
              }}
            >
              {/* Header */}
              <div
                className="flex items-start justify-between px-5 pt-5 pb-3"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <div>
                  <h2
                    className="text-sm font-semibold leading-snug"
                    style={{ color: 'var(--text)', fontFamily: 'var(--font-h)' }}
                  >
                    What would you like to know?
                  </h2>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-3)' }}>
                    We&apos;ll look into it and get back to you.
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="ml-3 mt-0.5 shrink-0 opacity-50 hover:opacity-100 transition-opacity rounded-md focus:outline-none"
                  style={{ color: 'var(--text)' }}
                  aria-label="Close panel"
                >
                  <IconClose size={16} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-5 pt-4 pb-5 space-y-3">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={query}
                    onChange={e => setQuery(e.target.value.slice(0, MAX_CHARS))}
                    placeholder="Su cosa vuoi scoprire la verità?"
                    rows={4}
                    className="w-full resize-none rounded-xl px-3.5 py-3 text-sm focus:outline-none transition-colors"
                    style={{
                      background: 'var(--bg-s)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      lineHeight: '1.55',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                    disabled={status === 'sending' || status === 'success'}
                    aria-label="Your inquiry"
                  />
                  <span
                    className="absolute bottom-2.5 right-3 text-[10px] tabular-nums pointer-events-none"
                    style={{ color: charsLeft < 50 ? 'var(--accent)' : 'var(--text-3)' }}
                  >
                    {charsLeft}
                  </span>
                </div>

                {/* Status messages */}
                <AnimatePresence mode="wait">
                  {status === 'success' && (
                    <motion.p
                      key="ok"
                      className="text-xs font-medium"
                      style={{ color: '#4ade80' }}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      ✓ Request sent!
                    </motion.p>
                  )}
                  {status === 'error' && (
                    <motion.p
                      key="err"
                      className="text-xs font-medium"
                      style={{ color: '#f87171' }}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      Something went wrong. Please try again.
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!query.trim() || status === 'sending' || status === 'success'}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-85 disabled:opacity-40 focus:outline-none"
                  style={{ background: 'var(--accent)', color: '#fff' }}
                >
                  {status === 'sending' ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        className="inline-block w-3.5 h-3.5 border-2 rounded-full"
                        style={{ borderColor: 'rgba(255,255,255,0.35)', borderTopColor: '#fff' }}
                      />
                      Sending…
                    </>
                  ) : (
                    <>
                      <IconSend size={14} />
                      {status === 'success' ? 'Request sent!' : 'Send Request'}
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB trigger */}
      <motion.button
        onClick={() => { setOpen(o => !o); if (status !== 'idle') setStatus('idle') }}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[62] w-14 h-14 rounded-full flex items-center justify-center focus:outline-none"
        style={{
          background: 'var(--accent)',
          color: '#fff',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)',
        }}
        aria-label={open ? 'Close request panel' : 'Request more details about this news'}
        aria-expanded={open}
        aria-haspopup="dialog"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      >
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="flex items-center justify-center"
        >
          {open ? <IconClose size={22} /> : <IconMessageCircle size={22} />}
        </motion.span>

        {/* Pulse ring when closed */}
        {!open && (
          <motion.span
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ background: 'var(--accent)' }}
            initial={{ scale: 1, opacity: 0.45 }}
            animate={{ scale: 1.65, opacity: 0 }}
            transition={{ duration: 1.9, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
      </motion.button>
    </>
  )
}
