import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function BaseIcon({ size = 18, children, ...props }: IconProps) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{children}</svg>;
}

export const SearchIcon = (p: IconProps) => <BaseIcon {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></BaseIcon>;
export const BellIcon = (p: IconProps) => <BaseIcon {...p}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></BaseIcon>;
export const SunIcon = (p: IconProps) => <BaseIcon {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></BaseIcon>;
export const MoonIcon = (p: IconProps) => <BaseIcon {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/></BaseIcon>;
export const RefreshIcon = (p: IconProps) => <BaseIcon {...p}><path d="M20 7v5h-5"/><path d="M4 17v-5h5"/><path d="M18.4 9A7 7 0 0 0 6.2 6.2L4 9M20 15l-2.2 2.8A7 7 0 0 1 5.6 15"/></BaseIcon>;
export const XIcon = (p: IconProps) => <BaseIcon {...p}><path d="M18 6 6 18M6 6l12 12"/></BaseIcon>;
export const ChevronRightIcon = (p: IconProps) => <BaseIcon {...p}><path d="m9 18 6-6-6-6"/></BaseIcon>;
export const ChevronLeftIcon = (p: IconProps) => <BaseIcon {...p}><path d="m15 18-6-6 6-6"/></BaseIcon>;
export const BuildingIcon = (p: IconProps) => <BaseIcon {...p}><path d="M3 21h18M6 21V4h12v17M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1"/></BaseIcon>;
export const FileIcon = (p: IconProps) => <BaseIcon {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16h16V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></BaseIcon>;
export const CalendarIcon = (p: IconProps) => <BaseIcon {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></BaseIcon>;
export const ClockIcon = (p: IconProps) => <BaseIcon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></BaseIcon>;
export const PinIcon = (p: IconProps) => <BaseIcon {...p}><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/></BaseIcon>;
export const GridIcon = (p: IconProps) => <BaseIcon {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></BaseIcon>;
export const ListIcon = (p: IconProps) => <BaseIcon {...p}><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></BaseIcon>;
export const AlertIcon = (p: IconProps) => <BaseIcon {...p}><path d="M12 3 2.5 20h19Z"/><path d="M12 9v4M12 17h.01"/></BaseIcon>;
export const CheckIcon = (p: IconProps) => <BaseIcon {...p}><path d="m5 12 4 4L19 6"/></BaseIcon>;
export const ArrowDownIcon = (p: IconProps) => <BaseIcon {...p}><path d="m6 9 6 6 6-6"/></BaseIcon>;
export const DatabaseIcon = (p: IconProps) => <BaseIcon {...p}><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3"/></BaseIcon>;
export const DownloadIcon = (p: IconProps) => <BaseIcon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/></BaseIcon>;
export const UploadIcon = (p: IconProps) => <BaseIcon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/></BaseIcon>;
export const RestoreIcon = (p: IconProps) => <BaseIcon {...p}><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></BaseIcon>;
export const SparkIcon = (p: IconProps) => <BaseIcon {...p}><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z"/><path d="M19 17v4M17 19h4"/></BaseIcon>;
