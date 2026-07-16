from __future__ import annotations

import io
import html
import re
from pathlib import Path

from PIL import Image, ImageFile, ImageOps
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import ListFlowable, ListItem, Paragraph, SimpleDocTemplate, Spacer, Table

ImageFile.LOAD_TRUNCATED_IMAGES = True

ROOT = Path(__file__).resolve().parents[1]
APP_DIR = ROOT / "applications" / "assistant-character-fabricator-shadowmachine-2026-07-06"
PDF_DIR = ROOT / "applications" / "pdf"
FONT_DIR = Path("C:/Windows/Fonts")


PROP_DESIGN_IMAGES = [
    "/assets/voltavox/hero-with-record.jpg",
    "/assets/voltavox/printed.jpg",
    "/assets/voltavox/platten-top.jpg",
    "/assets/voltavox/platten-bottom.jpg",
    "/assets/voltavox/record-top.jpg",
    "/assets/voltavox/record-bottom.jpg",
    "/assets/voltavox/rose-artwork.jpg",
    "/assets/voltavox/without-horn.jpg",
    "/assets/voltavox/just-completed.jpg",
    "/assets/voltavox/jaden-finished.jpg",
    "/assets/sculpture/andrea,j-iProject-1.jpg",
    "/assets/sculpture/andrea,j-portrait-3.jpg",
    "/assets/c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_20191208_220715-9ad0694e-c0a7-41e8-98bb-758937ba4b4b.png",
    "/assets/c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_20191208_220752-fe35b472-48bb-4cdf-9eac-b9b38913edf6.png",
    "/assets/c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_escapethumbnail-110efe20-0c54-4ce8-92fe-a843b58adc04.png",
    "/assets/c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_ColumnsPuzzleConceptArt-2cbab0d3-660a-4ca7-bce5-b13ebf6a1b99.png",
    "/assets/sculpture/woodpalette1.jpg",
    "/assets/sculpture/woodpalette8.jpg",
    "/assets/sculpture/MetalLeafPose.png",
    "/assets/sculpture/Leaf_Detail.jpg",
    "/assets/sculpture/sculpturethumbnail.png",
    "/assets/sculpture/2015mushroomsglowing.jpg",
    "/assets/sculpture/2015assemblingmushrooms_1.jpg",
    "/assets/sculpture/2015nightmushrooms2.jpg",
    "/assets/sculpture/sculpture_sketchbookscan4.jpg",
    "/assets/c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_Leaf_Bathing2-b5189271-60c5-4ed5-8621-bd2f5d9c2ee0.png",
    "/assets/c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_figmentspace-8fe12353-8a30-4fd9-bbe8-2b5c331fcb1d.png",
    "/assets/c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_AdditionstoCad-88d5e110-6a4e-4714-9b36-6d1c7dc80313.png",
    "/assets/sculpture/c8c351f1-60c0-4a3f-b631-09002b30b04c.jpeg",
    "/assets/sculpture/andrea,j-iProject-2.jpg",
    "/assets/sculpture/andrea,j-iProject-3.jpg",
    "/assets/sculpture/andrea,j-iProject2-4.jpg",
    "/assets/sculpture/andrea,j-standingFigure-2.jpg",
    "/assets/sculpture/andrea,j-standingFigure-7.jpg",
    "/assets/sculpture/andrea,j-seatedFigure-3.jpg",
    "/assets/sculpture/andrea,j-portrait-5.jpg",
    "/assets/sculpture/andrea,j-cranium-1.jpg",
]

