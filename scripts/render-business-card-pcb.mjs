/**
 * Builds the PCB viewer assets for the homepage sidebar.
 *
 * Requires KiCad 9/10 (for kicad-cli) and reads the business-card project that
 * lives outside this repo. Outputs:
 *   assets/pcb/business-card-rev00-pcbnew.svg  - PCB editor facsimile
 *   assets/pcb/business-card-rev00-3d-top.png  - raytraced board render (top)
 *   assets/pcb/business-card-rev00-3d-bottom.png - raytraced board render (bottom)
 *
 * Usage: node scripts/render-business-card-pcb.mjs
 */
import {execFile} from 'node:child_process'
import {mkdir, readFile, writeFile, rm, copyFile} from 'node:fs/promises'
import {existsSync} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {promisify} from 'node:util'
import os from 'node:os'

const run = promisify(execFile)
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const KICAD_CLI_CANDIDATES = [
  'C:/Program Files/KiCad/10.0/bin/kicad-cli.exe',
  'C:/Program Files/KiCad/9.0/bin/kicad-cli.exe',
  '/Applications/KiCad/KiCad.app/Contents/MacOS/kicad-cli',
  'kicad-cli',
]

const PROJECT_DIR = 'C:/Users/Jaden Andrea/Documents/Portfolio/CreativeTech/business-card'
const PROJECT_NAME = 'business-card'
const OUTPUT_DIR = path.join(repoRoot, 'assets', 'pcb')
const SVG_OUTPUT = path.join(OUTPUT_DIR, 'business-card-rev00-pcbnew.svg')
const RENDER_TOP = path.join(OUTPUT_DIR, 'business-card-rev00-3d-top.png')
const RENDER_BOTTOM = path.join(OUTPUT_DIR, 'business-card-rev00-3d-bottom.png')
const COPPER_TONER = path.join(repoRoot, 'scripts', 'tone-pcb-copper.py')

const BOARD_WIDTH = 50.8
const BOARD_HEIGHT = 88.9
const MARGIN_LEFT = 10.1
const MARGIN_RIGHT = 8.0
const MARGIN_TOP = 8.2
const MARGIN_BOTTOM = 7.6

const VIEW_X = -MARGIN_LEFT
const VIEW_Y = -MARGIN_TOP
const VIEW_W = BOARD_WIDTH + MARGIN_LEFT + MARGIN_RIGHT
const VIEW_H = BOARD_HEIGHT + MARGIN_TOP + MARGIN_BOTTOM

// Sampled directly from a KiCad 10 PCB editor screenshot of this board.
const LABEL_COLOR = '#c2c2c2'
const ANCHOR_COLOR = '#ff26e2'
const ZONE_COLOR = '#C83434'
const HAIRLINE_LIMIT = 0.16
const HAIRLINE_PX = 1.1
const ZONE_BAND = 1.016
/** Authored at 180 on the landscape board, carried through its 90 degree rotation. */
const SILK_ROTATION = 270
const FABRICATED_TOP_MASK_COLOR = 'Black'
const FABRICATED_BOTTOM_MASK_COLOR = 'Black'
const FABRICATED_DIELECTRIC_COLOR = 'FR4 natural'

/** Back layers paint first, then footprint anchors, then front layers on top. */
const LAYER_PLAN = [
  {layer: 'B.Courtyard', id: 'b-courtyard', opacity: 1},
  {layer: 'B.Fab', id: 'b-fab', opacity: 1},
  {layer: 'Dwgs.User', id: 'dwgs-user', opacity: 1},
  {layer: 'B.Silkscreen', id: 'b-silkscreen', opacity: 1, hairline: false},
  {layer: 'B.Paste', id: 'b-paste', opacity: 1},
  {layer: '__anchors__', id: 'anchors', opacity: 1},
  {layer: 'B.Mask', id: 'b-mask', opacity: 0.4},
  {layer: 'B.Cu', id: 'b-cu', opacity: 1},
  {layer: 'F.Mask', id: 'f-mask', opacity: 0.4},
  {layer: 'F.Cu', id: 'f-cu', opacity: 0.6},
  {layer: 'Edge.Cuts', id: 'edge-cuts', opacity: 1},
]

function findKicadCli() {
  for (const candidate of KICAD_CLI_CANDIDATES) {
    if (candidate === 'kicad-cli' || existsSync(candidate)) {
      return candidate
    }
  }
  throw new Error('kicad-cli not found; install KiCad or update KICAD_CLI_CANDIDATES.')
}

