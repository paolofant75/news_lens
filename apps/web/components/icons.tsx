type IconProps = { size?: number; className?: string; style?: React.CSSProperties }

const Icon = ({ size = 16, path, className, style }: IconProps & { path: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d={path} />
  </svg>
)

export const IconNewspaper = (p: IconProps) => <Icon {...p} path="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2M18 14h-8M15 18h-5M10 6h8v4h-8V6Z" />
export const IconScale   = (p: IconProps) => <Icon {...p} path="M12 3v18M3 6l9-3 9 3M3 18l9 3 9-3M3 12h18" />
export const IconGlobe   = (p: IconProps) => <Icon {...p} path="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2ZM2 12h20M12 2c-4 4-4 16 0 20M12 2c4 4 4 16 0 20" />
export const IconActivity = (p: IconProps) => <Icon {...p} path="M22 12h-4l-3 9L9 3l-3 9H2" />
export const IconSearch   = (p: IconProps) => <Icon {...p} path="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z" />
export const IconZap      = (p: IconProps) => <Icon {...p} path="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
export const IconGlobe2   = (p: IconProps) => <Icon {...p} path="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2ZM2 12h20M12 2c-4 4-4 16 0 20M12 2c4 4 4 16 0 20M4.93 4.93l14.14 14.14" />
export const IconCpu      = (p: IconProps) => <Icon {...p} path="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2M7 7h10v10H7zM9 9h6v6H9z" />
export const IconTrending = (p: IconProps) => <Icon {...p} path="M22 7 13.5 15.5l-5-5L2 17M22 7h-6M22 7v6" />
export const IconFlask    = (p: IconProps) => <Icon {...p} path="M9 2v8.5L4.5 20a1 1 0 0 0 .9 1.5h13.2a1 1 0 0 0 .9-1.5L15 10.5V2M9 2h6M7 16h10" />
export const IconLayers   = (p: IconProps) => <Icon {...p} path="M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5" />
export const IconEye      = (p: IconProps) => <Icon {...p} path="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
export const IconChevronRight = (p: IconProps) => <Icon {...p} path="m9 18 6-6-6-6" />
export const IconChevronDown  = (p: IconProps) => <Icon {...p} path="m6 9 6 6 6-6" />
export const IconMap      = (p: IconProps) => <Icon {...p} path="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6ZM9 3v15M15 6v15" />
export const IconMapPin   = (p: IconProps) => <Icon {...p} path="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
export const IconUser     = (p: IconProps) => <Icon {...p} path="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
export const IconLandmark = (p: IconProps) => <Icon {...p} path="M3 22h18M5 22V10M9 22V10M15 22V10M19 22V10M2 10h20L12 3 2 10Z" />
export const IconBall     = (p: IconProps) => <Icon {...p} path="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2ZM12 2l3.5 6.5M12 2l-3.5 6.5M2.5 9l5.5 2M21.5 9l-5.5 2M5 19l3-5M19 19l-3-5M8.5 8.5l3.5 2.5 3.5-2.5M8 14l4-3 4 3M12 11v3" />
export const IconSwords   = (p: IconProps) => <Icon {...p} path="M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2M2 22l3-1 1-2M14.5 6.5 18 3h3v3l-3.5 3.5" />
export const IconMicroscope = (p: IconProps) => <Icon {...p} path="M6 18h8M3 22h18M14 22a7 7 0 1 0 0-14h-1M9 14h2M9 12h2M12 6 8.5 2.5a2.12 2.12 0 0 0-3 0L4 4l4 4M9 7 6 10M22 19a2 2 0 0 1-2 2" />
export const IconHospital = (p: IconProps) => <Icon {...p} path="M12 6v4M8 8h8M3 22h18M4 22V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v18M9 22v-4h6v4" />
export const IconLeaf     = (p: IconProps) => <Icon {...p} path="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.5 2c.5 5 .5 10-3 13a7 7 0 0 1-5.5 5ZM2 21c0-3 1.85-5.36 5.08-6" />
export const IconMasks    = (p: IconProps) => <Icon {...p} path="M3 13c0 4.97 4.03 9 9 9 1.66 0 3.22-.45 4.56-1.23M21 11c0-4.97-4.03-9-9-9-1.66 0-3.22.45-4.56 1.23M8 9h.01M14 9h.01M9 14s1 1.5 3 1.5 3-1.5 3-1.5" />
export const IconMosque   = (p: IconProps) => <Icon {...p} path="M3 22h18M5 22V11a7 7 0 0 1 14 0v11M12 4V2M11 4h2M9 22v-4a3 3 0 0 1 6 0v4M5 14h2M17 14h2" />
export const IconWaves    = (p: IconProps) => <Icon {...p} path="M2 6c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2M2 12c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2M2 18c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2" />
export const IconCoins    = (p: IconProps) => <Icon {...p} path="M9 13a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM18 8a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM18 8a5 5 0 0 1-4.5-3M14 13.5a5 5 0 0 1 4.5-3M18 18a5 5 0 0 1-4.5 3" />
export const IconLightbulb = (p: IconProps) => <Icon {...p} path="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2V18h6v-1.3c0-.8.4-1.5 1-2A7 7 0 0 0 12 2Z" />
export const IconBarChart = (p: IconProps) => <Icon {...p} path="M3 3v18h18M7 16V10M12 16V6M17 16v-4" />
export const IconSettings = (p: IconProps) => <Icon {...p} path="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
export const IconLink     = (p: IconProps) => <Icon {...p} path="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
export const IconSatellite = (p: IconProps) => <Icon {...p} path="m4 10 7 7M10.5 3.5 7 7l4 4 3.5-3.5M13.5 13.5 17 17l-3.5 3.5-4-4M19 11.5a8 8 0 0 0-7.5-7.5M16 13a4 4 0 0 0-3.5-3.5" />
export const IconBook     = (p: IconProps) => <Icon {...p} path="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
export const IconVote     = (p: IconProps) => <Icon {...p} path="m9 12 2 2 4-4M5 12V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5M3 16h18l-2 5H5l-2-5Z" />
export const IconPin      = (p: IconProps) => <Icon {...p} path="M12 17v5M9 10.76a2 2 0 0 1-1.11 1.79L6 13.5h12l-1.89-.95A2 2 0 0 1 15 10.76V5h1a1 1 0 0 0 0-2H8a1 1 0 0 0 0 2h1v5.76Z" />
export const IconClock    = (p: IconProps) => <Icon {...p} path="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2ZM12 6v6l4 2" />
export const IconLock     = (p: IconProps) => <Icon {...p} path="M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2ZM7 11V7a5 5 0 0 1 10 0v4" />
export const IconRefresh  = (p: IconProps) => <Icon {...p} path="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5" />
export const IconCompass  = (p: IconProps) => <Icon {...p} path="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2Zm4.24 5.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12Z" />
export const IconClose    = (p: IconProps) => <Icon {...p} path="M18 6 6 18M6 6l12 12" />
export const IconCheck    = (p: IconProps) => <Icon {...p} path="M20 6 9 17l-5-5" />
export const IconAlert    = (p: IconProps) => <Icon {...p} path="m10.29 3.86-8.18 14.14A2 2 0 0 0 3.83 21h16.34a2 2 0 0 0 1.72-3L13.71 3.86a2 2 0 0 0-3.42 0ZM12 9v4M12 17h.01" />
export const IconFlag     = (p: IconProps) => <Icon {...p} path="M4 22V4M4 4c3-2 6 2 9 0s5-2 7 0v10c-2-2-4-2-7 0s-6-2-9 0" />
export const IconSparkle  = (p: IconProps) => <Icon {...p} path="m12 3 1.9 5.7L20 10l-5.7 1.9L12 18l-1.9-5.7L4 10l5.7-1.9L12 3Z" />
export const IconStar     = (p: IconProps) => <Icon {...p} path="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" />
export const IconBreaking = (p: IconProps) => <Icon {...p} path="M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12ZM12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
export const IconArrow    = (p: IconProps) => <Icon {...p} path="M5 12h14M13 6l6 6-6 6" />
export const IconArrowDown = (p: IconProps) => <Icon {...p} path="M12 5v14M19 12l-7 7-7-7" />
export const IconPlay            = (p: IconProps) => <Icon {...p} path="M6 4v16l14-8L6 4Z" />
export const IconMessageCircle   = (p: IconProps) => <Icon {...p} path="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
export const IconSend            = (p: IconProps) => <Icon {...p} path="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7Z" />