CHARACTER_FAB_IMAGES = [
    "/assets/sculpture/andrea,j-iProject-1.jpg",
    "/assets/sculpture/andrea,j-iProject-2.jpg",
    "/assets/sculpture/andrea,j-iProject2-3.jpg",
    "/assets/sculpture/andrea,j-standingFigure-1.jpg",
    "/assets/sculpture/andrea,j-standingFigure-4.jpg",
    "/assets/sculpture/andrea,j-standingFigure-9.jpg",
    "/assets/sculpture/andrea,j-seatedFigure-1.jpg",
    "/assets/sculpture/andrea,j-seatedFigure-4.jpg",
    "/assets/sculpture/andrea,j-portrait-1.jpg",
    "/assets/sculpture/andrea,j-portrait-4.jpg",
    "/assets/sculpture/andrea,j-portrait-7.jpg",
    "/assets/sculpture/andrea,j-cranium-2.jpg",
    "/assets/sculpture/character-modeling/character-modeling-01.jpg",
    "/assets/sculpture/character-modeling/character-modeling-03.jpg",
    "/assets/sculpture/character-modeling/character-modeling-05.jpg",
    "/assets/sculpture/character-modeling/character-modeling-07.jpg",
    "/assets/sculpture/character-modeling/character-modeling-09.jpg",
    "/assets/sculpture/character-modeling/character-modeling-11.jpg",
    "/assets/sculpture/character-modeling/character-modeling-13.jpg",
    "/assets/sculpture/character-modeling/character-modeling-15.jpg",
    "/assets/sculpture/character-modeling/character-modeling-17.jpg",
    "/assets/sculpture/character-modeling/character-modeling-19.jpg",
    "/assets/sculpture/character-modeling/character-modeling-21.jpg",
    "/assets/sculpture/character-modeling/character-modeling-23.jpg",
    "/assets/sculpture/MetalLeafPose.png",
    "/assets/sculpture/Leaf_Detail.jpg",
    "/assets/sculpture/Leaf_Front.jpg",
    "/assets/sculpture/Leaf_Silhouette.jpg",
    "/assets/sculpture/12516924_10205856825121657_2105784359_o.jpg",
    "/assets/sculpture/20160307_135316.jpg",
    "/assets/sculpture/snapchat-1476402055609385577.jpg",
    "/assets/sculpture/b07bea45-7315-4869-96dd-9b5414f1277e.jpg",
]

AAD_LAST_PAGE_IMAGES = [
    "/assets/losthighway/oddstar_garage_lights.jpg",
    "/assets/losthighway/oddstar_garage_during.jpg",
    "/assets/losthighway/oddstar_highwayexit_mechanicsdesk.jpg",
    "/assets/losthighway/PXL_20231009_021415128.jpg",
    "/assets/losthighway/PXL_20231010_010930237.jpg",
    "/assets/escapeindustries/ColumnsPuzzleFabGuideTextRedacted.png",
    "/assets/escapeindustries/IMG_1948.png",
    "/assets/escapeindustries/IMG_1935.png",
    "/assets/escapeindustries/IMG_1949.png",
    "/assets/escapeindustries/IMG_2256.png",
    "/assets/escapeindustries/ColumnsPuzzleConceptArt1.png",
]

# User-directed sequence edits (applied against current numbered order).
REMOVE_IMAGE_IDS = {15, 16, 17, 18, 19, 22, 24, 44, 45, 53, 54, 57}
MOVE_AFTER_RULES: list[tuple[list[int], int]] = [
    ([43], 11),
    ([50], 12),
    ([59, 60], 3),
    ([61, 62, 63], 6),
    ([64], 10),
    ([54, 55], 28),
]


def register_fonts() -> None:
    pdfmetrics.registerFont(TTFont("PacketSans", str(FONT_DIR / "arial.ttf")))
    pdfmetrics.registerFont(TTFont("PacketSansBold", str(FONT_DIR / "arialbd.ttf")))
    pdfmetrics.registerFont(TTFont("PacketSansItalic", str(FONT_DIR / "ariali.ttf")))


def to_fs_path(path: str) -> Path:
    candidate = Path(path)
    if candidate.is_absolute():
        return candidate
    return ROOT / path.lstrip("/")


