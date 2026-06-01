from __future__ import annotations

from pathlib import Path
import shutil


SOURCE_DIR = Path(
    r"\\?\C:\Users\Jaden Andrea\.cursor\projects\c-Users-Jaden-Andrea-Documents-GitHub-portfolio\assets"
)
TARGET_DIR = Path(
    r"C:\Users\Jaden Andrea\Documents\GitHub\portfolio\assets\nostalgiapurgatory\new-additions"
)

SOURCE_FILES = [
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_20180531_144639-acc08a34-b023-4dc2-8fec-582ebc9f050e.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_dsc00517-fb8b6d46-7fbd-4242-8cbd-40d30846499c.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_20180531_145753-14c71baf-6fb5-44df-87ac-f3a3890e96d3.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_20180528_145733-52a94d53-7d75-4746-9dbc-ad7d411f5e8a.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_dsc00469-021b3c16-79cc-431b-9935-1c5004acbed7.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_IMG_20180414_102953_542-00119634-1aea-4799-87a1-4043645b28d0.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_dsc00451-2cab2ae9-2f59-4617-8e8a-805a902bb7bb.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_20171013_210101-64634e09-b4a9-4aa8-93eb-d7234e2e53e4.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_dsc00539-3a9d64c4-e7a4-4fc7-a96c-8e12e0af3099.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_dsc00572-1fcd9fb3-3117-48bd-91d8-ae8a160fc44b.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_dsc00607-783cfb37-45d9-450d-a4fd-80ed10b60439.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_20171012_183701-94ae1e7d-9685-4baf-b735-690add915658.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_20171012_183729-39429558-d529-48eb-bc46-a00cb0b75ee1.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_20171012_183742-a539c0b9-4d31-480f-9902-2991f600483b.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_dsc00476-40867688-8bd1-4216-850f-31fc680b8c02.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_dsc00495-c9085fee-2201-47be-a2ab-46620af8ee06.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_dsc00472-c83d669a-dacf-4c61-a9d8-09c5c7dacfa0.png",
    "c__Users_Jaden_Andrea_AppData_Roaming_Cursor_User_workspaceStorage_15f20a196152e26b017af5dbeeab7dd3_images_dsc00562-91f912d2-167c-4fd0-8459-27032f7d44bb.png",
]


def main() -> None:
    TARGET_DIR.mkdir(parents=True, exist_ok=True)

    for i, source_name in enumerate(SOURCE_FILES, start=1):
        source_path = SOURCE_DIR / source_name
        if not source_path.exists():
            raise FileNotFoundError(f"Missing source file: {source_name}")

        target_name = f"nostalgia-purgatory-new-{i:02d}.png"
        target_path = TARGET_DIR / target_name
        shutil.copyfile(source_path, target_path)
        print(f"Copied {source_name} -> {target_name}")


if __name__ == "__main__":
    main()
