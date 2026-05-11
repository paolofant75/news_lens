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