def markdown_inline_to_text(raw: str) -> str:
    text = raw.strip().replace("  ", " ")
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r"\1 (\2)", text)
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return text


def markdown_inline_to_pdf_html(raw: str) -> str:
    text = raw.strip().replace("  ", " ")
    links: list[tuple[str, str]] = []

    def capture_link(match: re.Match[str]) -> str:
        label = match.group(1).strip()
        url = match.group(2).strip()
        token = f"__LINK_{len(links)}__"
        links.append((label, url))
        return token

    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", capture_link, text)
    text = html.escape(text, quote=True)

    for idx, (label, url) in enumerate(links):
        token = f"__LINK_{idx}__"
        link_html = (
            f'<link href="{html.escape(url, quote=True)}" color="blue">'
            f"{html.escape(label, quote=False)}</link>"
        )
        text = text.replace(token, link_html)

    return text


def export_text_md_to_pdf(md_path: Path, pdf_path: Path, title: str) -> None:
    styles = getSampleStyleSheet()
    body = ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        fontName="PacketSans",
        fontSize=10.6,
        leading=13.6,
        textColor=HexColor("#111111"),
    )
    body_indented = ParagraphStyle(
        "BodyIndented",
        parent=body,
        firstLineIndent=16,
    )
    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=letter,
        leftMargin=0.85 * inch,
        rightMargin=0.85 * inch,
        topMargin=0.85 * inch,
        bottomMargin=0.85 * inch,
        title=title,
        author="Jaden Andrea",
    )
    story = []
    in_body_section = False
    for raw in md_path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line:
            story.append(Spacer(1, 6))
            continue
        if line.startswith("Dear "):
            in_body_section = True
        if line.startswith("Sincerely"):
            in_body_section = False
        style = body_indented if in_body_section else body
        story.append(Paragraph(markdown_inline_to_pdf_html(raw), style))
    doc.build(story)


