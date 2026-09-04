# Scripts

Site and asset-build tools live here and are tracked. Job-application and one-off import helpers live in `scripts/private/`, which is gitignored.

## Site / asset build (tracked)

### `render-business-card-pcb.mjs`

Rebuilds the homepage PCB viewer assets from the KiCad business-card board.

Requires KiCad 9 or 10 (`kicad-cli` on PATH or in the usual Program Files location) and Python with Pillow for copper toning.

```
node scripts/render-business-card-pcb.mjs
```

Writes `assets/pcb/business-card-rev00-pcbnew.svg`, `business-card-rev00-3d-top.png`, and `business-card-rev00-3d-bottom.png`. After the 3D PNGs are rendered it runs `tone-pcb-copper.py`.

### `tone-pcb-copper.py`

Post-process a KiCad raytraced board PNG: shift yellow copper toward polished copper and strip the baked rectangular shadow.

Usually invoked by the renderer above. To run alone:

```
python scripts/tone-pcb-copper.py path/to/board.png
```

### `render-barn-floorplans.mjs`

Draws Time Tourist barn / barracks floorplans (base shell, occupant load, low tables, mattresses, mattresses with mirror) as SVG and PNG.

Requires `sharp` (from this repo's `package.json`).

```
node scripts/render-barn-floorplans.mjs
```

Writes into `assets/timetourist/floorplans/`.

## Local-only helpers (`scripts/private/`)

These are not in git. A README in that folder describes each one if you have a local clone that already contains them.
