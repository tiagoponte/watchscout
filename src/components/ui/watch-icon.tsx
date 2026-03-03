import { cn } from '@/lib/utils'
import { WatchCategory } from '@/types'

interface WatchIconProps {
  category: WatchCategory
  className?: string
}

// All icons use a 100×100 viewBox, center (50,50), case radius 43.
const r = (n: number) => Math.round(n * 1000) / 1000

// tick(i, r1, r2) — hour marker at clock-position i (0=12, 3=3, 6=6, 9=9)
function tick(i: number, r1: number, r2: number) {
  const a = (i * 30 - 90) * (Math.PI / 180)
  const c = Math.cos(a), s = Math.sin(a)
  return { x1: r(50 + r1 * c), y1: r(50 + r1 * s), x2: r(50 + r2 * c), y2: r(50 + r2 * s) }
}

// Four cardinal ticks inside a subdial at (cx, cy) with radius sr
function subdialTicks(cx: number, cy: number, sr: number) {
  return [0, 1, 2, 3].map(i => {
    const a = (i * 90 - 90) * (Math.PI / 180)
    const c = Math.cos(a), s = Math.sin(a)
    return { x1: r(cx + (sr - 3.5) * c), y1: r(cy + (sr - 3.5) * s), x2: r(cx + sr * c), y2: r(cy + sr * s) }
  })
}

function ChronographDial() {
  const subdials = [
    { cx: 30, cy: 50 }, // 9 o'clock — running seconds
    { cx: 70, cy: 50 }, // 3 o'clock — 30-min counter
    { cx: 50, cy: 70 }, // 6 o'clock — 12-hr counter
  ]
  const SR = 10.5

  return (
    <>
      {/* Tachymeter ring */}
      <circle cx="50" cy="50" r="47" strokeWidth="1" />
      {/* Case */}
      <circle cx="50" cy="50" r="43" strokeWidth="2.5" />
      {/* Hour markers */}
      {Array.from({ length: 12 }, (_, i) => {
        const isQ = i % 3 === 0
        const t = tick(i, isQ ? 34 : 37, 41)
        return <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} strokeWidth={isQ ? 3 : 1.5} />
      })}
      {/* Subdial rings */}
      {subdials.map((s, i) => (
        <circle key={i} cx={s.cx} cy={s.cy} r={SR} strokeWidth="1.5" />
      ))}
      {/* Subdial ticks */}
      {subdials.map((s, i) =>
        subdialTicks(s.cx, s.cy, SR).map((t, j) => (
          <line key={`${i}-${j}`} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} strokeWidth="1" />
        ))
      )}
      {/* Central chrono hand — straight up */}
      <line x1="50" y1="50" x2="50" y2="14" strokeWidth="1.5" strokeLinecap="round" />
      {/* Hour hand — 10 o'clock */}
      <line x1="50" y1="50" x2="28" y2="37" strokeWidth="4.5" strokeLinecap="round" />
      {/* Minute hand — 2 o'clock */}
      <line x1="50" y1="50" x2="81" y2="32" strokeWidth="2.5" strokeLinecap="round" />
      {/* Center pivot */}
      <circle cx="50" cy="50" r="3.5" fill="currentColor" stroke="none" />
    </>
  )
}

function DiverDial() {
  return (
    <>
      {/* Bezel ring */}
      <circle cx="50" cy="50" r="47" strokeWidth="2.5" />
      {/* Case */}
      <circle cx="50" cy="50" r="43" strokeWidth="2.5" />
      {/* Lume triangle at 12 on bezel */}
      <polygon points="50,6 44,19 56,19" fill="currentColor" stroke="none" />
      {/* Bold rectangular markers at 3, 6, 9 */}
      {[3, 6, 9].map(i => {
        const t = tick(i, 31, 41)
        return <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} strokeWidth="5.5" strokeLinecap="butt" />
      })}
      {/* Regular markers at other hours (skip 12 — that's the triangle) */}
      {[1, 2, 4, 5, 7, 8, 10, 11].map(i => {
        const t = tick(i, 36, 41)
        return <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} strokeWidth="3" strokeLinecap="butt" />
      })}
      {/* Broad hour hand — 10 o'clock */}
      <line x1="50" y1="50" x2="28" y2="37" strokeWidth="6.5" strokeLinecap="round" />
      {/* Minute hand — 2 o'clock */}
      <line x1="50" y1="50" x2="79" y2="33" strokeWidth="4" strokeLinecap="round" />
      {/* Center pivot */}
      <circle cx="50" cy="50" r="4" fill="currentColor" stroke="none" />
    </>
  )
}

function DressDial() {
  return (
    <>
      {/* Case — thin and elegant */}
      <circle cx="50" cy="50" r="43" strokeWidth="1.5" />
      {/* Fine tick marks */}
      {Array.from({ length: 12 }, (_, i) => {
        const isQ = i % 3 === 0
        const t = tick(i, isQ ? 33 : 38, 41)
        return <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} strokeWidth={isQ ? 1.5 : 1} strokeLinecap="butt" />
      })}
      {/* Sub-seconds circle at 6 o'clock */}
      <circle cx="50" cy="67" r="7.5" strokeWidth="1" />
      <line x1="50" y1="63" x2="50" y2="60" strokeWidth="1" strokeLinecap="butt" />
      {/* Slender hour hand — 10 o'clock */}
      <line x1="50" y1="50" x2="28" y2="37" strokeWidth="2.5" strokeLinecap="round" />
      {/* Slender minute hand — 2 o'clock */}
      <line x1="50" y1="50" x2="79" y2="33" strokeWidth="1.5" strokeLinecap="round" />
      {/* Center pivot — small */}
      <circle cx="50" cy="50" r="2.5" fill="currentColor" stroke="none" />
    </>
  )
}

function FieldDial() {
  return (
    <>
      {/* Case — sturdy */}
      <circle cx="50" cy="50" r="43" strokeWidth="3.5" />
      {/* Inner chapter ring */}
      <circle cx="50" cy="50" r="36" strokeWidth="1" />
      {/* Bold square markers — uniform at all 12 positions */}
      {Array.from({ length: 12 }, (_, i) => {
        const isQ = i % 3 === 0
        const t = tick(i, 27, 35)
        return <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} strokeWidth={isQ ? 6 : 4} strokeLinecap="square" />
      })}
      {/* Wide sword hour hand — 10 o'clock */}
      <line x1="50" y1="50" x2="28" y2="37" strokeWidth="7" strokeLinecap="square" />
      {/* Wide sword minute hand — 2 o'clock */}
      <line x1="50" y1="50" x2="79" y2="33" strokeWidth="5" strokeLinecap="square" />
      {/* Center pivot */}
      <circle cx="50" cy="50" r="5" fill="currentColor" stroke="none" />
    </>
  )
}

export function WatchIcon({ category, className }: WatchIconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      className={cn('h-6 w-6', className)}
      aria-hidden="true"
    >
      {category === 'chronograph' && <ChronographDial />}
      {category === 'diver' && <DiverDial />}
      {category === 'dress' && <DressDial />}
      {category === 'field' && <FieldDial />}
    </svg>
  )
}
