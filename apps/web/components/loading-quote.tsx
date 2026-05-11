'use client'

import { useState, useEffect } from 'react'

const QUOTES = [
  { text: "The first casualty when war comes, is truth.", author: "Hiram Johnson" },
  { text: "Journalism is the first rough draft of history.", author: "Philip Graham" },
  { text: "News is what somebody somewhere wants to suppress; all the rest is advertising.", author: "Lord Northcliffe" },
  { text: "The media's the most powerful entity on earth. They have the power to make the innocent guilty.", author: "Malcolm X" },
  { text: "Freedom of the press is not an end in itself, but a means to the end of a free society.", author: "Felix Frankfurter" },
  { text: "An informed citizenry is the only true repository of the public will.", author: "Thomas Jefferson" },
  { text: "A good newspaper is a nation talking to itself.", author: "Arthur Miller" },
  { text: "Newspapers are unable to discriminate between a bicycle accident and the collapse of civilisation.", author: "George Bernard Shaw" },
  { text: "The media is the message.", author: "Marshall McLuhan" },
  { text: "News is history shot on the wing.", author: "Gene Fowler" },
  { text: "Objective journalism and an opinion column are as similar as the Bible and Playboy.", author: "Walter Cronkite" },
  { text: "In a time of deceit, telling the truth is a revolutionary act.", author: "George Orwell" },
  { text: "The press is the best instrument for enlightening the mind of man.", author: "Thomas Jefferson" },
  { text: "If you don't read the newspaper, you're uninformed. If you do, you're misinformed.", author: "Mark Twain" },
  { text: "Whoever controls the media, controls the mind.", author: "Jim Morrison" },
  { text: "The duty of a journalist is to speak truth to power.", author: "James Nachtwey" },
  { text: "There are no facts, only interpretations.", author: "Friedrich Nietzsche" },
  { text: "The role of a writer is not to say what we all can say, but what we are unable to say.", author: "Anaïs Nin" },
  { text: "Bias is a lens through which the mind sees only what it expects to find.", author: "Walter Lippmann" },
  { text: "All the news that's fit to print.", author: "New York Times motto, 1896" },
]

function BrainGlobe({ color }: { color: string }) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes pulse-globe {
          0%, 100% { opacity: 0.3; transform: scale(0.97); }
          50% { opacity: 1; transform: scale(1.03); }
        }
        @keyframes draw-line {
          0% { stroke-dashoffset: 200; opacity: 0; }
          50% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0.6; }
        }
        .globe-outer { animation: pulse-globe 2s ease-in-out infinite; transform-origin: center; }
        .lat1 { stroke-dasharray: 200; animation: draw-line 2.5s ease-in-out infinite 0s; }
        .lat2 { stroke-dasharray: 200; animation: draw-line 2.5s ease-in-out infinite 0.3s; }
        .lat3 { stroke-dasharray: 200; animation: draw-line 2.5s ease-in-out infinite 0.6s; }
        .lon1 { stroke-dasharray: 200; animation: draw-line 2.5s ease-in-out infinite 0.9s; }
        .lon2 { stroke-dasharray: 200; animation: draw-line 2.5s ease-in-out infinite 1.2s; }
        .lon3 { stroke-dasharray: 200; animation: draw-line 2.5s ease-in-out infinite 1.5s; }
      `}</style>

      {/* Outer circle */}
      <circle className="globe-outer" cx="32" cy="32" r="28" stroke={color} strokeWidth="1.5" fill="none" opacity="0.8" />

      {/* Latitude lines */}
      <ellipse className="lat1" cx="32" cy="22" rx="20" ry="6" stroke={color} strokeWidth="1" fill="none" />
      <ellipse className="lat2" cx="32" cy="32" rx="28" ry="8" stroke={color} strokeWidth="1" fill="none" />
      <ellipse className="lat3" cx="32" cy="42" rx="20" ry="6" stroke={color} strokeWidth="1" fill="none" />

      {/* Longitude lines (brain-like curves) */}
      <path className="lon1" d="M32 4 Q44 18 44 32 Q44 46 32 60" stroke={color} strokeWidth="1" fill="none" strokeLinecap="round" />
      <path className="lon2" d="M32 4 Q20 18 20 32 Q20 46 32 60" stroke={color} strokeWidth="1" fill="none" strokeLinecap="round" />
      <path className="lon3" d="M32 4 Q52 24 50 38 Q48 52 32 60" stroke={color} strokeWidth="1" fill="none" strokeLinecap="round" />

      {/* Center dot */}
      <circle cx="32" cy="32" r="2.5" fill={color} opacity="0.8" />
    </svg>
  )
}

type Props = {
  palette?: string
}

export default function LoadingQuote({ palette = 'noir' }: Props) {
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)])
  const [dots, setDots] = useState('.')

  useEffect(() => {
    const t = setInterval(() => setDots((d) => d.length >= 3 ? '.' : d + '.'), 500)
    return () => clearInterval(t)
  }, [])

  // Palette opposta
  const isNoir = palette !== 'bureau'
  const bg = isNoir ? '#f7f4ef' : '#0a0a0a'
  const surface = isNoir ? '#edeae3' : '#161616'
  const border = isNoir ? '#d4cfc7' : '#2a2a2a'
  const textMain = isNoir ? '#1a1a1a' : '#f1f1f1'
  const textSub = isNoir ? '#5c4f42' : '#9ca3af'
  const accentColor = isNoir ? '#c0392b' : '#eab308'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-80 h-80 rounded-2xl flex flex-col items-center justify-between p-8 shadow-2xl"
        style={{ background: bg, border: `1px solid ${border}` }}
      >
        {/* Quote */}
        <div className="flex-1 flex flex-col justify-center text-center">
          <p
            className="text-sm leading-relaxed mb-3 italic"
            style={{ color: textMain, fontFamily: 'var(--font-h)' }}
          >
            "{quote.text}"
          </p>
          <p className="text-xs font-semibold" style={{ color: accentColor }}>
            — {quote.author}
          </p>
        </div>

        {/* Divider */}
        <div className="w-12 h-px my-3" style={{ background: border }} />

        {/* Globe + label */}
        <div className="flex flex-col items-center gap-2">
          <BrainGlobe color={accentColor} />
          <p className="text-xs tracking-wide" style={{ color: textSub, fontFamily: 'var(--font-b)' }}>
            La notizia sta arrivando{dots}
          </p>
        </div>
      </div>
    </div>
  )
}
