from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import ListFlowable, ListItem, Paragraph, SimpleDocTemplate, Spacer


ROOT = Path(__file__).resolve().parents[1]
OUT_PATH = ROOT / "assets" / "resume" / "Jaden-Andrea-Resume.pdf"
FONT_DIR = Path("C:/Windows/Fonts")


def register_fonts() -> None:
    # Use Unicode-capable TrueType fonts so em dashes and bullets render correctly.
    pdfmetrics.registerFont(TTFont("ResumeSans", str(FONT_DIR / "arial.ttf")))
    pdfmetrics.registerFont(TTFont("ResumeSansBold", str(FONT_DIR / "arialbd.ttf")))
    pdfmetrics.registerFont(TTFont("ResumeSansItalic", str(FONT_DIR / "ariali.ttf")))


def build_pdf() -> None:
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    register_fonts()

    doc = SimpleDocTemplate(
        str(OUT_PATH),
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.6 * inch,
        bottomMargin=0.6 * inch,
        title="Jaden Andrea Resume",
        author="Jaden Andrea",
    )

    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="Name",
            parent=styles["Title"],
            fontName="ResumeSansBold",
            fontSize=20,
            leading=24,
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Tag",
            parent=styles["Normal"],
            fontName="ResumeSans",
            fontSize=10.5,
            leading=14,
            textColor=colors.HexColor("#333333"),
            spaceAfter=8,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Section",
            parent=styles["Heading2"],
            fontName="ResumeSansBold",
            fontSize=11.5,
            leading=14,
            textColor=colors.HexColor("#111111"),
            spaceBefore=8,
            spaceAfter=4,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Role",
            parent=styles["Normal"],
            fontName="ResumeSansBold",
            fontSize=10.2,
            leading=13,
            spaceBefore=2,
            spaceAfter=1,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Meta",
            parent=styles["Normal"],
            fontName="ResumeSansItalic",
            fontSize=9.4,
            leading=12,
            textColor=colors.HexColor("#444444"),
            spaceAfter=2,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Body",
            parent=styles["Normal"],
            fontName="ResumeSans",
            fontSize=9.8,
            leading=13,
        )
    )

    story = []
    story.append(Paragraph("Jaden Andrea", styles["Name"]))
    story.append(Paragraph("Art Director, Art Team Manager, Sculptor", styles["Tag"]))
    story.append(Paragraph("Portland, OR • 714.337.1028 • nostalgiapurgatory@gmail.com", styles["Body"]))
    story.append(
        Paragraph(
            "linkedin.com/in/jadenandrea • jadenandrea.com • github.com/nostalgiapurgatory",
            styles["Body"],
        )
    )
    story.append(Spacer(1, 8))

    story.append(Paragraph("Professional Summary", styles["Section"]))
    story.append(
        Paragraph(
            (
                "Innovative Art Director and Multidisciplinary Artist with 10+ years of experience "
                "bringing immersive and interactive experiences to life. Excels in concept development, "
                "visual design, and execution of compelling creative products through strong team "
                "leadership and cross-functional collaboration."
            ),
            styles["Body"],
        )
    )

    story.append(Paragraph("Professional Experience", styles["Section"]))

    def add_role(company: str, role: str, dates: str, bullets: list[str]) -> None:
        story.append(Paragraph(company, styles["Role"]))
        story.append(Paragraph(f"{role} • {dates}", styles["Meta"]))
        items = [ListItem(Paragraph(b, styles["Body"]), leftIndent=10) for b in bullets]
        story.append(
            ListFlowable(
                items,
                bulletType="bullet",
                leftIndent=12,
                bulletFontName="ResumeSans",
                bulletFontSize=8,
            )
        )
        story.append(Spacer(1, 5))

    add_role(
        "[Unannounced Project] — Los Angeles, CA",
        "Character Sculptor, Creative Figurine & Product Concepts",
        "May 2026 — Ongoing",
        [
            (
                "Developing 3D concept direction for an illustrated character in an upcoming product "
                "series and immersive entertainment experience."
            ),
            (
                "Iterating concepts through mood boards, sketches, prior art, and collaborative review "
                "sessions."
            ),
        ],
    )

    add_role(
        "Bloomsbury Fine Art & Antiques — Portland, OR",
        "Painting & Sculpture Restorer & Conservationist",
        "January 2025 — Ongoing",
        [
            (
                "Handling, cleaning, repairing, and restoring antique paintings, ornate frames, and "
                "sculptures across historic and contemporary materials."
            ),
            (
                "Performing advanced patching, filling, gluing, and color/texture matching to make "
                "damage minimally detectable."
            ),
            (
                "Applying style matching from classical to modern techniques and reconstructing missing "
                "sculptural/frame detail with historical context."
            ),
        ],
    )

    add_role(
        "Hi-Orbit Games (Wild Heart Ranch) — 29 Palms, CA",
        "Creative Technologist, Engineer, & Fabricator",
        "May 2024 — Nov 2024",
        [
            (
                "Designed circuits and Arduino code and fabricated interactive housings for escape room "
                "props, puzzles, and scenic elements."
            ),
            (
                "Built and reflashed collaborative long-distance electronics work and integrated "
                "hardware into thematic physical forms."
            ),
            (
                "Designed custom PCBs and integrated effects into proprietary show control for "
                "high-throughput guest experiences."
            ),
        ],
    )

    add_role(
        "Gather (gather.town) — Fully Remote",
        "Art Director; Art Team Manager; Senior Pixel Artist (IC)",
        "Dec 2020 — Dec 2023",
        [
            (
                "Led visual direction across avatars, virtual offices, and core content systems in a "
                "fast-scaling startup environment."
            ),
            (
                "Managed artists and contractors while defining quality standards for perspective, "
                "palette, diversity, and texture."
            ),
            (
                "Partnered with Product, Engineering, Marketing, and Executive teams to align creative "
                "output with growth goals."
            ),
        ],
    )

    add_role(
        "Escape Industries LLC — Fully Remote",
        "Designer, Concept Artist",
        "May 2020 — Aug 2020",
        [
            "Produced concept and production visuals for escape room props, puzzles, and sets.",
            "Managed remote fabrication technicians and supported delivery from concept through install.",
        ],
    )

    story.append(Paragraph("Education", styles["Section"]))
    story.append(
        Paragraph(
            "Rhode Island School of Design (RISD) — BFA, Sculpture / Interior Architecture (2013 — 2018)",
            styles["Body"],
        )
    )
    story.append(Paragraph("European Honors Program, Rome, Italy (2016 — 2017)", styles["Body"]))
    story.append(Paragraph("Fire Walk with Us, Menorca, Spain (2023)", styles["Body"]))

    story.append(Paragraph("Skills", styles["Section"]))
    story.append(
        Paragraph(
            (
                "Adobe Photoshop, Illustrator, InDesign, Firefly, Procreate, Aseprite, Pixaki • "
                "Fusion 360, AutoCAD, KiCAD, Notion, Figma • GitHub, Linear"
            ),
            styles["Body"],
        )
    )

    doc.build(story)


if __name__ == "__main__":
    build_pdf()
    print(str(OUT_PATH))