def export_cv_one_page(cv_md_path: Path, pdf_path: Path) -> None:
    from pypdf import PdfReader

    lines = cv_md_path.read_text(encoding="utf-8").splitlines()

    # Keep margins aligned with the repo's standard CV export.
    left_margin = 0.62 * inch
    right_margin = 0.62 * inch
    top_margin = 0.5 * inch
    bottom_margin = 0.5 * inch
    content_width = letter[0] - left_margin - right_margin

    def build_story(scale: float) -> list:
        styles = getSampleStyleSheet()
        name_style = ParagraphStyle(
            "CVName",
            parent=styles["Title"],
            fontName="PacketSansBold",
            fontSize=16.2 * scale,
            leading=18.0 * scale,
            spaceAfter=1.0 * scale,
        )
        section_style = ParagraphStyle(
            "CVSection",
            parent=styles["Heading2"],
            fontName="PacketSansBold",
            fontSize=9.0 * scale,
            leading=10.2 * scale,
            textColor=HexColor("#111111"),
            spaceBefore=2.0 * scale,
            spaceAfter=0.8 * scale,
        )
        role_header_style = ParagraphStyle(
            "CVRoleHeader",
            parent=styles["Normal"],
            fontName="PacketSansBold",
            fontSize=8.0 * scale,
            leading=9.0 * scale,
            spaceBefore=1.0 * scale,
            spaceAfter=0.35 * scale,
        )
        role_title_style = ParagraphStyle(
            "CVRoleTitle",
            parent=styles["Normal"],
            fontName="PacketSansBold",
            fontSize=7.6 * scale,
            leading=8.6 * scale,
            spaceAfter=0.25 * scale,
        )
        body_style = ParagraphStyle(
            "CVBody",
            parent=styles["Normal"],
            fontName="PacketSans",
            fontSize=7.6 * scale,
            leading=8.6 * scale,
            spaceAfter=0.15 * scale,
        )
        meta_style = ParagraphStyle(
            "CVMeta",
            parent=body_style,
            fontName="PacketSansItalic",
            textColor=HexColor("#444444"),
            fontSize=7.4 * scale,
            leading=8.3 * scale,
        )
        bullet_style = ParagraphStyle(
            "CVBullet",
            parent=body_style,
            leftIndent=8 * scale,
        )

        story = []
        pending_bullets: list[str] = []
        section_name = ""
        in_core_skills = False
        core_skills: list[str] = []

        def flush_bullets() -> None:
            nonlocal pending_bullets
            if not pending_bullets:
                return
            items = [ListItem(Paragraph(markdown_inline_to_text(b), bullet_style), leftIndent=6 * scale) for b in pending_bullets]
            story.append(
                ListFlowable(
                    items,
                    bulletType="bullet",
                    leftIndent=10 * scale,
                    bulletFontName="PacketSans",
                    bulletFontSize=7 * scale,
                    spaceBefore=0,
                    spaceAfter=0.12 * scale,
                )
            )
            pending_bullets = []

        def flush_core_skills() -> None:
            nonlocal core_skills
            if not core_skills:
                return
            mid = (len(core_skills) + 1) // 2
            left = core_skills[:mid]
            right = core_skills[mid:]
            max_rows = max(len(left), len(right))
            data = []
            for i in range(max_rows):
                ltxt = f"• {left[i]}" if i < len(left) else ""
                rtxt = f"• {right[i]}" if i < len(right) else ""
                data.append(
                    [
                        Paragraph(markdown_inline_to_text(ltxt), bullet_style) if ltxt else Paragraph("", bullet_style),
                        Paragraph(markdown_inline_to_text(rtxt), bullet_style) if rtxt else Paragraph("", bullet_style),
                    ]
                )
            table = Table(
                data,
                colWidths=[content_width / 2 - 4, content_width / 2 - 4],
                hAlign="LEFT",
                spaceBefore=0,
                spaceAfter=0.35 * scale,
            )
            story.append(table)
            core_skills = []

        for raw in lines:
            stripped = raw.strip()
            if not stripped:
                flush_bullets()
                continue

            if stripped.startswith("# "):
                flush_bullets()
                story.append(Paragraph(markdown_inline_to_text(stripped[2:]), name_style))
                continue

            if stripped.startswith("## "):
                flush_bullets()
                if in_core_skills:
                    flush_core_skills()
                section_name = stripped[3:].strip()
                in_core_skills = section_name == "Core Skills"
                story.append(Paragraph(markdown_inline_to_text(section_name), section_style))
                continue

            if in_core_skills and stripped.startswith("- "):
                core_skills.append(stripped[2:])
                continue

            if stripped.startswith("### "):
                flush_bullets()
                story.append(Paragraph(markdown_inline_to_text(stripped[4:]), role_header_style))
                continue

            if stripped.startswith("- "):
                pending_bullets.append(stripped[2:])
                continue

            if stripped.startswith("**") and stripped.endswith("**"):
                flush_bullets()
                story.append(Paragraph(markdown_inline_to_text(stripped[2:-2]), role_title_style))
                continue

            if re.search(r"\b(20\d{2}|Present|Ongoing)\b", stripped) and "-" in stripped and len(stripped) < 80:
                flush_bullets()
                story.append(Paragraph(markdown_inline_to_text(stripped), meta_style))
                continue

            flush_bullets()
            story.append(Paragraph(markdown_inline_to_text(stripped), body_style))

        flush_bullets()
        if in_core_skills:
            flush_core_skills()
        return story

    def render_scale(scale: float) -> tuple[bytes, int]:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            leftMargin=left_margin,
            rightMargin=right_margin,
            topMargin=top_margin,
            bottomMargin=bottom_margin,
            title=cv_md_path.stem,
            author="Jaden Andrea",
        )
        doc.build(build_story(scale))
        data = buffer.getvalue()
        pages = len(PdfReader(io.BytesIO(data)).pages)
        return data, pages

    # Find the largest scale that still fits on one page.
    low = 0.9
    high = 1.6
    best_data = None
    for _ in range(15):
        mid = (low + high) / 2
        data, pages = render_scale(mid)
        if pages <= 1:
            low = mid
            best_data = data
        else:
            high = mid

    if best_data is None:
        best_data, _ = render_scale(0.9)

    pdf_path.write_bytes(best_data)


