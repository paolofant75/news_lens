'use client'

import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

// Coordinate centroidi per area geografica
const REGION_MARKERS = [
  { slug: 'europa',        label: 'Europa',       coords: [15, 52]  as [number, number] },
  { slug: 'americhe',      label: 'Americhe',     coords: [-80, 10] as [number, number] },
  { slug: 'medio-oriente', label: 'Medio Oriente',coords: [45, 28]  as [number, number] },
  { slug: 'asia',          label: 'Asia',         coords: [100, 35] as [number, number] },
  { slug: 'africa',        label: 'Africa',       coords: [20, 5]   as [number, number] },
  { slug: 'oceania',       label: 'Oceania',      coords: [140, -25]as [number, number] },
  { slug: 'americhe',      label: 'Nord America', coords: [-95, 45] as [number, number] },
]

type Props = {
  counts: Record<string, number>
  activeArea: string
  onSelectArea: (slug: string) => void
}

const COLORS: Record<string, string> = {
  europa:          '#6366f1',
  americhe:        '#f59e0b',
  'medio-oriente': '#ef4444',
  asia:            '#10b981',
  africa:          '#f97316',
  oceania:         '#06b6d4',
  mondo:           '#6b7280',
}

export default function WorldMap({ counts, activeArea, onSelectArea }: Props) {
  const max = Math.max(...Object.values(counts).filter(Boolean), 1)

  return (
    <div className="w-full bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 120, center: [10, 20] }}
        style={{ width: '100%', height: '420px' }}
      >
        <ZoomableGroup>
          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#1f2937"
                  stroke="#374151"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { fill: '#374151', outline: 'none' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>

          {REGION_MARKERS.map((region) => {
            const count = counts[region.slug] ?? 0
            if (!count) return null
            const size = 8 + (count / max) * 24
            const isActive = activeArea === region.slug
            const color = COLORS[region.slug] ?? '#6b7280'

            return (
              <Marker
                key={region.slug + region.coords.join()}
                coordinates={region.coords}
                onClick={() => onSelectArea(isActive ? '' : region.slug)}
              >
                <circle
                  r={size}
                  fill={color}
                  fillOpacity={isActive ? 0.9 : 0.5}
                  stroke={color}
                  strokeWidth={isActive ? 2 : 1}
                  style={{ cursor: 'pointer' }}
                />
                <text
                  textAnchor="middle"
                  y={-size - 4}
                  style={{ fontSize: 10, fill: '#e5e7eb', pointerEvents: 'none' }}
                >
                  {count}
                </text>
              </Marker>
            )
          })}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  )
}
