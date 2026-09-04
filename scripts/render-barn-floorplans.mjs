/**
 * Renders reference floorplans for the barn / barracks room (45'-0" x 20'-0").
 *
 * Outputs to assets/timetourist/floorplans/ as both SVG and PNG:
 *   barn-floorplan-base.svg|png      - dimensioned shell, structural bays, openings
 *   barn-floorplan-75-occupants.svg  - max occupant load, 75 people, assembly seating
 *   barn-floorplan-low-tables.svg    - low dining tables with floor cushions, 56 seated
 *
 * Geometry assumptions worth verifying on site: three 8" x 8" centerline posts at
 * 11'-3" on centre (four bays), seven 3'-0" windows per long wall, a 6'-0" entry at
 * one gable end and a 3'-6" exit at the other.
 *
 * Usage: node scripts/render-barn-floorplans.mjs
 */
import {mkdir, writeFile} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import sharp from 'sharp'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUTPUT_DIR = path.join(repoRoot, 'assets', 'timetourist', 'floorplans')

/* ---------------------------------------------------------------- shell ---- */

const ROOM_L = 45
const ROOM_W = 20
const WALL = 0.5
const POST = 8 / 12
const POST_XS = [11.25, 22.5, 33.75]
const POST_Y = ROOM_W / 2

const WINDOW_W = 3
const WINDOW_XS = [3.5, 9.5, 15.5, 21.5, 27.5, 33.5, 39.5]
const ENTRY_W = 6

// Mylar panel build-out: 32" square frames, 1x2 stretcher plus a z-clip cleat.
const PANEL_W = 32 / 12
const PANEL_DEPTH = 2.5 / 12
const MIRROR_T = 0.25

// Standard twin mattress, 38" x 75".
const TWIN_L = 75 / 12
const TWIN_W = 38 / 12

/* ----------------------------------------------------------------- page ---- */

const SCALE = 22
const ORIGIN_X = 105
const ORIGIN_Y = 138
const CANVAS_W = ROOM_L * SCALE + 210
const CANVAS_H = ROOM_W * SCALE + 138 + 315

const PAPER = '#fcfbf7'
const INK = '#20242a'
const POCHE = '#2c3138'
const GRID_MINOR = '#eae7df'
const GRID_MAJOR = '#dbd6ca'
const DIM = '#8a8578'
const NOTE = '#6a6459'
const STRUCT = '#9a4a3c'
const CIRC = '#cfe3ea'
const CIRC_EDGE = '#8fb6c4'
const CHAIR = '#7d8b98'
const CHAIR_EDGE = '#4d5a60'
const TABLE = '#b98b52'
const TABLE_EDGE = '#7d5a2c'
const CUSHION = '#d8a15c'
const CUSHION_EDGE = '#9c6a2c'
const PANEL = '#c9b6d8'
const PANEL_EDGE = '#7d5f96'
const MIRROR = '#cfd8dc'
const MIRROR_EDGE = '#78909c'
const MATTRESS = '#eef2f5'
const MATTRESS_EDGE = '#8a9aa6'
const PILLOW = '#dfe7ec'
const BODY = '#e8eef2'
const BODY_EDGE = '#3d5766'
const HEAD = '#3d5766'
const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif"

const X = x => ORIGIN_X + x * SCALE
const Y = y => ORIGIN_Y + y * SCALE
const S = v => v * SCALE
const n = v => Math.round(v * 100) / 100

