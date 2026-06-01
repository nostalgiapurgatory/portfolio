from __future__ import annotations

from pathlib import Path
import shutil


SOURCE_DIR = Path(
    r"\\?\C:\Users\Jaden Andrea\.cursor\projects\c-Users-Jaden-Andrea-Documents-GitHub-portfolio\assets"
)
TARGET_DIR = Path(
    r"C:\Users\Jaden Andrea\Documents\GitHub\portfolio\assets\escapeindustries\new-additions"
)

SOURCE_FILES = [
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_PuzzleSculpture1-072ff4d0-ee55-4048-a2bb-eb9815d9785e.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_PuzzleSculpture3-299a0fb6-d8d1-48f8-8820-2885d6666cd2.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_PuzzleSculpture2-bd2f6170-2ca9-4ee5-b829-44a003da0838.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_TheMysticHowler_ENH-1eb11b5e-0921-4044-9f65-5d2238d70635.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_InstalledPuzzleSculpture-e0683732-7812-4c93-abb3-f2e3579788d3.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_JournalEntryConcept-385a1bf8-b2e3-4fd3-905f-c67b2c74f0a2.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_GlyphGuide_DigitalPainting_Thumbnail-97f4030f-2d38-4565-bd19-8b99e0779662.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_ColumnsPuzzleConceptArt-5f8d447e-1dff-4039-b3b7-0ef552003b68.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_ColumnsPuzzleConceptArt1-6895c0c0-1c20-4f99-993c-368ee7b58eb1.png",
]


def main() -> None:
    TARGET_DIR.mkdir(parents=True, exist_ok=True)

    for i, source_name in enumerate(SOURCE_FILES, start=1):
        source_path = SOURCE_DIR / source_name
        if not source_path.exists():
            raise FileNotFoundError(f"Missing source file: {source_name}")

        target_name = f"escape-new-haven-new-{i:02d}.png"
        target_path = TARGET_DIR / target_name
        shutil.copyfile(source_path, target_path)
        print(f"Copied {source_name} -> {target_name}")


if __name__ == "__main__":
    main()
