/**
 * Generates source PNG assets for @capacitor/assets:
 *   assets/icon.png        — 1024×1024  (app icon)
 *   assets/icon-only.png   — 1024×1024  (foreground only, for adaptive icon)
 *   assets/splash.png      — 2732×2732  (splash screen, all orientations)
 *
 * Design: zinc-950 background (#09090b) + amber-400 watch mark (#fbbf24)
 *
 * Run: node scripts/generate-assets.mjs
 */

import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'fs'

mkdirSync('assets', { recursive: true })

// ── Colours ────────────────────────────────────────────────────────────────
const BG   = '#09090b'   // zinc-950
const ACC  = '#fbbf24'   // amber-400

// ── Watch SVG (simplified crown + round case) ──────────────────────────────
// Scaled to fit within a 600×600 viewport centred in 1024×1024
function watchSvg(size, iconSize) {
  const half = size / 2
  const r    = iconSize * 0.28   // case radius
  const cw   = iconSize * 0.06   // crown width
  const ch   = iconSize * 0.14   // crown height
  const lw   = iconSize * 0.04   // line width (hour/minute hands)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" fill="${BG}"/>

    <!-- watch case -->
    <circle cx="${half}" cy="${half}" r="${r}" fill="none" stroke="${ACC}" stroke-width="${iconSize * 0.045}"/>

    <!-- crown (right side) -->
    <rect
      x="${half + r - 1}" y="${half - ch / 2}"
      width="${cw}" height="${ch}"
      rx="${cw * 0.4}"
      fill="${ACC}"/>

    <!-- hour hand (pointing ~10 o'clock) -->
    <line
      x1="${half}" y1="${half}"
      x2="${half - r * 0.38}" y2="${half - r * 0.52}"
      stroke="${ACC}" stroke-width="${lw}" stroke-linecap="round"/>

    <!-- minute hand (pointing ~2 o'clock) -->
    <line
      x1="${half}" y1="${half}"
      x2="${half + r * 0.32}" y2="${half - r * 0.62}"
      stroke="${ACC}" stroke-width="${lw * 0.75}" stroke-linecap="round"/>

    <!-- centre dot -->
    <circle cx="${half}" cy="${half}" r="${iconSize * 0.025}" fill="${ACC}"/>
  </svg>`
}

// ── Icon  1024×1024 ────────────────────────────────────────────────────────
const iconSvg = watchSvg(1024, 1024)
await sharp(Buffer.from(iconSvg)).png().toFile('assets/icon.png')
console.log('✓ assets/icon.png')

// ── Icon-only  1024×1024  (adaptive icon foreground — transparent bg) ──────
function watchSvgTransparent(size, iconSize) {
  const half = size / 2
  const r    = iconSize * 0.28
  const cw   = iconSize * 0.06
  const ch   = iconSize * 0.14
  const lw   = iconSize * 0.04
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <circle cx="${half}" cy="${half}" r="${r}" fill="none" stroke="${ACC}" stroke-width="${iconSize * 0.045}"/>
    <rect x="${half + r - 1}" y="${half - ch / 2}" width="${cw}" height="${ch}" rx="${cw * 0.4}" fill="${ACC}"/>
    <line x1="${half}" y1="${half}" x2="${half - r * 0.38}" y2="${half - r * 0.52}" stroke="${ACC}" stroke-width="${lw}" stroke-linecap="round"/>
    <line x1="${half}" y1="${half}" x2="${half + r * 0.32}" y2="${half - r * 0.62}" stroke="${ACC}" stroke-width="${lw * 0.75}" stroke-linecap="round"/>
    <circle cx="${half}" cy="${half}" r="${iconSize * 0.025}" fill="${ACC}"/>
  </svg>`
}
await sharp(Buffer.from(watchSvgTransparent(1024, 1024))).png().toFile('assets/icon-only.png')
console.log('✓ assets/icon-only.png')

// ── Splash  2732×2732 ──────────────────────────────────────────────────────
// Wordmark "WatchScout" beneath the watch mark
const SW = 2732
const splashSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SW}" height="${SW}">
  <rect width="${SW}" height="${SW}" fill="${BG}"/>

  ${watchSvg(SW, SW * 0.22).replace(`<rect width="${SW}" height="${SW}" fill="${BG}"/>`, '')}

  <!-- wordmark -->
  <text
    x="${SW / 2}" y="${SW / 2 + SW * 0.175}"
    font-family="system-ui, -apple-system, sans-serif"
    font-size="${SW * 0.055}"
    font-weight="600"
    letter-spacing="${SW * 0.003}"
    fill="${ACC}"
    text-anchor="middle"
    dominant-baseline="middle">WatchScout</text>
</svg>`

await sharp(Buffer.from(splashSvg)).png().toFile('assets/splash.png')
console.log('✓ assets/splash.png')

console.log('\nNow run: npx @capacitor/assets generate --android')
