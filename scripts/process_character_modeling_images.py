from __future__ import annotations

from pathlib import Path
import re

import numpy as np
from PIL import Image, ImageEnhance, ImageOps


SOURCE_DIR = Path(
    r"\\?\C:\Users\Jaden Andrea\.cursor\projects\c-Users-Jaden-Andrea-Documents-GitHub-portfolio\assets"
)
TARGET_DIR = Path(
    "C:/Users/Jaden Andrea/Documents/GitHub/portfolio/assets/sculpture/character-modeling"
)
SOURCE_GLOB = (
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_"
    "15f20a196152e26b017af5dbeeab7dd3_images_*.png"
)
TARGET_RATIO = 4 / 5  # width / height
SOURCE_FILES = [
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_PXL_20260526_054146911.RAW-01.COVER-65ece30b-552d-424b-b062-f04d790b9de6.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_PXL_20260530_232443317.RAW-01.COVER-40badfd7-830e-4fec-9048-68b7019ae3d0.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_PXL_20260526_063227336.RAW-01.COVER-2f3c9717-3769-48e4-8e52-a8c7c9dbfd96.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_PXL_20260530_232448830.RAW-01.COVER-0857f6d7-dd48-40e9-bc1f-4a929b04feda.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_PXL_20260530_232309361.RAW-01.COVER-dfa9ec5f-b7d4-4274-b4c4-46e0a00dfbc3.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_PXL_20260530_232318144.RAW-01.COVER-5453dc03-18b1-4208-9a6c-88c2fe0d1c37.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_PXL_20260526_072703998.RAW-01.COVER-03d22ea1-562c-48cb-9d33-774065591e6c.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_PXL_20260530_232332205.RAW-01.COVER-a0f2a06b-11f2-432b-a081-f796f3ad494d.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_PXL_20260526_032859570.RAW-01.COVER-2be5b79c-5252-4a59-8ac7-024845a75648.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_PXL_20260530_232357461.RAW-01.COVER-23a3741a-4fad-4b8f-8dba-0b1d6a327e9b.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_PXL_20260530_232406156.RAW-01.COVER-453105c1-b871-4dc5-917c-958c8eb69141.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_PXL_20260526_051649083.RAW-01.COVER-bd223f19-b7c6-4ce5-b676-856f314fc303.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_PXL_20260528_051534121.RAW-01.COVER-2c2418e2-d674-4886-bd85-576ad5380ef6.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_PXL_20260530_232419720.RAW-01.COVER-2a22eae8-bb4f-4240-aa81-4b0f3bdcbf3f.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_PXL_20260530_021135247.RAW-01.COVER-9926d094-00c8-4706-8100-2afeb1e946de.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_PXL_20260530_021203387.RAW-01.COVER-7f493c28-af52-4f5a-9fc8-9d47afc8458c.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_PXL_20260530_212355592.RAW-01.COVER-0fa05cd9-10bf-4dd0-9699-47a8bfae7646.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_PXL_20260530_220950458.RAW-01.COVER-c9d725f5-2828-4f55-b04b-d6ca244f21be.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_PXL_20260530_220953933.RAW-01.COVER-1ac2a355-d502-4671-bbd8-2694984af2a9.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_PXL_20260530_221005960.RAW-01.COVER-aa2f9358-f410-4674-b18f-ac2eec60eaeb.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_PXL_20260530_220958110.RAW-01.COVER-25535951-1b5f-4f27-ba7b-507fe2d83ebb.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_PXL_20260530_221012047.RAW-01.COVER-aa9bab9e-d592-4978-ad1f-47221c96b06c.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_PXL_20260530_223153647.RAW-01.COVER-ec21d895-fb19-4487-8443-57552d2339a1.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_PXL_20260530_232327460.RAW-01.COVER-35e4cd55-b828-4e71-a239-693dc7f0d757.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_PXL_20260528_042602943.RAW-01.COVER-de19701e-6ffd-4c75-89c0-b298dbedc216.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_PXL_20260530_232229454.RAW-01.COVER-9f140cae-8715-402c-9712-2e4121791047.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_PXL_20260530_232313715.RAW-01.COVER-e4aabb81-5c97-4e03-ab18-bc71a0bc9375.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_PXL_20260530_232323590.RAW-01.COVER-5a1883c2-4d97-435d-9639-cd4a5edcacb1.png",
]