function parseSexpr(text) {
  let index = 0

  function parseList() {
    const items = []
    index += 1
    while (index < text.length) {
      const char = text[index]
      if (char === '(') {
        items.push(parseList())
      } else if (char === ')') {
        index += 1
        return items
      } else if (char === '"') {
        items.push(parseString())
      } else if (/\s/.test(char)) {
        index += 1
      } else {
        items.push(parseAtom())
      }
    }
    return items
  }

  function parseString() {
    index += 1
    let value = ''
    while (index < text.length && text[index] !== '"') {
      if (text[index] === '\\') {
        index += 1
      }
      value += text[index]
      index += 1
    }
    index += 1
    return value
  }

  function parseAtom() {
    let value = ''
    while (index < text.length && !/[\s()]/.test(text[index])) {
      value += text[index]
      index += 1
    }
    const numeric = Number(value)
    return value !== '' && !Number.isNaN(numeric) ? numeric : value
  }

  while (index < text.length && text[index] !== '(') {
    index += 1
  }
  return parseList()
}

function findAll(node, name, results = []) {
  if (!Array.isArray(node)) {
    return results
  }
  if (node[0] === name) {
    results.push(node)
  }
  for (const child of node) {
    if (Array.isArray(child)) {
      findAll(child, name, results)
    }
  }
  return results
}

function findFirst(node, name) {
  if (!Array.isArray(node)) {
    return undefined
  }
  for (const child of node) {
    if (Array.isArray(child) && child[0] === name) {
      return child
    }
  }
  return undefined
}

/**
 * KiCad never draws a line thinner than one screen pixel, so sub-pixel layers
 * (courtyard, fab, edge cuts) get a non-scaling hairline stroke instead.
 * Silkscreen opts out: its glyph strokes are genuinely 0.15mm, and widening
 * them to a screen pixel fills the letterforms in and merges adjacent lines.
 */
function applyHairlines(markup) {
  return markup.replace(/<(g|path)([^>]*?)style="([^"]*)"/g, (match, tag, attributes, style) => {
    const widthMatch = style.match(/stroke-width:\s*([0-9.]+)/)
    if (!widthMatch || Number(widthMatch[1]) >= HAIRLINE_LIMIT) {
      return match
    }
    const nextStyle = style.replace(/stroke-width:\s*[0-9.]+/, `stroke-width:${HAIRLINE_PX}`)
    return `<${tag}${attributes}vector-effect="non-scaling-stroke" style="${nextStyle}"`
  })
}

async function exportLayerSvg(cli, pcbPath, layer, outFile, hairline = true) {
  await run(cli, [
    'pcb',
    'export',
    'svg',
    '--mode-single',
    '--exclude-drawing-sheet',
    '--page-size-mode',
    '2',
    '--drill-shape-opt',
    '2',
    '--layers',
    layer,
    '-o',
    outFile,
    pcbPath,
  ])
  const raw = await readFile(outFile, 'utf8')
  const start = raw.indexOf('<g style=')
  const end = raw.lastIndexOf('</g>')
  if (start === -1 || end === -1) {
    return ''
  }
  const body = raw.slice(start, end + 4)
  return hairline ? applyHairlines(body) : body
}

function buildZoneHatch(zoneMarkup) {
  const paths = [...zoneMarkup.matchAll(/<path[^>]*?d="([^"]+)"/gs)].map(match => match[1])
  if (paths.length === 0) {
    return ''
  }
  const shapes = paths.map(d => `<path d="${d}"/>`).join('')
  const bands = paths
    .map(d => `<path d="${d}" fill="none" stroke="#ffffff" stroke-width="${ZONE_BAND}"/>`)
    .join('')

  return `<defs>
<pattern id="zone-hatch" width="0.42" height="0.42" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
<line x1="0" y1="0" x2="0" y2="0.42" stroke="${ZONE_COLOR}" stroke-width="0.11"/>
</pattern>
<clipPath id="zone-clip">${shapes}</clipPath>
<mask id="zone-band">${bands}</mask>
</defs>
<g opacity="0.6" clip-path="url(#zone-clip)" mask="url(#zone-band)">
<rect x="${VIEW_X}" y="${VIEW_Y}" width="${VIEW_W}" height="${VIEW_H}" fill="url(#zone-hatch)"/>
</g>`
}

function rotatePoint(x, y, degrees) {
  const radians = (degrees * Math.PI) / 180
  return [x * Math.cos(radians) - y * Math.sin(radians), x * Math.sin(radians) + y * Math.cos(radians)]
}

