import type { SVGProps } from 'react'

const paths = {
  dashboard: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4',
  folder: 'M3 5h6l2 3h10v12H3z',
  building: 'M5 21V3h14v18z M9 7h1 M14 7h1 M9 11h1 M14 11h1 M10 21v-5h4v5',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M16 4a4 4 0 0 1 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  key: 'M9 15l11-11 M16 8l3 3 M18 6l3 3 M10 17a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  clock: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M12 7v5l3 2',
  list: 'M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01',
  chart: 'M3 3v18h18 M7 17v-5 M12 17V7 M17 17v-8',
  user: 'M20 21v-2a8 8 0 0 0-16 0v2 M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  collapse: 'M11 5l-7 7 7 7 M20 5l-7 7 7 7',
  plus: 'M12 5v14 M5 12h14',
}

export type IconName = keyof typeof paths

export default function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d={paths[name]} />
    </svg>
  )
}