def prepare_image(image_path: Path, target_w: int, target_h: int) -> ImageReader:
    with Image.open(image_path) as img:
        prepared = ImageOps.exif_transpose(img).convert("RGB")
        prepared.thumbnail((target_w, target_h), resample=Image.Resampling.LANCZOS)
    buffer = io.BytesIO()
    prepared.save(buffer, format="JPEG", quality=90, optimize=True)
    buffer.seek(0)
    return ImageReader(buffer)


def dedupe_existing(paths: list[str]) -> list[str]:
    seen = set()
    out = []
    for p in paths:
        key = p.strip()
        if key in seen:
            continue
        if not to_fs_path(key).exists():
            continue
        seen.add(key)
        out.append(key)
    return out


def is_figurative(path: str) -> bool:
    lowered = path.lower()
    return "/assets/sculpture/andrea,j-" in lowered


def split_sections() -> tuple[list[str], list[str], list[str], list[str]]:
    char_subset = CHARACTER_FAB_IMAGES[:12] + CHARACTER_FAB_IMAGES[-8:]
    combined = PROP_DESIGN_IMAGES + char_subset + AAD_LAST_PAGE_IMAGES
    unique = dedupe_existing(combined)

    figurative = [p for p in unique if is_figurative(p)]
    non_figurative = [p for p in unique if not is_figurative(p)]

    prop_non_fig = [p for p in non_figurative if p in PROP_DESIGN_IMAGES]
    char_non_fig = [p for p in non_figurative if p in char_subset and p not in prop_non_fig]
    aad_non_fig = [p for p in non_figurative if p in AAD_LAST_PAGE_IMAGES and p not in prop_non_fig and p not in char_non_fig]
    return prop_non_fig, figurative, char_non_fig, aad_non_fig


def apply_numbered_reorder(image_paths: list[str]) -> list[str]:
    numbered = [(idx + 1, path) for idx, path in enumerate(image_paths)]
    id_to_path = {idx: path for idx, path in numbered}
    kept_ids = [idx for idx, _ in numbered if idx not in REMOVE_IMAGE_IDS]

    # Remove moved ids first so we can insert at target positions deterministically.
    moved_ids = {mid for group, _ in MOVE_AFTER_RULES for mid in group}
    working_ids = [idx for idx in kept_ids if idx not in moved_ids]

    for move_group, after_id in MOVE_AFTER_RULES:
        group = [idx for idx in move_group if idx in kept_ids]
        if not group:
            continue
        if after_id in working_ids:
            insert_at = working_ids.index(after_id) + 1
        else:
            insert_at = len(working_ids)
        working_ids[insert_at:insert_at] = group

    return [id_to_path[idx] for idx in working_ids if idx in id_to_path]