function boardBounds(pcb) {
  const edgeItems = [...findAll(pcb, 'gr_line'), ...findAll(pcb, 'gr_arc')].filter(
    item => findFirst(item, 'layer')?.[1] === 'Edge.Cuts'
  )
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const item of edgeItems) {
    for (const key of ['start', 'end', 'mid']) {
      const point = findFirst(item, key)
      if (point) {
        minX = Math.min(minX, point[1])
        minY = Math.min(minY, point[2])
        maxX = Math.max(maxX, point[1])
        maxY = Math.max(maxY, point[2])
      }
    }
  }
  return {minX, minY, maxX, maxY}
}

function boardOrigin(pcb) {
  const {minX, minY} = boardBounds(pcb)
  return {minX, minY}
}

function buildAnchors(pcb) {
  const {minX, minY} = boardOrigin(pcb)
  const arms = []
  for (const footprint of findAll(pcb, 'footprint')) {
    const at = findFirst(footprint, 'at')
    if (!at) continue
    const x = at[1] - minX
    const y = at[2] - minY
    const arm = 0.85
    arms.push(
      `<path d="M${(x - arm).toFixed(3)} ${y.toFixed(3)}H${(x + arm).toFixed(3)}M${x.toFixed(3)} ${(
        y - arm
      ).toFixed(3)}V${(y + arm).toFixed(3)}" stroke="${ANCHOR_COLOR}" stroke-width="1.1" fill="none" vector-effect="non-scaling-stroke"/>`
    )
  }
  return arms.join('\n')
}

function buildPadLabels(pcb) {
  const {minX, minY} = boardOrigin(pcb)
  const labels = []
  for (const footprint of findAll(pcb, 'footprint')) {
    const footprintAt = findFirst(footprint, 'at')
    const rotation = footprintAt?.[3] ?? 0

    for (const pad of findAll(footprint, 'pad')) {
      const padAt = findFirst(pad, 'at')
      const size = findFirst(pad, 'size')
      if (!padAt || !size) continue

      const shortSide = Math.min(size[1], size[2])
      // KiCad omits pad text that cannot fit inside the pad.
      if (shortSide < 4) continue

      const [localX, localY] = rotatePoint(padAt[1], padAt[2], rotation)
      const x = footprintAt[1] + localX - minX
      const y = footprintAt[2] + localY - minY
      const netName = findFirst(pad, 'net')?.[2] ?? ''
      const font = "font-family=\"'DejaVu Sans Mono','Consolas','Courier New',monospace\""

      // Text metrics measured off a KiCad screenshot of this board: large pads
      // centre the pad number and drop the net name a quarter pad below it,
      // small pads lift the number and tuck a hairline net name underneath.
      const isLargePad = shortSide >= 10
      const numberSize = Math.min(shortSide * 0.48, 4.9)
      const netSize = Math.min(shortSide * 0.16, 1.7)
      const numberCenterY = y - (isLargePad ? 0 : shortSide * 0.26)
      const netCenterY = y + shortSide * (isLargePad ? 0.25 : 0.12)
      const capOffset = size => (size * 0.72) / 2

      labels.push(
        `<text x="${x.toFixed(2)}" y="${(numberCenterY + capOffset(numberSize)).toFixed(
          2
        )}" font-size="${numberSize.toFixed(2)}" fill="${LABEL_COLOR}" text-anchor="middle" ${font}>${
          pad[1]
        }</text>`
      )
      if (netName) {
        labels.push(
          `<text x="${x.toFixed(2)}" y="${(netCenterY + capOffset(netSize)).toFixed(
            2
          )}" font-size="${netSize.toFixed(2)}" fill="${LABEL_COLOR}" text-anchor="middle" ${font}>${netName}</text>`
        )
      }
    }
  }
  return labels.join('\n')
}

/**
 * Remove a top-level board item by UUID without changing the source KiCad
 * project. The website render uses a temporary fabrication preview only.
 */
function removeItemByUuid(source, uuid) {
  const uuidIndex = source.indexOf(`(uuid "${uuid}")`)
  if (uuidIndex === -1) {
    throw new Error(`PCB item ${uuid} was not found`)
  }

  const itemStart = source.lastIndexOf('\n\t(', uuidIndex)
  let depth = 0
  let inString = false
  let escaped = false

  for (let index = itemStart + 1; index < source.length; index += 1) {
    const char = source[index]
    if (inString) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === '"') inString = false
      continue
    }
    if (char === '"') inString = true
    else if (char === '(') depth += 1
    else if (char === ')') {
      depth -= 1
      if (depth === 0) {
        return `${source.slice(0, itemStart)}${source.slice(index + 1)}`
      }
    }
  }

  throw new Error(`PCB item ${uuid} was not balanced`)
}

