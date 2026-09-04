"""Clean up KiCad's raytraced board renders for the site's board viewer.

Shifts the yellow raw-copper toward polished natural copper, and strips the
raytracer's baked shadow so the viewer can cast a soft one in CSS instead.
"""

from math import exp
from pathlib import Path
import sys

from PIL import Image, ImageChops, ImageFilter

# The board and its components render fully opaque and the translucent FR-4
# keyhole lands around 229, while the baked shadow tops out near 153.
BOARD_ALPHA = 200
# Recovers the antialiased board edge, which ramps through the shadow's range.
EDGE_RECOVERY = 5


def tone_copper(path: Path) -> None:
    image = Image.open(path).convert("RGBA")
    pixels = image.load()
    width, height = image.size
    copper = (184, 92, 38)
    highlight = (255, 205, 142)

    for y in range(height):
        for x in range(width):
            red, green, blue, alpha = pixels[x, y]
            if alpha == 0 or red < 170 or green < 125 or blue > 110 or red < blue * 2:
                continue

            # A narrow diagonal reflection keeps broad copper areas metallic
            # while preserving KiCad's antialiased edges and lighting.
            diagonal = x / width + y / height
            front_gleam = exp(-((diagonal - 1.0) / 0.075) ** 2)
            battery_gleam = exp(-((diagonal - 1.22) / 0.065) ** 2)
            gleam = max(front_gleam, battery_gleam) * 0.72
            value = max(red, green) / 255
            rgb = tuple(
                round((base * (1 - gleam) + bright * gleam) * (0.72 + 0.28 * value))
                for base, bright in zip(copper, highlight)
            )
            pixels[x, y] = (*rgb, alpha)

    image.putalpha(board_silhouette(image))
    image.save(path)


def board_silhouette(image: Image.Image) -> Image.Image:
    """Drop everything outside the board so only its own alpha survives.

    KiCad bakes a hard-edged rectangular shadow into the render, which reads as
    a grey box once composited. Keying on alpha alone would also eat the board's
    antialiased edge, so dilate the opaque core and keep the original alpha
    inside that.
    """
    alpha = image.getchannel("A")
    mask = alpha.point(lambda value: 255 if value >= BOARD_ALPHA else 0)
    mask = mask.filter(ImageFilter.MaxFilter(EDGE_RECOVERY))
    return ImageChops.multiply(alpha, mask)


for filename in sys.argv[1:]:
    tone_copper(Path(filename))