def draw_prop_style_two_pages(
    c: canvas.Canvas,
    role_title: str,
    images: list[str],
    *,
    start_page: int,
    total_pages: int,
    start_image_number: int,
    show_numbers: bool = False,
) -> int:
    # Matches the exact spacing/sizing behavior from prop-design-draft export.
    width, height = letter
    margin_x = 34
    margin_top = 40
    margin_bottom = 34
    header_h = 26
    gutter_x = 8
    gutter_y = 8
    cols = 4
    rows = 4
    per_page = cols * rows

    page_images = images[: per_page * 2]
    pages = [page_images[:per_page], page_images[per_page : per_page * 2]]
    image_number = start_image_number
    for page_idx, page_images in enumerate(pages, start=1):
        c.setFont("PacketSansBold", 12)
        c.drawString(margin_x, height - margin_top + 4, role_title)
        c.setFont("PacketSans", 8.5)
        c.drawRightString(
            width - margin_x,
            height - margin_top + 4,
            f"Page {start_page + page_idx - 1} of {total_pages}",
        )

        cell_w = (width - (2 * margin_x) - ((cols - 1) * gutter_x)) / cols
        cell_h = (height - margin_top - margin_bottom - header_h - ((rows - 1) * gutter_y)) / rows

        for idx, rel_path in enumerate(page_images):
            row = idx // cols
            col = idx % cols
            x = margin_x + col * (cell_w + gutter_x)
            y_top = height - margin_top - header_h - row * (cell_h + gutter_y)
            y = y_top - cell_h
            image = prepare_image(to_fs_path(rel_path), int(cell_w * 2), int(cell_h * 2))
            c.drawImage(
                image,
                x,
                y,
                width=cell_w,
                height=cell_h,
                preserveAspectRatio=True,
                anchor="c",
                mask="auto",
            )
            if show_numbers:
                c.setFillColorRGB(0, 0, 0)
                c.rect(x + 2, y + 2, 24, 15, stroke=0, fill=1)
                c.setFillColorRGB(1, 1, 1)
                c.setFont("PacketSansBold", 8)
                c.drawString(x + 6, y + 6, str(image_number))
            image_number += 1

        c.setFont("PacketSans", 7.5)
        c.drawString(margin_x, 18, "source: jadenandrea.com")
        c.showPage()
    return image_number


