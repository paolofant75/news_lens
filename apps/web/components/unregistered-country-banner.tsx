'use client'

import { useState } from 'react'
import { useCountry } from './country-provider'
import { COUNTRIES } from '../lib/countries'

const G7_CODES = ['US', 'CA', 'GB', 'FR', 'DE', 'IT', 'JP']

export default function UnregisteredCountryBanner() {
  const { country, setTempCountry, loading } = useCountry()
  const [showDropdown, setShowDropdown] = useState(false)
  const currentCountry = COUNTRIES.find(c => c.code === country)

  if (loading) {
    return (
      <div className="px-4 py-3 rounded-lg mb-4 animate-pulse"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
    )
  }

  return (
    <div className="px-4 py-3 rounded-lg mb-4"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="text-lg">🌍</div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              Paese: <span style={{ color: 'var(--accent)' }}>{currentCountry?.nameIt || country}</span>
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
              Registrati per salvare questa preferenza
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
          style={{
            background: 'var(--bg-s)',
            border: '1px solid var(--border)',
            color: 'var(--text-2)',
          }}
        >
          Cambia
        </button>
      </div>

      {showDropdown && (
        <div className="mt-4 space-y-3">
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>G7 - Accesso rapido</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {G7_CODES.map(code => {
                const c = COUNTRIES.find(x => x.code === code)
                return (
                  <button
                    key={code}
                    onClick={() => {
                      setTempCountry(code)
                      setShowDropdown(false)
                    }}
                    style={country === code
                      ? { background: 'var(--accent)', color: '#fff' }
                      : {
                        background: 'var(--bg-s)',
                        color: 'var(--text-2)',
                        border: '1px solid var(--border)',
                      }}
                    className="px-2 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                  >
                    {c?.nameIt}
                  </button>
                )
              })}
            </div>
          </div>

          <CountryDropdownAll
            selectedCountry={country}
            onSelect={(code) => {
              setTempCountry(code)
              setShowDropdown(false)
            }}
          />
        </div>
      )}
    </div>
  )
}

function CountryDropdownAll({ selectedCountry, onSelect }: { selectedCountry: string; onSelect: (code: string) => void }) {
  const [search, setSearch] = useState('')

  const filtered = COUNTRIES.filter(c =>
    c.nameIt.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  )

  const nonG7 = filtered.filter(c => !G7_CODES.includes(c.code))

  return (
    <div className="border-t pt-3" style={{ borderColor: 'var(--border)' }}>
      <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>Tutti i paesi</p>
      <input
        type="text"
        placeholder="Cerca paese..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-sm mb-2 border"
        style={{
          background: 'var(--bg)',
          color: 'var(--text)',
          borderColor: 'var(--border)',
        }}
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
        {nonG7.map(c => (
          <button
            key={c.code}
            onClick={() => onSelect(c.code)}
            style={selectedCountry === c.code
              ? { background: 'var(--accent)', color: '#fff' }
              : {
                background: 'var(--bg-s)',
                color: 'var(--text-2)',
                border: '1px solid var(--border)',
              }}
            className="px-2 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80 text-left"
          >
            {c.nameIt}
          </button>
        ))}
      </div>
    </div>
  )
}