def compute_subject_bbox(image_rgb: np.ndarray) -> tuple[int, int, int, int]:
    h, w, _ = image_rgb.shape
    border = max(8, min(h, w) // 16)

    top = image_rgb[:border, :, :]
    bottom = image_rgb[h - border :, :, :]
    left = image_rgb[:, :border, :]
    right = image_rgb[:, w - border :, :]
    border_pixels = np.concatenate(
        [
            top.reshape(-1, 3),
            bottom.reshape(-1, 3),
            left.reshape(-1, 3),
            right.reshape(-1, 3),
        ],
        axis=0,
    )
    bg_color = np.median(border_pixels, axis=0)

    dist = np.sqrt(np.sum((image_rgb.astype(np.float32) - bg_color) ** 2, axis=2))
    threshold = max(18.0, np.percentile(dist, 78) * 0.72)
    mask = dist > threshold

    row_hits = np.where(mask.sum(axis=1) > max(5, int(w * 0.02)))[0]
    col_hits = np.where(mask.sum(axis=0) > max(5, int(h * 0.02)))[0]

    if len(row_hits) == 0 or len(col_hits) == 0:
        return int(w * 0.15), int(h * 0.05), int(w * 0.85), int(h * 0.95)

    x0 = int(col_hits.min())
    x1 = int(col_hits.max()) + 1
    y0 = int(row_hits.min())
    y1 = int(row_hits.max()) + 1
    return x0, y0, x1, y1


def expand_and_ratio_crop(
    bbox: tuple[int, int, int, int], image_size: tuple[int, int]
) -> tuple[int, int, int, int]:
    w, h = image_size
    x0, y0, x1, y1 = bbox

    bw = x1 - x0
    bh = y1 - y0
    pad_x = int(bw * 0.15)
    pad_y = int(bh * 0.12)

    x0 = max(0, x0 - pad_x)
    x1 = min(w, x1 + pad_x)
    y0 = max(0, y0 - pad_y)
    y1 = min(h, y1 + pad_y)

    bw = x1 - x0
    bh = y1 - y0
    cx = (x0 + x1) / 2
    cy = (y0 + y1) / 2

    current_ratio = bw / bh
    if current_ratio > TARGET_RATIO:
        needed_h = bw / TARGET_RATIO
        half_h = needed_h / 2
        y0 = int(max(0, cy - half_h))
        y1 = int(min(h, cy + half_h))
        if y1 - y0 < needed_h:
            if y0 == 0:
                y1 = min(h, int(needed_h))
            else:
                y0 = max(0, h - int(needed_h))
    else:
        needed_w = bh * TARGET_RATIO
        half_w = needed_w / 2
        x0 = int(max(0, cx - half_w))
        x1 = int(min(w, cx + half_w))
        if x1 - x0 < needed_w:
            if x0 == 0:
                x1 = min(w, int(needed_w))
            else:
                x0 = max(0, w - int(needed_w))

    return x0, y0, x1, y1


def color_correct(img: Image.Image) -> Image.Image:
    img = ImageOps.autocontrast(img, cutoff=0.8)
    img = ImageEnhance.Color(img).enhance(1.04)
    img = ImageEnhance.Contrast(img).enhance(1.07)
    img = ImageEnhance.Brightness(img).enhance(1.03)
    img = ImageEnhance.Sharpness(img).enhance(1.08)
    return img


def extract_capture_timestamp(name: str) -> tuple[int, int]:
    match = re.search(r"PXL_(\d{8})_(\d{6})", name)
    if not match:
        return (0, 0)
    return (int(match.group(1)), int(match.group(2)))


def main() -> None:
    TARGET_DIR.mkdir(parents=True, exist_ok=True)

    source_paths = [SOURCE_DIR / filename for filename in SOURCE_FILES]
    source_paths = [p for p in source_paths if p.exists()]
    source_paths = sorted(
        source_paths,
        key=lambda p: extract_capture_timestamp(p.name),
        reverse=True,
    )

    if not source_paths:
        raise SystemExit("No source images found.")

    for stale in TARGET_DIR.glob("character-modeling-*.jpg"):
        stale.unlink(missing_ok=True)

    for i, src in enumerate(source_paths, start=1):
        with Image.open(src) as im:
            im = im.convert("RGB")
            arr = np.array(im)
            bbox = compute_subject_bbox(arr)
            crop_box = expand_and_ratio_crop(bbox, im.size)
            out = im.crop(crop_box)
            out = color_correct(out)

            target_path = TARGET_DIR / f"character-modeling-{i:02d}.jpg"
            out.save(target_path, format="JPEG", quality=92, optimize=True)
            print(f"Wrote {target_path.name} <- {src.name}")


if __name__ == "__main__":
    main()