def draw_other_images_page(
    c: canvas.Canvas,
    role_title: str,
    images: list[str],
    *,
    page_no: int,
    total_pages: int,
    start_image_number: int,
    show_numbers: bool = False,
) -> int:
    width, height = letter
    margin_x = 28
    margin_top = 38
    margin_bottom = 30
    header_h = 36
    gutter_x = 5
    gutter_y = 5

    valid = [p for p in images if to_fs_path(p).exists()]
    if not valid:
        valid = []

    # Fit all remaining images on one page by adapting grid columns.
    cols = 7
    rows = max(1, (len(valid) + cols - 1) // cols)
    cell_w = (width - (2 * margin_x) - ((cols - 1) * gutter_x)) / cols
    cell_h = (height - margin_top - margin_bottom - header_h - ((rows - 1) * gutter_y)) / rows

    c.setFont("PacketSansBold", 12)
    c.drawString(margin_x, height - margin_top + 4, role_title)
    c.setFont("PacketSans", 8.5)
    c.drawRightString(width - margin_x, height - margin_top + 4, f"Page {page_no} of {total_pages}")
    c.setFont("PacketSans", 8.2)
    c.drawString(margin_x, height - margin_top - 10, "Additional images (figurative grouped together)")

    image_number = start_image_number
    for idx, rel_path in enumerate(valid):
        row = idx // cols
        col = idx % cols
        x = margin_x + col * (cell_w + gutter_x)
        y_top = height - margin_top - header_h - row * (cell_h + gutter_y)
        y = y_top - cell_h
        image = prepare_image(to_fs_path(rel_path), int(cell_w * 2), int(cell_h * 2))
        c.drawImage(
            image,
            x,
            y,
            width=cell_w,
            height=cell_h,
            preserveAspectRatio=True,
            anchor="c",
            mask="auto",
        )
        if show_numbers:
            c.setFillColorRGB(0, 0, 0)
            c.rect(x + 1.5, y + 1.5, 20, 13, stroke=0, fill=1)
            c.setFillColorRGB(1, 1, 1)
            c.setFont("PacketSansBold", 7.2)
            c.drawString(x + 4.5, y + 4.5, str(image_number))
        image_number += 1

    c.setFont("PacketSans", 7.5)
    c.drawString(margin_x, 18, "source: jadenandrea.com")
    c.showPage()
    return image_number


def export_portfolio_md(md_path: Path, sections: list[tuple[str, list[str]]]) -> None:
    lines = [
        "# Assistant Character Fabricator Portfolio (Image Packet)",
        "",
        "Combined per request from:",
        "- Prop Design Draft Portfolio",
        "- Character Modeling/Fabrication Portfolio (first three rows + last two rows)",
        "- Assistant Art Director portfolio (last page)",
        "",
        "All duplicate photos removed globally. Figurative sculpture images are grouped together.",
        "",
    ]
    for title, images in sections:
        lines.append(f"## {title}")
        lines.append("")
        for img in images:
            lines.append(f"![]({img})")
        lines.append("")
    md_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    register_fonts()
    PDF_DIR.mkdir(parents=True, exist_ok=True)

    cover_md = APP_DIR / "cover-letter.md"
    cv_md = APP_DIR / "cv.md"
    portfolio_md = APP_DIR / "portfolio.md"

    cover_pdf = PDF_DIR / "assistant-character-fabricator-shadowmachine-cover-letter.pdf"
    cv_pdf = PDF_DIR / "assistant-character-fabricator-shadowmachine-cv.pdf"
    portfolio_pdf = PDF_DIR / "assistant-character-fabricator-shadowmachine-portfolio.pdf"
    numbered_portfolio_pdf = PDF_DIR / "assistant-character-fabricator-shadowmachine-portfolio-numbered.pdf"

    export_text_md_to_pdf(cover_md, cover_pdf, "Assistant Character Fabricator Cover Letter")
    export_cv_one_page(cv_md, cv_pdf)

    prop_non_fig, figurative, char_non_fig, aad_non_fig = split_sections()
    sections = [
        ("Prop Design Draft - Selected", prop_non_fig),
        ("Figurative Sculpture - Grouped", figurative),
        ("Character Modeling/Fabrication - First 3 Rows + Last 2 Rows", char_non_fig),
        ("Assistant Art Director Last Page - Selected", aad_non_fig),
    ]
    export_portfolio_md(portfolio_md, sections)

    # Build the PDF with:
    # - first two pages: character modeling/fabrication export style
    # - next two pages: prop design export style
    # - final page: remaining images, deduped globally
    used: set[str] = set()

    char_primary = dedupe_existing(CHARACTER_FAB_IMAGES)
    char_pages = [p for p in char_primary if p not in used][:32]
    used.update(char_pages)

    prop_primary = dedupe_existing(PROP_DESIGN_IMAGES)
    prop_pages = [p for p in prop_primary if p not in used][:32]
    used.update(prop_pages)

    remaining_candidates = dedupe_existing(CHARACTER_FAB_IMAGES + PROP_DESIGN_IMAGES + AAD_LAST_PAGE_IMAGES)
    remaining_images = [p for p in remaining_candidates if p not in used]
    full_order = char_pages + prop_pages + remaining_images
    full_order = apply_numbered_reorder(full_order)

    # Re-slice after reordering.
    char_pages = full_order[:32]
    prop_pages = full_order[32:64]
    remaining_images = full_order[64:]

    c = canvas.Canvas(str(portfolio_pdf), pagesize=letter)
    role_title = "Assistant Character Fabricator Portfolio"
    next_image_number = draw_prop_style_two_pages(
        c,
        role_title,
        char_pages,
        start_page=1,
        total_pages=4,
        start_image_number=1,
        show_numbers=False,
    )
    next_image_number = draw_prop_style_two_pages(
        c,
        role_title,
        prop_pages,
        start_page=3,
        total_pages=4,
        start_image_number=next_image_number,
        show_numbers=False,
    )
    c.save()

    print(cover_pdf)
    print(cv_pdf)
    print(portfolio_md)
    print(portfolio_pdf)


if __name__ == "__main__":
    main()