function buildBackCopperMaskOpenings(source) {
  const pcb = parseSexpr(source)
  return findAll(pcb, 'segment')
    .filter(segment => findFirst(segment, 'layer')?.[1] === 'B.Cu')
    .map((segment, index) => {
      const start = findFirst(segment, 'start')
      const end = findFirst(segment, 'end')
      const width = findFirst(segment, 'width')?.[1] ?? 0.25
      const uuidSuffix = String(index + 1).padStart(12, '0')
      return `	(gr_line
		(start ${start[1]} ${start[2]})
		(end ${end[1]} ${end[2]})
		(stroke (width ${(width + 0.12).toFixed(3)}) (type solid))
		(layer "B.Mask")
		(uuid "10000000-0000-4000-8000-${uuidSuffix}")
	)`
    })
    .join('\n')
}

/**
 * Make a render-only board variant that matches the fabricated card:
 * black mask on both faces, bright exposed copper, and a keyhole left as bare
 * translucent FR-4 so light can pass through it.
 */
function prepareFabricatedBoard(source) {
  const pcb = parseSexpr(source)
  const {minX, maxY} = boardBounds(pcb)
  // The card was authored landscape with its outline at the origin, then the
  // outline and every footprint were rotated 90 degrees counter-clockwise and
  // moved to (minX, maxY) -- but the silkscreen was left behind at its
  // pre-rotation coordinates, which is why it lands off the board. Replaying
  // that same transform drops each label exactly where it was drawn, keeping
  // the flush-left block the layout was designed around. Checked against the
  // pre-rotation backup, this reproduces all six footprints to 0.0000mm.
  const place = (x, y) => `${(y + minX).toFixed(3)} ${(maxY - x).toFixed(3)}`

  let result = source
    .replace(/\r\n/g, '\n')
    .replace(
      '(type "Top Solder Mask")\n\t\t\t\t(thickness 0.01)',
      `(type "Top Solder Mask")\n\t\t\t\t(color "${FABRICATED_TOP_MASK_COLOR}")\n\t\t\t\t(thickness 0.01)`
    )
    .replace(
      '(type "Bottom Solder Mask")\n\t\t\t\t(thickness 0.01)',
      `(type "Bottom Solder Mask")\n\t\t\t\t(color "${FABRICATED_BOTTOM_MASK_COLOR}")\n\t\t\t\t(thickness 0.01)`
    )
    .replace(
      '(type "Bottom Silk Screen")',
      '(type "Bottom Silk Screen")\n\t\t\t\t(color "White")'
    )
    .replace(
      '(type "core")\n\t\t\t\t(thickness 1.51)\n\t\t\t\t(material "FR4")',
      `(type "core")\n\t\t\t\t(thickness 1.51)\n\t\t\t\t(material "FR4")\n\t\t\t\t(color "${FABRICATED_DIELECTRIC_COLOR}")`
    )
    .replace('(at 30.8 40 180)', `(at ${place(30.8, 40)} ${SILK_ROTATION})`)
    .replace('(at 16.45 12.4 180)', `(at ${place(16.45, 12.4)} ${SILK_ROTATION})`)
    .replace('(at 16.55 9.7 180)', `(at ${place(16.55, 9.7)} ${SILK_ROTATION})`)
    .replace('(at 22.05 7.25 180)', `(at ${place(22.05, 7.25)} ${SILK_ROTATION})`)

  // Keep the source project untouched while rebuilding its front mask opening.
  // The copper zone already excludes the keyhole, so exposing the whole coffin
  // yields shiny copper around natural translucent FR-4. The keyhole itself is
  // only opened on B.Mask below -- the coffin already clears it on the front --
  // which leaves bare fibreglass on both faces for light to pass through.
  result = removeItemByUuid(result, '52c96acc-91dd-4b4c-9000-6b8f1f89f30b')
  result = removeItemByUuid(result, 'c4124be4-b992-4247-b74f-af1c4685f124')

  const fabricatedMask = `
	(gr_poly
		(pts
			(xy 127.52 71.845) (xy 132.6 71.845) (xy 135.14 79.465)
			(xy 132.6 94.705) (xy 127.52 94.705) (xy 124.98 79.465)
		)
		(stroke (width 0) (type solid))
		(fill yes)
		(layer "F.Mask")
		(uuid "5d9f2b90-7f40-4fa8-8689-64fd18197dc6")
	)
	(gr_poly
		(pts
			(xy 129.253 81.624) (xy 128.43 81.095) (xy 127.931 80.348)
			(xy 127.755 79.466) (xy 127.931 78.584) (xy 128.43 77.837)
			(xy 129.178 77.337) (xy 130.06 77.161) (xy 130.942 77.337)
			(xy 131.69 77.837) (xy 132.189 78.584) (xy 132.365 79.466)
			(xy 132.189 80.348) (xy 131.69 81.095) (xy 130.867 81.624)
			(xy 131.711 87.212) (xy 128.409 87.212)
		)
		(stroke (width 0) (type solid))
		(fill yes)
		(layer "B.Mask")
		(uuid "7089a955-b165-4014-8918-d3f2e87664c1")
	)
${buildBackCopperMaskOpenings(result)}
`
  const insertionPoint = result.indexOf('\n\t(gr_circle')
  if (insertionPoint === -1) {
    throw new Error('Could not place fabricated keyhole mask')
  }
  return `${result.slice(0, insertionPoint)}${fabricatedMask}${result.slice(insertionPoint)}`
}