/** Decimal feet -> architectural string, e.g. 11.25 -> 11'-3". */
function feet(value) {
  const total = Math.round(value * 12)
  const ft = Math.floor(total / 12)
  const inch = total % 12
  return `${ft}'-${inch}"`
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function text(x, y, str, {size = 11, fill = INK, anchor = 'start', weight = 400, spacing = 0, style = 'normal'} = {}) {
  return `<text x="${n(x)}" y="${n(y)}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" font-style="${style}" letter-spacing="${spacing}" fill="${fill}" text-anchor="${anchor}">${esc(str)}</text>`
}

function rect(x, y, w, h, attrs = '') {
  return `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" ${attrs}/>`
}

/** Room-space rectangle in feet. */
function room(x, y, w, h, attrs = '') {
  return rect(X(x), Y(y), S(w), S(h), attrs)
}

/* ------------------------------------------------------------ shell draw ---- */

function grid(minor) {
  const out = []
  if (minor) {
    for (let x = 1; x < ROOM_L; x += 1) {
      if (x % 5 === 0) continue
      out.push(`<line x1="${n(X(x))}" y1="${n(Y(0))}" x2="${n(X(x))}" y2="${n(Y(ROOM_W))}" stroke="${GRID_MINOR}" stroke-width="0.5"/>`)
    }
    for (let y = 1; y < ROOM_W; y += 1) {
      if (y % 5 === 0) continue
      out.push(`<line x1="${n(X(0))}" y1="${n(Y(y))}" x2="${n(X(ROOM_L))}" y2="${n(Y(y))}" stroke="${GRID_MINOR}" stroke-width="0.5"/>`)
    }
  }
  for (let x = 5; x < ROOM_L; x += 5) {
    out.push(`<line x1="${n(X(x))}" y1="${n(Y(0))}" x2="${n(X(x))}" y2="${n(Y(ROOM_W))}" stroke="${GRID_MAJOR}" stroke-width="0.7"/>`)
  }
  for (let y = 5; y < ROOM_W; y += 5) {
    out.push(`<line x1="${n(X(0))}" y1="${n(Y(y))}" x2="${n(X(ROOM_L))}" y2="${n(Y(y))}" stroke="${GRID_MAJOR}" stroke-width="0.7"/>`)
  }
  return out.join('\n')
}

/** Wall poche with window and door openings knocked out. */
function walls() {
  const out = []
  const o = WALL
  // Outer face of the wall band, drawn as four solid strips then openings erased.
  const strips = [
    [-o, -o, ROOM_L + 2 * o, o], // north
    [-o, ROOM_W, ROOM_L + 2 * o, o], // south
    [-o, 0, o, ROOM_W], // west
    [ROOM_L, 0, o, ROOM_W], // east
  ]
  for (const [x, y, w, h] of strips) {
    out.push(room(x, y, w, h, `fill="${POCHE}"`))
  }

  // Windows: paper gap plus a thin glazing line on both long walls.
  for (const cx of WINDOW_XS) {
    for (const wallY of [-o, ROOM_W]) {
      out.push(room(cx - WINDOW_W / 2, wallY, WINDOW_W, o, `fill="${PAPER}"`))
      const gy = wallY + o / 2
      out.push(
        `<line x1="${n(X(cx - WINDOW_W / 2))}" y1="${n(Y(gy))}" x2="${n(X(cx + WINDOW_W / 2))}" y2="${n(Y(gy))}" stroke="${INK}" stroke-width="1"/>`
      )
      out.push(room(cx - WINDOW_W / 2, wallY, WINDOW_W, o, `fill="none" stroke="${INK}" stroke-width="0.8"`))
    }
  }

  // Entry (west gable) and exit (east gable), each with a swing arc.
  const entryY = ROOM_W / 2 - ENTRY_W / 2
  out.push(room(-o, entryY, o, ENTRY_W, `fill="${PAPER}"`))
  out.push(
    `<path d="M ${n(X(0))} ${n(Y(entryY))} A ${n(S(ENTRY_W / 2))} ${n(S(ENTRY_W / 2))} 0 0 1 ${n(X(ENTRY_W / 2))} ${n(Y(entryY + ENTRY_W / 2))}" fill="none" stroke="${DIM}" stroke-width="0.8"/>`,
    `<path d="M ${n(X(0))} ${n(Y(entryY + ENTRY_W))} A ${n(S(ENTRY_W / 2))} ${n(S(ENTRY_W / 2))} 0 0 0 ${n(X(ENTRY_W / 2))} ${n(Y(entryY + ENTRY_W / 2))}" fill="none" stroke="${DIM}" stroke-width="0.8"/>`,
    `<line x1="${n(X(0))}" y1="${n(Y(entryY))}" x2="${n(X(0))}" y2="${n(Y(entryY + ENTRY_W))}" stroke="${INK}" stroke-width="1.6"/>`
  )

  // East gable is a full-width mirror, no exit opening.
  out.push(room(ROOM_L - MIRROR_T, 0, MIRROR_T, ROOM_W, `fill="${MIRROR}" stroke="${MIRROR_EDGE}" stroke-width="1"`))
  for (let my = 0.6; my < ROOM_W; my += 1.2) {
    out.push(
      `<line x1="${n(X(ROOM_L - MIRROR_T))}" y1="${n(Y(my))}" x2="${n(X(ROOM_L))}" y2="${n(Y(my - 0.5))}" stroke="${MIRROR_EDGE}" stroke-width="0.6"/>`
    )
  }

  out.push(room(0, 0, ROOM_L, ROOM_W, `fill="none" stroke="${INK}" stroke-width="1.2"`))
  return out.join('\n')
}

/** Mylar panel build-out on both long walls, projecting PANEL_DEPTH into the room. */
function panelBand() {
  const out = []
  for (const [y, h] of [
    [0, PANEL_DEPTH],
    [ROOM_W - PANEL_DEPTH, PANEL_DEPTH],
  ]) {
    out.push(room(0, y, ROOM_L, h, `fill="${PANEL}" stroke="${PANEL_EDGE}" stroke-width="0.9"`))
  }
  // Panel joint ticks every 32" so the module reads in plan.
  for (let x = PANEL_W; x < ROOM_L; x += PANEL_W) {
    for (const y of [0, ROOM_W - PANEL_DEPTH]) {
      out.push(
        `<line x1="${n(X(x))}" y1="${n(Y(y))}" x2="${n(X(x))}" y2="${n(Y(y + PANEL_DEPTH))}" stroke="${PANEL_EDGE}" stroke-width="0.7"/>`
      )
    }
  }
  return out.join('\n')
}

function posts({label = true} = {}) {
  const out = []
  for (const px of POST_XS) {
    out.push(room(px - POST / 2, POST_Y - POST / 2, POST, POST, `fill="${POCHE}" stroke="${INK}" stroke-width="0.8"`))
  }
  if (label) {
    out.push(
      `<line x1="${n(X(0))}" y1="${n(Y(POST_Y))}" x2="${n(X(ROOM_L))}" y2="${n(Y(POST_Y))}" stroke="${STRUCT}" stroke-width="0.6" stroke-dasharray="10 4 2 4" opacity="0.55"/>`
    )
  }
  return out.join('\n')
}

/* -------------------------------------------------------------- dimension --- */

function dimH(x1, x2, py, label, {color = DIM} = {}) {
  const a = X(x1)
  const b = X(x2)
  const out = [
    `<line x1="${n(a)}" y1="${n(py)}" x2="${n(b)}" y2="${n(py)}" stroke="${color}" stroke-width="0.8"/>`,
  ]
  for (const px of [a, b]) {
    out.push(`<line x1="${n(px - 4)}" y1="${n(py + 4)}" x2="${n(px + 4)}" y2="${n(py - 4)}" stroke="${color}" stroke-width="0.9"/>`)
  }
  out.push(rect((a + b) / 2 - 30, py - 8, 60, 12, `fill="${PAPER}"`))
  out.push(text((a + b) / 2, py + 2, label, {size: 10.5, fill: color, anchor: 'middle'}))
  return out.join('\n')
}

function dimV(y1, y2, px, label, {color = DIM} = {}) {
  const a = Y(y1)
  const b = Y(y2)
  const out = [
    `<line x1="${n(px)}" y1="${n(a)}" x2="${n(px)}" y2="${n(b)}" stroke="${color}" stroke-width="0.8"/>`,
  ]
  for (const py of [a, b]) {
    out.push(`<line x1="${n(px - 4)}" y1="${n(py + 4)}" x2="${n(px + 4)}" y2="${n(py - 4)}" stroke="${color}" stroke-width="0.9"/>`)
  }
  const mid = (a + b) / 2
  out.push(
    `<g transform="translate(${n(px)} ${n(mid)}) rotate(-90)">${rect(-30, -8, 60, 12, `fill="${PAPER}"`)}${text(0, 2, label, {size: 10.5, fill: color, anchor: 'middle'})}</g>`
  )
  return out.join('\n')
}

/* ---------------------------------------------------------------- people ---- */

/** Plan symbol for a standing or seated person: shoulders plus head. */
function person(cx, cy, {r = 0.72} = {}) {
  return [
    `<circle cx="${n(X(cx))}" cy="${n(Y(cy))}" r="${n(S(r))}" fill="${BODY}" stroke="${BODY_EDGE}" stroke-width="0.9"/>`,
    `<circle cx="${n(X(cx))}" cy="${n(Y(cy))}" r="${n(S(r * 0.42))}" fill="${HEAD}"/>`,
  ].join('')
}

function chair(cx, cy, w = 1.5, d = 1.6) {
  return [
    room(cx - w / 2, cy, w, d, `fill="${CHAIR}" stroke="${CHAIR_EDGE}" stroke-width="0.8" rx="${n(S(0.12))}"`),
    room(cx - w / 2, cy + d - 0.2, w, 0.2, `fill="${CHAIR_EDGE}"`),
  ].join('')
}

function cushion(cx, cy, w = 2, d = 1.9) {
  return room(cx - w / 2, cy - d / 2, w, d, `fill="${CUSHION}" stroke="${CUSHION_EDGE}" stroke-width="0.8" rx="${n(S(0.18))}"`)
}

/** Twin mattress in plan. Outline only unless a pillow end is requested. */
function mattress(x, y, w = TWIN_L, d = TWIN_W, {pillow = false} = {}) {
  const out = [room(x, y, w, d, `fill="${MATTRESS}" stroke="${MATTRESS_EDGE}" stroke-width="1" rx="${n(S(0.2))}"`)]
  if (pillow) {
    out.push(room(x + 0.25, y + 0.3, 1.7, d - 0.6, `fill="${PILLOW}" stroke="${MATTRESS_EDGE}" stroke-width="0.7" rx="${n(S(0.15))}"`))
  }
  return out.join('')
}

/* ------------------------------------------------------------ page chrome --- */

function titleBlock({sheet, title, subtitle, right}) {
  const out = [
    rect(0, 0, CANVAS_W, CANVAS_H, `fill="${PAPER}"`),
    `<line x1="60" y1="96" x2="${CANVAS_W - 60}" y2="96" stroke="${INK}" stroke-width="1.4"/>`,
    text(60, 46, title, {size: 22, weight: 600, spacing: 0.4}),
    text(60, 72, subtitle, {size: 12, fill: NOTE}),
    text(CANVAS_W - 60, 46, sheet, {size: 22, weight: 600, fill: STRUCT, anchor: 'end'}),
  ]
  right.forEach((line, i) => {
    out.push(text(CANVAS_W - 60, 60 + i * 14, line, {size: 10.5, fill: NOTE, anchor: 'end'}))
  })
  return out.join('\n')
}

function scaleBar(px, py) {
  const out = [text(px, py - 8, 'SCALE', {size: 9, fill: NOTE, spacing: 1.2})]
  for (let i = 0; i < 4; i += 1) {
    out.push(rect(px + i * S(5), py, S(5), 7, `fill="${i % 2 ? PAPER : INK}" stroke="${INK}" stroke-width="0.7"`))
  }
  for (let i = 0; i <= 4; i += 1) {
    out.push(text(px + i * S(5), py + 20, String(i * 5), {size: 9, fill: NOTE, anchor: 'middle'}))
  }
  out.push(text(px + S(20) + 12, py + 20, 'FEET', {size: 9, fill: NOTE}))
  return out.join('\n')
}

function northArrow(px, py) {
  return [
    `<circle cx="${px}" cy="${py}" r="17" fill="none" stroke="${NOTE}" stroke-width="0.9"/>`,
    `<path d="M ${px} ${py - 13} L ${px + 6} ${py + 11} L ${px} ${py + 6} L ${px - 6} ${py + 11} Z" fill="${INK}"/>`,
    text(px, py - 21, 'N', {size: 10, fill: NOTE, anchor: 'middle', weight: 600}),
  ].join('')
}

/** Two-column legend / notes block beneath the plan. */
function legend(px, py, columns) {
  const out = []
  columns.forEach((col, ci) => {
    const cx = px + ci * 300
    out.push(text(cx, py, col.heading, {size: 10, weight: 600, spacing: 1.1, fill: INK}))
    col.rows.forEach((row, ri) => {
      const ry = py + 20 + ri * 17
      if (row.swatch) {
        out.push(rect(cx, ry - 8, 13, 10, `fill="${row.swatch}" stroke="${row.edge || INK}" stroke-width="0.7"`))
        out.push(text(cx + 20, ry, row.label, {size: 10.5, fill: NOTE}))
      } else {
        out.push(text(cx, ry, row.label, {size: 10.5, fill: row.strong ? INK : NOTE, weight: row.strong ? 600 : 400}))
      }
    })
  })
  return out.join('\n')
}

function zone(x, y, w, h, label, {fill = CIRC, edge = CIRC_EDGE, size = 10} = {}) {
  const out = [room(x, y, w, h, `fill="${fill}" fill-opacity="0.5" stroke="${edge}" stroke-width="0.8" stroke-dasharray="5 3"`)]
  if (label) {
    out.push(text(X(x + w / 2), Y(y + h / 2) + 3.5, label, {size, fill: NOTE, anchor: 'middle', spacing: 0.9}))
  }
  return out.join('\n')
}

/* ------------------------------------------------------------ sheet A-101 --- */

function planBase() {
  const bayEdges = [0, ...POST_XS, ROOM_L]
  const parts = [
    titleBlock({
      sheet: 'A-101',
      title: 'BARN HALL — EXISTING SHELL',
      subtitle: 'Floor plan, dimensions and structural bays',
      right: ['45\'-0" x 20\'-0" clear = 900 SQ FT', 'Scale 1/4" = 1\'-0" at 22 px/ft', 'Dimensions are to interior finish face'],
    }),
    grid(true),
    walls(),
    posts(),
  ]

  // Overall and bay dimensions.
  parts.push(dimH(0, ROOM_L, Y(ROOM_W) + 74, `${feet(ROOM_L)}  OVERALL`))
  for (let i = 0; i < bayEdges.length - 1; i += 1) {
    parts.push(dimH(bayEdges[i], bayEdges[i + 1], Y(ROOM_W) + 44, feet(bayEdges[i + 1] - bayEdges[i])))
  }
  parts.push(dimV(0, ROOM_W, X(ROOM_L) + 62, `${feet(ROOM_W)}  OVERALL`))
  parts.push(dimV(0, POST_Y, X(0) - 44, feet(POST_Y)))
  parts.push(dimV(POST_Y, ROOM_W, X(0) - 44, feet(ROOM_W - POST_Y)))
  parts.push(dimH(WINDOW_XS[0], WINDOW_XS[1], Y(0) - 34, feet(WINDOW_XS[1] - WINDOW_XS[0])))

  // Callouts.
  parts.push(text(X(22.5), Y(4.4), '900 SQ FT CLEAR FLOOR AREA', {size: 13, weight: 600, anchor: 'middle', spacing: 1.4, fill: INK}))
  parts.push(text(X(22.5), Y(6.0), 'DARK HARDWOOD, LEVEL THROUGHOUT', {size: 10, anchor: 'middle', spacing: 1, fill: NOTE}))
  parts.push(text(X(22.5), Y(15.4), '3 CENTERLINE POSTS — 8" x 8" AT 11\'-3" O.C.', {size: 10, anchor: 'middle', spacing: 1, fill: STRUCT}))
  parts.push(text(X(ENTRY_W / 2 + 0.6), Y(POST_Y) - S(3.6), `ENTRY ${feet(ENTRY_W)}`, {size: 10, fill: STRUCT, weight: 600}))
  parts.push(text(X(ROOM_L - 1.1), Y(ROOM_W / 2), 'MIRROR WALL', {size: 10, fill: MIRROR_EDGE, weight: 600, anchor: 'middle', spacing: 1}))
  parts.push(text(X(15.5), Y(0) - 14, "7 WINDOWS PER LONG WALL, 3'-0\" WIDE", {size: 10, fill: NOTE, anchor: 'middle'}))

  const ly = Y(ROOM_W) + 122
  parts.push(
    legend(60, ly, [
      {
        heading: 'SHELL',
        rows: [
          {swatch: POCHE, label: 'Exterior wall / timber post'},
          {swatch: PAPER, edge: INK, label: 'Window opening, 3\'-0" wide'},
          {label: 'Four structural bays at 11\'-3" on centre'},
          {label: 'Single 6\'-0" entry; east gable is a mirror wall'},
        ],
      },
      {
        heading: 'AREA',
        rows: [
          {label: 'Gross clear floor: 900 sq ft', strong: true},
          {label: 'Standing / reception at 5 sq ft per person: 180'},
          {label: 'Chairs only at 7 sq ft per person: 128'},
          {label: 'Tables + seating at 15 sq ft per person: 60'},
        ],
      },
      {
        heading: 'NOTES',
        rows: [
          {label: 'Post count and spacing scaled from photograph —'},
          {label: 'field-verify before ordering or committing to a layout.'},
          {label: 'Roof pitch is unwrapped timber; mylar stops at the'},
          {label: 'horizontal tie-beam level on walls and posts.'},
        ],
      },
    ])
  )
  parts.push(scaleBar(60, ly + 116))
  parts.push(northArrow(CANVAS_W - 90, ly + 96))
  return parts.join('\n')
}

/* ------------------------------------------------------------ sheet A-102 --- */

const SEAT_W = 1.5
const SEAT_D = 1.6
const ROW_YS = [3.5, 6.5, 12.35, 15.35]
const CROSS_BAND = [ROW_YS[1] + SEAT_D, ROW_YS[2]]
const BLOCKS = [
  [4.5, 13.5],
  [18, 27],
  [31.5, 40.5],
]
const AISLES = [
  [0, 4.5],
  [13.5, 18],
  [27, 31.5],
  [40.5, 45],
]
const ACCESSIBLE = [6.5, 22.5, 38.5]

function planOccupants() {
  const parts = [
    titleBlock({
      sheet: 'A-102',
      title: 'BARN HALL — MAXIMUM OCCUPANT LOAD',
      subtitle: 'Assembly seating for 75 — the permitted ceiling for this room',
      right: ['72 CHAIRS + 3 ACCESSIBLE = 75 OCCUPANTS', '12 sq ft per person at 900 sq ft', 'Chairs face the north focal wall'],
    }),
    grid(false),
    walls(),
  ]

  // Circulation zones drawn under the furniture.
  parts.push(zone(0, 0, ROOM_L, 3.5, '', {fill: '#efe4d6', edge: '#c8ab8a'}))
  parts.push(zone(0, 17, ROOM_L, 3, '', {fill: CIRC, edge: CIRC_EDGE}))
  for (const [a, b] of AISLES) {
    parts.push(zone(a, 3.5, b - a, 13.5, '', {fill: CIRC, edge: CIRC_EDGE}))
  }
  // Cross band between the two seating pairs; holds the posts.
  parts.push(zone(4.5, CROSS_BAND[0], 36, CROSS_BAND[1] - CROSS_BAND[0], '', {fill: CIRC, edge: CIRC_EDGE}))
  parts.push(text(X(22.5), Y(1.25), 'FOCAL / PRESENTATION ZONE', {size: 11, fill: NOTE, anchor: 'middle', spacing: 1.1}))
  parts.push(text(X(14.5), Y(18.6), 'REAR CIRCULATION', {size: 10, fill: NOTE, anchor: 'middle', spacing: 1}))
  parts.push(text(X(30.5), Y(18.6), 'REAR CIRCULATION', {size: 10, fill: NOTE, anchor: 'middle', spacing: 1}))

  let seats = 0
  for (const ry of ROW_YS) {
    for (const [a, b] of BLOCKS) {
      const count = Math.round((b - a) / SEAT_W)
      for (let i = 0; i < count; i += 1) {
        const cx = a + SEAT_W * (i + 0.5)
        parts.push(chair(cx, ry, SEAT_W, SEAT_D))
        parts.push(person(cx, ry + SEAT_D * 0.5, {r: 0.62}))
        seats += 1
      }
    }
  }
  if (seats !== 72) throw new Error(`expected 72 chairs, laid out ${seats}`)

  parts.push(posts())

  // Accessible seating spaces, 4'-0" x 2'-6" each.
  for (const ax of ACCESSIBLE) {
    parts.push(room(ax - 2, 17.25, 4, 2.5, `fill="none" stroke="${STRUCT}" stroke-width="1.1" stroke-dasharray="4 3"`))
    parts.push(person(ax, 18.5, {r: 0.62}))
    parts.push(text(X(ax), Y(17.25) - 5, 'ACCESSIBLE', {size: 8.5, fill: STRUCT, anchor: 'middle', spacing: 0.6}))
  }

  // Aisle and row dimensions.
  parts.push(dimH(0, ROOM_L, Y(ROOM_W) + 74, `${feet(ROOM_L)}  OVERALL`))
  parts.push(dimH(AISLES[0][0], AISLES[0][1], Y(ROOM_W) + 44, `${feet(4.5)} AISLE`))
  parts.push(dimH(BLOCKS[0][0], BLOCKS[0][1], Y(ROOM_W) + 44, '6 SEATS'))
  parts.push(dimH(AISLES[1][0], AISLES[1][1], Y(ROOM_W) + 44, feet(4.5)))
  parts.push(dimH(BLOCKS[1][0], BLOCKS[1][1], Y(ROOM_W) + 44, '6 SEATS'))
  parts.push(dimH(AISLES[2][0], AISLES[2][1], Y(ROOM_W) + 44, feet(4.5)))
  parts.push(dimH(BLOCKS[2][0], BLOCKS[2][1], Y(ROOM_W) + 44, '6 SEATS'))
  parts.push(dimH(AISLES[3][0], AISLES[3][1], Y(ROOM_W) + 44, `${feet(4.5)} AISLE`))
  parts.push(dimV(0, 3.5, X(0) - 44, feet(3.5)))
  parts.push(dimV(CROSS_BAND[0], CROSS_BAND[1], X(0) - 44, `${feet(CROSS_BAND[1] - CROSS_BAND[0])} CROSS`))
  parts.push(dimV(17, 20, X(0) - 44, feet(3)))
  parts.push(dimV(0, ROOM_W, X(ROOM_L) + 62, `${feet(ROOM_W)}  OVERALL`))

  parts.push(text(X(22.5), Y(11.2), 'CROSS CIRCULATION — POSTS FALL IN THIS BAND', {size: 10, fill: STRUCT, anchor: 'middle', spacing: 1}))
  parts.push(text(X(22.5), Y(2.7), '75 OCCUPANTS AT MAXIMUM', {size: 14, weight: 600, anchor: 'middle', spacing: 1.6, fill: INK}))

  const ly = Y(ROOM_W) + 122
  parts.push(
    legend(60, ly, [
      {
        heading: 'COUNT',
        rows: [
          {label: '4 rows x 18 chairs = 72 seats', strong: true},
          {label: '3 accessible + companion spaces = 3'},
          {label: 'Total 75 occupants = permitted maximum', strong: true},
          {label: '900 sq ft / 75 = 12 sq ft per person'},
        ],
      },
      {
        heading: 'CLEARANCES',
        rows: [
          {swatch: CIRC, edge: CIRC_EDGE, label: 'Circulation, kept clear of furniture'},
          {swatch: CHAIR, edge: CHAIR_EDGE, label: 'Folding chair, 18" x 19"'},
          {label: 'Four 4\'-6" aisles run to the single west entry'},
          {label: '6 seats per block — well under the 14-seat limit'},
        ],
      },
      {
        heading: 'NOTES',
        rows: [
          {label: 'Rows sit clear of the posts: the centerline falls'},
          {label: 'inside the 4\'-3" cross band, so no chair is blocked.'},
          {label: 'Clear width past each post narrows to ~1\'-7", so the'},
          {label: 'cross band is row access only — egress is the side aisles.'},
        ],
      },
    ])
  )
  parts.push(scaleBar(60, ly + 116))
  parts.push(northArrow(CANVAS_W - 90, ly + 96))
  return parts.join('\n')
}

/* ------------------------------------------------------------ sheet A-103 --- */

const AISLE_N = 2.5
const CUSHION_D = 2.25
const TABLE_W = 2.5
const BAND_TOP = AISLE_N
const TABLE_A = [BAND_TOP + CUSHION_D, BAND_TOP + CUSHION_D + TABLE_W]
const TABLE_B = [ROOM_W - AISLE_N - CUSHION_D - TABLE_W, ROOM_W - AISLE_N - CUSHION_D]
const SEGMENTS = [
  [4, 20.5],
  [24.5, 41],
]
const SEATS_PER_SIDE = 7

/** Nudge a cushion clear of a centerline post without colliding with neighbours. */
function dodgePosts(cx, active) {
  if (!active) return cx
  let out = cx
  for (const px of POST_XS) {
    const dx = out - px
    if (Math.abs(dx) < 1.25) {
      const shift = Math.min(1.25 - Math.abs(dx), 0.45)
      out += Math.sign(dx || 1) * shift
    }
  }
  return out
}

function planLowTables() {
  const parts = [
    titleBlock({
      sheet: 'A-103',
      title: 'BARN HALL — LOW TABLE FLOOR DINING',
      subtitle: 'Communal low tables with floor cushions, seated for 56',
      right: ['56 CUSHIONS AT 2 LONG TABLE RUNS', '16 sq ft per person at 900 sq ft', 'Well inside the 75-person cap'],
    }),
    grid(false),
    walls(),
  ]

  parts.push(zone(0, 0, ROOM_L, AISLE_N, '', {fill: CIRC, edge: CIRC_EDGE}))
  parts.push(zone(0, ROOM_W - AISLE_N, ROOM_L, AISLE_N, '', {fill: CIRC, edge: CIRC_EDGE}))
  parts.push(zone(0, AISLE_N, SEGMENTS[0][0], ROOM_W - 2 * AISLE_N, 'SERVICE', {fill: CIRC, edge: CIRC_EDGE, size: 9}))
  parts.push(zone(SEGMENTS[1][1], AISLE_N, ROOM_L - SEGMENTS[1][1], ROOM_W - 2 * AISLE_N, 'SERVICE', {fill: CIRC, edge: CIRC_EDGE, size: 9}))
  parts.push(zone(SEGMENTS[0][1], AISLE_N, SEGMENTS[1][0] - SEGMENTS[0][1], ROOM_W - 2 * AISLE_N, '', {fill: CIRC, edge: CIRC_EDGE}))

  let seated = 0
  for (const [tTop, tBot] of [TABLE_A, TABLE_B]) {
    for (const [segA, segB] of SEGMENTS) {
      parts.push(
        room(segA, tTop, segB - segA, tBot - tTop, `fill="${TABLE}" stroke="${TABLE_EDGE}" stroke-width="1" rx="${n(S(0.12))}"`)
      )
      parts.push(
        `<line x1="${n(X(segA))}" y1="${n(Y((tTop + tBot) / 2))}" x2="${n(X(segB))}" y2="${n(Y((tTop + tBot) / 2))}" stroke="${TABLE_EDGE}" stroke-width="0.6" opacity="0.6"/>`
      )

      const spacing = (segB - segA) / SEATS_PER_SIDE
      for (let i = 0; i < SEATS_PER_SIDE; i += 1) {
        const base = segA + spacing * (i + 0.5)
        const outerY = tTop - CUSHION_D / 2
        const innerY = tBot + CUSHION_D / 2
        // Only the cushion row facing the post band needs to dodge; for the
        // north run that is the row below the table, for the south run above it.
        const outerIsInner = tTop > POST_Y
        const outerX = dodgePosts(base, outerIsInner)
        const innerX = dodgePosts(base, !outerIsInner)

        parts.push(cushion(outerX, outerY))
        parts.push(person(outerX, outerY, {r: 0.7}))
        parts.push(cushion(innerX, innerY))
        parts.push(person(innerX, innerY, {r: 0.7}))
        seated += 2
      }
    }
  }
  if (seated !== 56) throw new Error(`expected 56 cushions, laid out ${seated}`)

  parts.push(posts())

  parts.push(dimH(0, ROOM_L, Y(ROOM_W) + 74, `${feet(ROOM_L)}  OVERALL`))
  parts.push(dimH(0, SEGMENTS[0][0], Y(ROOM_W) + 44, feet(SEGMENTS[0][0])))
  parts.push(dimH(SEGMENTS[0][0], SEGMENTS[0][1], Y(ROOM_W) + 44, `${feet(SEGMENTS[0][1] - SEGMENTS[0][0])} TABLE RUN`))
  parts.push(dimH(SEGMENTS[0][1], SEGMENTS[1][0], Y(ROOM_W) + 44, feet(SEGMENTS[1][0] - SEGMENTS[0][1])))
  parts.push(dimH(SEGMENTS[1][0], SEGMENTS[1][1], Y(ROOM_W) + 44, `${feet(SEGMENTS[1][1] - SEGMENTS[1][0])} TABLE RUN`))
  parts.push(dimH(SEGMENTS[1][1], ROOM_L, Y(ROOM_W) + 44, feet(ROOM_L - SEGMENTS[1][1])))

  const dimX = X(0) - 44
  parts.push(dimV(0, AISLE_N, dimX, feet(AISLE_N)))
  parts.push(dimV(AISLE_N, TABLE_A[0], dimX, feet(CUSHION_D)))
  parts.push(dimV(TABLE_A[0], TABLE_A[1], dimX, feet(TABLE_W)))
  parts.push(dimV(TABLE_A[1], TABLE_A[1] + CUSHION_D, dimX, feet(CUSHION_D)))
  parts.push(dimV(TABLE_B[0] - CUSHION_D, TABLE_B[0], dimX, feet(CUSHION_D)))
  parts.push(dimV(TABLE_B[0], TABLE_B[1], dimX, feet(TABLE_W)))
  parts.push(dimV(TABLE_B[1], TABLE_B[1] + CUSHION_D, dimX, feet(CUSHION_D)))
  parts.push(dimV(ROOM_W - AISLE_N, ROOM_W, dimX, feet(AISLE_N)))
  parts.push(dimV(0, ROOM_W, X(ROOM_L) + 62, `${feet(ROOM_W)}  OVERALL`))

  parts.push(
    text(X(SEGMENTS[1][0] + 0.7), Y(POST_Y) + 3.5, `${feet(1)} POST BAND`, {
      size: 9,
      fill: STRUCT,
      anchor: 'start',
      spacing: 0.7,
    })
  )
  parts.push(
    text(X(SEGMENTS[0][0] + (SEGMENTS[0][1] - SEGMENTS[0][0]) / 2), Y((TABLE_A[0] + TABLE_A[1]) / 2) + 3.5, '7 PER SIDE', {
      size: 9.5,
      fill: '#f6ead8',
      anchor: 'middle',
      spacing: 1,
    })
  )
  parts.push(
    text(X(SEGMENTS[1][0] + (SEGMENTS[1][1] - SEGMENTS[1][0]) / 2), Y((TABLE_A[0] + TABLE_A[1]) / 2) + 3.5, '7 PER SIDE', {
      size: 9.5,
      fill: '#f6ead8',
      anchor: 'middle',
      spacing: 1,
    })
  )
  parts.push(
    text(X(SEGMENTS[0][0] + (SEGMENTS[0][1] - SEGMENTS[0][0]) / 2), Y((TABLE_B[0] + TABLE_B[1]) / 2) + 3.5, '7 PER SIDE', {
      size: 9.5,
      fill: '#f6ead8',
      anchor: 'middle',
      spacing: 1,
    })
  )
  parts.push(
    text(X(SEGMENTS[1][0] + (SEGMENTS[1][1] - SEGMENTS[1][0]) / 2), Y((TABLE_B[0] + TABLE_B[1]) / 2) + 3.5, '7 PER SIDE', {
      size: 9.5,
      fill: '#f6ead8',
      anchor: 'middle',
      spacing: 1,
    })
  )
  parts.push(text(X(22.5), Y(19.3), '56 SEATED AT LOW TABLES', {size: 13, weight: 600, anchor: 'middle', spacing: 1.5, fill: INK}))

  const ly = Y(ROOM_W) + 122
  parts.push(
    legend(60, ly, [
      {
        heading: 'COUNT',
        rows: [
          {label: '2 table rows x 2 runs x 14 = 56 diners', strong: true},
          {label: '7 cushions per side of each 16\'-6" run'},
          {label: '28" of table edge per person'},
          {label: '900 sq ft / 56 = 16 sq ft per person'},
        ],
      },
      {
        heading: 'FURNITURE',
        rows: [
          {swatch: TABLE, edge: TABLE_EDGE, label: 'Low table, 30" wide x 16\'-6" long, 12" high'},
          {swatch: CUSHION, edge: CUSHION_EDGE, label: 'Floor cushion, 24" x 23"'},
          {swatch: CIRC, edge: CIRC_EDGE, label: 'Service aisle, 2\'-6" at both long walls'},
          {label: 'Cross passage 4\'-0" at mid-length'},
        ],
      },
      {
        heading: 'NOTES',
        rows: [
          {label: 'Cushion depth 2\'-3" suits cross-legged seating.'},
          {label: 'Inner cushions shift up to 6" so the centerline posts'},
          {label: 'land between diners rather than behind a back.'},
          {label: 'Service reaches every seat from the perimeter aisles.'},
        ],
      },
    ])
  )
  parts.push(scaleBar(60, ly + 116))
  parts.push(northArrow(CANVAS_W - 90, ly + 96))
  return parts.join('\n')
}

/* ------------------------------------------------------------ sheet A-104 --- */

const MATTRESS_XS = [4, 14.25, 24.5, 34.75]

function planSleeping() {
  const faceN = PANEL_DEPTH
  const faceS = ROOM_W - PANEL_DEPTH - TWIN_W
  const clearW = ROOM_W - 2 * PANEL_DEPTH
  const aisle = clearW - 2 * TWIN_W

  const parts = [
    titleBlock({
      sheet: 'A-104',
      title: 'BARN HALL — MYLAR PANELS + SLEEPING LAYOUT',
      subtitle: 'Panel build-out depth and 8 twin mattresses along the long walls',
      right: [
        '8 TWIN MATTRESSES, 38" x 75"',
        'Panels project 2 1/2" off each long wall',
        'East gable is a full-width mirror, no exit',
      ],
    }),
    grid(false),
    walls(),
    panelBand(),
  ]

  // Center circulation.
  parts.push(zone(0, faceN + TWIN_W, ROOM_L, aisle, '', {fill: CIRC, edge: CIRC_EDGE}))

  let beds = 0
  for (const mx of MATTRESS_XS) {
    parts.push(mattress(mx, faceN))
    parts.push(mattress(mx, faceS))
    beds += 2
  }
  if (beds !== 8) throw new Error(`expected 8 mattresses, laid out ${beds}`)

  parts.push(posts())

  // Dimensions.
  parts.push(dimH(0, ROOM_L, Y(ROOM_W) + 74, `${feet(ROOM_L)}  OVERALL`))
  parts.push(dimH(0, MATTRESS_XS[0], Y(ROOM_W) + 44, feet(MATTRESS_XS[0])))
  parts.push(dimH(MATTRESS_XS[0], MATTRESS_XS[0] + TWIN_L, Y(ROOM_W) + 44, feet(TWIN_L)))
  parts.push(dimH(MATTRESS_XS[0] + TWIN_L, MATTRESS_XS[1], Y(ROOM_W) + 44, feet(MATTRESS_XS[1] - MATTRESS_XS[0] - TWIN_L)))
  parts.push(dimH(MATTRESS_XS[3] + TWIN_L, ROOM_L, Y(ROOM_W) + 44, feet(ROOM_L - MATTRESS_XS[3] - TWIN_L)))

  const dimX = X(0) - 44
  parts.push(dimV(faceN, faceN + TWIN_W, dimX, feet(TWIN_W)))
  parts.push(dimV(faceN + TWIN_W, faceS, dimX, `${feet(aisle)} AISLE`))
  parts.push(dimV(faceS, faceS + TWIN_W, dimX, feet(TWIN_W)))
  parts.push(dimV(0, ROOM_W, X(ROOM_L) + 62, `${feet(ROOM_W)}  OVERALL`))

  // Panel depth callout with a leader out to clear space.
  const cx = 21
  parts.push(
    `<line x1="${n(X(cx))}" y1="${n(Y(PANEL_DEPTH))}" x2="${n(X(cx + 1.6))}" y2="${n(Y(-1.5))}" stroke="${STRUCT}" stroke-width="0.8"/>`
  )
  parts.push(
    text(X(cx + 1.9), Y(-1.5) + 3.5, `MYLAR PANEL BUILD-OUT — ${feet(PANEL_DEPTH)} (2 1/2") OFF WALL FACE`, {
      size: 10,
      fill: STRUCT,
      weight: 600,
      spacing: 0.6,
    })
  )

  parts.push(text(X(ROOM_L - 1.1), Y(ROOM_W / 2), 'MIRROR WALL', {size: 10, fill: MIRROR_EDGE, weight: 600, anchor: 'middle', spacing: 1}))
  parts.push(text(X(ENTRY_W / 2 + 0.6), Y(POST_Y) - S(3.6), `SOLE EXIT ${feet(ENTRY_W)}`, {size: 10, fill: STRUCT, weight: 600}))
  parts.push(text(X(22.5), Y(7.4), '8 TWIN MATTRESSES', {size: 13, weight: 600, anchor: 'middle', spacing: 1.5, fill: INK}))
  parts.push(text(X(22.5), Y(13.1), `${feet(aisle)} CLEAR CENTER AISLE`, {size: 10, anchor: 'middle', spacing: 1, fill: NOTE}))

  const ly = Y(ROOM_W) + 122
  parts.push(
    legend(60, ly, [
      {
        heading: 'PANELS',
        rows: [
          {swatch: PANEL, edge: PANEL_EDGE, label: '32" sq mylar panel, 2 1/2" deep'},
          {label: '1x2 stretcher frame + z-clip cleat'},
          {label: '3 courses reach 8\'-0"; 48 columns per long wall'},
          {label: `Clear floor now 45'-0" x ${feet(clearW)}`},
        ],
      },
      {
        heading: 'MATTRESSES',
        rows: [
          {swatch: MATTRESS, edge: MATTRESS_EDGE, label: 'Twin mattress, 38" x 75"'},
          {label: '4 per long wall, long axis parallel to wall', strong: true},
          {label: `${feet(MATTRESS_XS[1] - MATTRESS_XS[0] - TWIN_L)} between mattresses`},
          {label: `${feet(aisle)} clear center aisle`},
        ],
      },
      {
        heading: 'EGRESS WARNING',
        rows: [
          {label: 'Removing the east exit leaves ONE way out.', strong: true},
          {label: 'IBC requires 2 exits above 49 occupants, so the'},
          {label: '75-person load on A-102 is no longer permissible.'},
          {label: 'Single 6\'-0" door caps this room near 49 people.'},
        ],
      },
    ])
  )
  parts.push(scaleBar(60, ly + 116))
  parts.push(northArrow(CANVAS_W - 90, ly + 96))
  return parts.join('\n')
}

/* ------------------------------------------------------------ sheet A-105 --- */

// Mattresses turned with the 75" edge running across the room, packed in
// columns off the mirror. Three columns fit between the last beam and the glass.
const BEAM_X = POST_XS[POST_XS.length - 1]
const MIRROR_FACE = ROOM_L - MIRROR_T
const MAT_COLS = 3
const MAT_ROWS = 3

function planMirrorCluster() {
  const clearW = ROOM_W - 2 * PANEL_DEPTH
  const beamFace = BEAM_X + POST / 2
  const bayDepth = MIRROR_FACE - beamFace

  // Column x positions marching west from the mirror, edge to edge.
  const colXs = []
  for (let c = 0; c < MAT_COLS; c += 1) colXs.push(MIRROR_FACE - TWIN_W * (c + 1))
  const padWest = colXs[colXs.length - 1] - beamFace

  // Rows stacked edge to edge, centred on the clear width.
  const bank = MAT_ROWS * TWIN_L
  const yStart = PANEL_DEPTH + (clearW - bank) / 2
  const rowYs = []
  for (let r = 0; r < MAT_ROWS; r += 1) rowYs.push(yStart + r * TWIN_L)

  const platformW = MAT_COLS * TWIN_W
  const matArea = 8 * TWIN_L * TWIN_W
  const openFloor = BEAM_X * clearW

  const parts = [
    titleBlock({
      sheet: 'A-105',
      title: 'BARN HALL — MATTRESS PLATFORM AT MIRROR',
      subtitle: 'All 8 twins packed edge to edge in the bay between the last beam and the mirror',
      right: [
        '8 TWIN MATTRESSES, 38" x 75", NO GAPS',
        `PLATFORM ${feet(platformW)} x ${feet(bank)}`,
        `${Math.round(matArea)} SQ FT OF MATTRESS SURFACE`,
      ],
    }),
    grid(false),
    walls(),
    panelBand(),
  ]

  parts.push(zone(0, PANEL_DEPTH, BEAM_X, clearW, '', {fill: CIRC, edge: CIRC_EDGE}))
  parts.push(zone(BEAM_X, PANEL_DEPTH, ROOM_L - MIRROR_T - BEAM_X, clearW, '', {fill: '#efe4d6', edge: '#c8ab8a'}))

  // Beam line at the last post, marking the west edge of the platform bay.
  parts.push(
    `<line x1="${n(X(BEAM_X))}" y1="${n(Y(0))}" x2="${n(X(BEAM_X))}" y2="${n(Y(ROOM_W))}" stroke="${STRUCT}" stroke-width="1.4" stroke-dasharray="9 4"/>`
  )

  // Fill the 3 x 3 grid, dropping one cell so the count lands on 8.
  let beds = 0
  for (let c = 0; c < MAT_COLS; c += 1) {
    for (let r = 0; r < MAT_ROWS; r += 1) {
      const isDropped = c === MAT_COLS - 1 && r === MAT_ROWS - 1
      if (isDropped) {
        parts.push(
          room(colXs[c], rowYs[r], TWIN_W, TWIN_L, `fill="none" stroke="${STRUCT}" stroke-width="1" stroke-dasharray="5 3"`)
        )
        parts.push(
          `<g transform="translate(${n(X(colXs[c] + TWIN_W / 2))} ${n(Y(rowYs[r] + TWIN_L / 2))}) rotate(-90)">${text(0, 3.5, 'SPARE BAY', {size: 9, fill: STRUCT, anchor: 'middle', spacing: 0.8})}</g>`
        )
        continue
      }
      parts.push(mattress(colXs[c], rowYs[r], TWIN_W, TWIN_L))
      beds += 1
    }
  }
  if (beds !== 8) throw new Error(`expected 8 mattresses, laid out ${beds}`)

  parts.push(posts())

  // Dimensions.
  parts.push(dimH(0, ROOM_L, Y(ROOM_W) + 74, `${feet(ROOM_L)}  OVERALL`))
  parts.push(dimH(0, BEAM_X, Y(ROOM_W) + 44, `${feet(BEAM_X)} OPEN FLOOR`))
  parts.push(dimH(colXs[MAT_COLS - 1], MIRROR_FACE, Y(ROOM_W) + 44, `${feet(platformW)} PLATFORM`))
  parts.push(dimH(beamFace, colXs[MAT_COLS - 1], Y(0) - 34, feet(padWest)))

  // Row dimensions sit on the east side, alongside the platform they describe.
  parts.push(dimV(rowYs[0], rowYs[0] + TWIN_L, X(ROOM_L) + 26, feet(TWIN_L)))
  parts.push(dimV(yStart, yStart + bank, X(ROOM_L) + 58, `${feet(bank)} PLATFORM`))
  parts.push(dimV(0, ROOM_W, X(ROOM_L) + 90, `${feet(ROOM_W)}  OVERALL`))

  parts.push(
    `<g transform="translate(${n(X(ROOM_L - MIRROR_T - 0.35))} ${n(Y(ROOM_W / 2))}) rotate(-90)">${text(0, 0, 'MIRROR WALL', {size: 10, fill: MIRROR_EDGE, weight: 600, anchor: 'middle', spacing: 1})}</g>`
  )
  parts.push(text(X(ENTRY_W / 2 + 0.6), Y(POST_Y) - S(3.6), `SOLE EXIT ${feet(ENTRY_W)}`, {size: 10, fill: STRUCT, weight: 600}))
  parts.push(text(X(BEAM_X - 0.5), Y(1.5), 'BEAM LINE', {size: 9, fill: STRUCT, weight: 600, anchor: 'end', spacing: 0.7}))
  parts.push(text(X(BEAM_X / 2), Y(7.4), 'OPEN FLOOR', {size: 13, weight: 600, anchor: 'middle', spacing: 1.5, fill: INK}))
  parts.push(text(X(BEAM_X / 2), Y(9.1), `${Math.round(openFloor)} SQ FT CLEAR`, {size: 10, anchor: 'middle', spacing: 1, fill: NOTE}))

  const ly = Y(ROOM_W) + 122
  parts.push(
    legend(60, ly, [
      {
        heading: 'PLATFORM',
        rows: [
          {swatch: MATTRESS, edge: MATTRESS_EDGE, label: 'Twin mattress, 38" x 75", outline only'},
          {label: '75" edge runs across the room, 38" edge stacks', strong: true},
          {label: `3 columns x 3 rows, one cell left spare = 8 mats`},
          {label: `Continuous surface ${feet(platformW)} x ${feet(bank)}`},
        ],
      },
      {
        heading: 'BAY FIT',
        rows: [
          {label: `Beam face to mirror: ${feet(bayDepth)} clear`},
          {label: `Platform uses ${feet(platformW)}, leaving ${feet(padWest)} at the beam`},
          {label: `${Math.round(matArea)} sq ft mattress in a ${Math.round(bayDepth * clearW)} sq ft bay = ${Math.round((matArea / (bayDepth * clearW)) * 100)}% covered`},
          {label: 'No mat crosses the beam line or the panel build-out'},
        ],
      },
      {
        heading: 'NOTES',
        rows: [
          {label: 'Zero gaps between mats — reads as one continuous'},
          {label: 'lounging surface rather than separate beds.'},
          {label: 'A 4th column will not fit: it needs 3\'-2" and only'},
          {label: `${feet(padWest)} remains before the beam.`},
        ],
      },
    ])
  )
  parts.push(scaleBar(60, ly + 116))
  parts.push(northArrow(CANVAS_W - 90, ly + 96))
  return parts.join('\n')
}

/* ------------------------------------------------------------------ build --- */

function wrap(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_W}" height="${CANVAS_H}" viewBox="0 0 ${CANVAS_W} ${CANVAS_H}">\n${body}\n</svg>\n`
}

const SHEETS = [
  ['barn-floorplan-base', planBase],
  ['barn-floorplan-75-occupants', planOccupants],
  ['barn-floorplan-low-tables', planLowTables],
  ['barn-floorplan-mattresses', planSleeping],
  ['barn-floorplan-mattresses-mirror', planMirrorCluster],
]

await mkdir(OUTPUT_DIR, {recursive: true})
for (const [name, build] of SHEETS) {
  const svg = wrap(build())
  const svgPath = path.join(OUTPUT_DIR, `${name}.svg`)
  const pngPath = path.join(OUTPUT_DIR, `${name}.png`)
  await writeFile(svgPath, svg, 'utf8')
  await sharp(Buffer.from(svg), {density: 192}).png().toFile(pngPath)
  console.log(`wrote ${path.relative(repoRoot, svgPath)} and ${path.relative(repoRoot, pngPath)}`)
}