async function main() {
  const cli = findKicadCli()
  const workDir = await mkdtempWork()
  const pcbPath = path.join(workDir, `${PROJECT_NAME}.kicad_pcb`)

  for (const extension of ['kicad_pcb', 'kicad_pro', 'kicad_sch']) {
    const source = path.join(PROJECT_DIR, `${PROJECT_NAME}.${extension}`)
    if (existsSync(source)) {
      const destination = path.join(workDir, `${PROJECT_NAME}.${extension}`)
      if (extension === 'kicad_pcb') {
        await writeFile(destination, prepareFabricatedBoard(await readFile(source, 'utf8')), 'utf8')
      } else {
        await copyFile(source, destination)
      }
    }
  }

  await mkdir(OUTPUT_DIR, {recursive: true})
  const pcb = parseSexpr(await readFile(pcbPath, 'utf8'))

  const groups = []
  for (const entry of LAYER_PLAN) {
    if (entry.layer === '__anchors__') {
      groups.push(`<g id="${entry.id}">${buildAnchors(pcb)}</g>`)
      continue
    }

    const layerFile = path.join(workDir, `${entry.layer.replace('.', '_')}.svg`)
    const body = await exportLayerSvg(cli, pcbPath, entry.layer, layerFile, entry.hairline !== false)
    if (!body) {
      console.log(`  (empty) ${entry.layer}`)
      continue
    }
    groups.push(`<g id="${entry.id}" opacity="${entry.opacity}">${body}</g>`)
    if (entry.layer === 'F.Cu') {
      groups.push(buildZoneHatch(body))
    }
    console.log(`  layer ${entry.layer}`)
  }

  // The dot grid is painted by the viewer canvas (see finder.css /
  // home-explorer.js) so it keeps covering the panel edge to edge while panning.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEW_X} ${VIEW_Y} ${VIEW_W} ${VIEW_H}" width="${VIEW_W}mm" height="${VIEW_H}mm" role="img" aria-label="KiCad PCB editor view of the Nostalgia Purgatory business card board">
${groups.join('\n')}
<g id="pad-labels">
${buildPadLabels(pcb)}
</g>
</svg>
`

  await writeFile(SVG_OUTPUT, svg, 'utf8')
  console.log(`wrote ${path.relative(repoRoot, SVG_OUTPUT)} (${svg.length} bytes)`)

  for (const [side, output] of [['top', RENDER_TOP], ['bottom', RENDER_BOTTOM]]) {
    const renderArgs = [
      'pcb',
      'render',
      '--side',
      side,
      '--quality',
      'high',
      '--background',
      'transparent',
      '--width',
      '1200',
      '--height',
      '2100',
      '--zoom',
      '0.85',
      // Deliberately no --floor: its floor plane is opaque geometry that greys
      // out the matte black and defeats the transparent background. The baked
      // shadow that --quality high adds anyway is stripped in tone-pcb-copper.py
      // so the viewer can cast a soft one in CSS around the real board edge.
      '-o',
      output,
    ]
    if (side === 'bottom') {
      renderArgs.push('--rotate', '0,0,180')
    }
    renderArgs.push(pcbPath)
    await run(cli, renderArgs)
    console.log(`wrote ${path.relative(repoRoot, output)}`)
  }
  await run('python', [COPPER_TONER, RENDER_TOP, RENDER_BOTTOM])
  console.log('toned exposed copper to polished natural copper')

  await rm(workDir, {recursive: true, force: true})
}

async function mkdtempWork() {
  const dir = path.join(os.tmpdir(), `pcb-render-${Date.now()}`)
  await mkdir(dir, {recursive: true})
  return dir
}

await main()
