"""
Media Tools Pro - Desktop Edition (Python Tkinter)
===================================================
A standalone desktop application for downloading, extracting, and editing video & audio.
Supports YouTube, Facebook, TikTok, Instagram, Twitter/X, Playlists, 
Audio Stream Extraction, Video Frame Snapshotting, and Audio Trimming.

Requirements:
    pip install yt-dlp opencv-python pydub pillow
    (Ensure ffmpeg is installed and available in system PATH for best quality muxing)

Run with:
    python main.py
"""

import os
import sys
import time
import math
import shutil
import queue
import threading
import subprocess
import tkinter as tk
from tkinter import ttk, messagebox, filedialog, scrolledtext
from datetime import timedelta
from typing import Dict, List, Optional, Any

# Optional 3rd-party imports with graceful handling
try:
    import yt_dlp
except ImportError:
    yt_dlp = None

try:
    import cv2
except ImportError:
    cv2 = None

try:
    from PIL import Image, ImageTk, ImageDraw
except ImportError:
    Image = None
    ImageTk = None
    ImageDraw = None

try:
    from pydub import AudioSegment
except ImportError:
    AudioSegment = None

try:
    from rembg import remove as rembg_remove
except ImportError:
    rembg_remove = None

try:
    import urllib.request
    from io import BytesIO
except ImportError:
    urllib = None
    BytesIO = None


# =====================================================================
# Localization Dictionaries (English & Khmer / ភាសាខ្មែរ)
# =====================================================================
TRANSLATIONS = {
    "en": {
        "app_title": "Media Tools Pro",
        "app_subtitle": "Universal Video Downloader & Multimedia Processing Studio",
        "version": "v3.0 Desktop Edition",
        "tab_universal": " Universal / YouTube ",
        "tab_tiktok": " TikTok HD ",
        "tab_instagram": " Instagram Reels ",
        "tab_facebook": " Facebook & Social ",
        "tab_playlist": " Batch Playlist ",
        "tab_audio": " Audio Extractor ",
        "tab_remove_bg": " Remove BG (AI) ",
        "tab_frame": " Frame Extractor ",
        "tab_cutter": " Audio Cutter ",
        "tab_logs": " Activity Logs ",
        
        # Common
        "url_label": "Media / Video URL:",
        "url_placeholder": "Paste a video URL (e.g., https://youtube.com/watch?v=...)",
        "dest_label": "Save Destination Directory:",
        "browse": "Browse...",
        "analyze": "Analyze URL",
        "download": "Start Download",
        "cancel": "Cancel",
        "reset": "Reset",
        "status_ready": "Ready for input",
        "status_analyzing": "Analyzing URL and retrieving stream metadata...",
        "status_downloading": "Downloading stream...",
        "status_complete": "Download completed successfully!",
        "status_cancelled": "Operation cancelled by user.",
        "status_error": "An error occurred during processing.",
        "speed": "Speed",
        "eta": "ETA",
        "size": "Size",
        "language_btn": "🇰🇭 ភាសាខ្មែរ",
        
        # Universal / YouTube
        "yt_title": "Universal Video & Stream Downloader",
        "yt_desc": "Supports YouTube (4K/1080p), TikTok, Instagram, Twitter, Vimeo, Bilibili, and 1000+ sites.",
        "preset_label": "Quality / Resolution Preset:",
        "preset_best": "Best Quality (Auto 4K / 1080p + Audio Mux)",
        "preset_1080p": "1080p Full HD (MP4)",
        "preset_720p": "720p HD (MP4)",
        "preset_480p": "480p Standard (MP4)",
        "preset_360p": "360p Small (MP4)",
        "preset_audio_mp3": "Audio Only (MP3 320kbps)",
        "opt_subtitles": "Download Subtitles (if available)",
        "opt_thumbnail": "Embed High-Res Thumbnail",
        "opt_metadata": "Embed Metadata Tags",

        # TikTok
        "tiktok_title": "TikTok No-Watermark HD Downloader",
        "tiktok_desc": "Download clean high-definition TikTok videos, sound tracks, and slideshows without watermarks.",
        "tiktok_opt_nowm": "Clean Video (No Watermark)",
        "tiktok_opt_wm": "Original Video (With Watermark)",
        "tiktok_opt_sound": "Original Sound Track (MP3)",

        # Instagram
        "ig_title": "Instagram Reels, Posts & Stories Downloader",
        "ig_desc": "Download original high-bitrate Reels videos, carousel photos, and video posts from Instagram.",
        "ig_opt_reels": "Full HD Video Reel (MP4)",
        "ig_opt_audio": "Audio Track (MP3)",

        # Remove Background
        "bg_title": "AI Image Background Remover & Matting Studio",
        "bg_desc": "Remove image backgrounds with neural matting or color thresholding and replace with custom backdrops.",
        "bg_open_btn": "Open Source Image...",
        "bg_remove_btn": "Remove Background Now",
        "bg_save_btn": "Save Cutout File...",
        "bg_mode_transparent": "Transparent Alpha PNG",
        "bg_mode_white": "Solid White Studio",
        "bg_mode_black": "Solid Black Studio",
        "bg_mode_green": "Chroma Key Green",

        # Facebook & Social
        "fb_title": "Facebook, Reels & Social Clips Downloader",
        "fb_desc": "Download public videos, reels, clips, and shorts from Facebook, Instagram & TikTok.",
        "fb_quality_hd": "HD Quality (High Definition)",
        "fb_quality_sd": "SD Quality (Standard Definition)",
        "fb_quality_audio": "Extract Audio (MP3)",

        # Playlist
        "pl_title": "Batch YouTube Playlist Downloader",
        "pl_desc": "Analyze entire playlists, select specific items, and download in batch queue.",
        "pl_fetch_btn": "Fetch Playlist Items",
        "pl_select_all": "Select All",
        "pl_deselect_all": "Deselect All",
        "pl_download_selected": "Download Selected Items",
        "pl_col_idx": "#",
        "pl_col_title": "Title",
        "pl_col_duration": "Duration",
        "pl_col_status": "Status",

        # Audio Extractor
        "aud_title": "Audio Stream Downloader & Formatter",
        "aud_desc": "Extract studio-grade audio tracks with custom bitrates and metadata.",
        "aud_format_label": "Output Audio Format:",
        "aud_bitrate_label": "Bitrate Quality:",

        # Frame Extractor
        "frame_title": "Video Frame Snapshot Extractor",
        "frame_desc": "Seek through local video files frame-by-frame and capture lossless image stills.",
        "frame_open_btn": "Open Local Video...",
        "frame_capture_btn": "Capture Current Frame",
        "frame_batch_btn": "Batch Extract (1 frame / sec)",
        "frame_save_btn": "Save Captured Frames",

        # Audio Cutter
        "cutter_title": "Audio Waveform Cutter & Trimmer",
        "cutter_desc": "Load audio files, inspect waveforms, and slice precise segments.",
        "cutter_open_btn": "Open Audio File...",
        "cutter_start": "Start Time (HH:MM:SS):",
        "cutter_end": "End Time (HH:MM:SS):",
        "cutter_trim_btn": "Trim and Save Audio Segment",
    },
    "km": {
        "app_title": "Media Tools Pro",
        "app_subtitle": "កម្មវិធីទាញយកវីដេអូ និងកែច្នៃមេឌៀកម្រិតខ្ពស់",
        "version": "v3.0 កំណែ Desktop",
        "tab_universal": " ទាញយកវីដេអូទូទៅ / YouTube ",
        "tab_tiktok": " TikTok គ្មាន Watermark ",
        "tab_instagram": " Instagram Reels ",
        "tab_facebook": " Facebook & Social ",
        "tab_playlist": " បញ្ជីចាក់ (Playlist) ",
        "tab_audio": " ទាញយកសំឡេង ",
        "tab_remove_bg": " លុបផ្ទៃខាងក្រោយរូបភាព ",
        "tab_frame": " ចាប់យករូបភាពពីវីដេអូ ",
        "tab_cutter": " កាត់តសំឡេង ",
        "tab_logs": " កំណត់ត្រាសកម្មភាព ",
        
        # Common
        "url_label": "តំណភ្ជាប់វីដេអូ ឬមេឌៀ (URL):",
        "url_placeholder": "បិទភ្ជាប់ URL វីដេអូ (ឧ. https://youtube.com/watch?v=...)",
        "dest_label": "ទីតាំងរក្សាទុកឯកសារ:",
        "browse": "ជ្រើសរើស...",
        "analyze": "វិភាគតំណភ្ជាប់",
        "download": "ចាប់ផ្តើមទាញយក",
        "cancel": "បោះបង់",
        "reset": "កំណត់ឡើងវិញ",
        "status_ready": "ត្រៀមខ្លួនរួចរាល់សម្រាប់ការបញ្ចូល",
        "status_analyzing": "កំពុងវិភាគតំណភ្ជាប់ និងទាញយកទិន្នន័យ...",
        "status_downloading": "កំពុងទាញយកមេឌៀ...",
        "status_complete": "ការទាញយកបានជោគជ័យពេញលេញ!",
        "status_cancelled": "ប្រតិបត្តិការត្រូវបានបោះបង់។",
        "status_error": "មានបញ្ហាក្នុងដំណើរការ។",
        "speed": "ល្បឿន",
        "eta": "រយៈពេលនៅសល់",
        "size": "ទំហំ",
        "language_btn": "🇺🇸 English",
        
        # Universal / YouTube
        "yt_title": "ឧបករណ៍ទាញយកវីដេអូគ្រប់ប្រភេទ (YouTube & គេហទំព័រជាង 1000+)",
        "yt_desc": "គាំទ្រ YouTube (4K/1080p), TikTok, Instagram, Twitter, Vimeo, Bilibili និងគេហទំព័រជាច្រើនទៀត។",
        "preset_label": "កម្រិតគុណភាពវីដេអូ:",
        "preset_best": "គុណភាពខ្ពស់បំផុត (Auto 4K / 1080p + បញ្ចូលសំឡេង)",
        "preset_1080p": "1080p Full HD (MP4)",
        "preset_720p": "720p HD (MP4)",
        "preset_480p": "480p កម្រិតធម្មតា (MP4)",
        "preset_360p": "360p កម្រិតទាប (MP4)",
        "preset_audio_mp3": "ទាញយកតែសំឡេង (MP3 320kbps)",
        "opt_subtitles": "ទាញយកអក្សររត់ពីក្រោម (Subtitles)",
        "opt_thumbnail": "បញ្ចូលរូបភាពគម្រប (Thumbnail)",
        "opt_metadata": "បញ្ចូលព័ត៌មាន Metadata",

        # TikTok
        "tiktok_title": "ទាញយកវីដេអូ TikTok គ្មាន Watermark",
        "tiktok_desc": "ទាញយកវីដេអូ TikTok កម្រិតច្បាស់ HD គ្មានជាប់ផ្លាកសញ្ញា Watermark និងទាញយកសំឡេងសុទ្ធ។",
        "tiktok_opt_nowm": "វីដេអូគ្មាន Watermark (Clean HD)",
        "tiktok_opt_wm": "វីដេអូដើម (មាន Watermark)",
        "tiktok_opt_sound": "សំឡេងសុទ្ធ Original Sound (MP3)",

        # Instagram
        "ig_title": "ទាញយក Instagram Reels & Posts",
        "ig_desc": "ទាញយក Reels កម្រិតច្បាស់ Full HD 1080p រូបភាព Carousel និងវីដេអូ IG យ៉ាងរហ័ស។",
        "ig_opt_reels": "វីដេអូ Reels Full HD (MP4)",
        "ig_opt_audio": "សំឡេង Reels (MP3)",

        # Remove Background
        "bg_title": "ឧបករណ៍លុបផ្ទៃខាងក្រោយរូបភាព (AI BG Remover)",
        "bg_desc": "លុបផ្ទៃខាងក្រោយរូបភាពស្វ័យប្រវត្តិកម្រិត Alpha Matting និងជំនួសផ្ទៃខាងក្រោយថ្មី។",
        "bg_open_btn": "បើករូបភាពក្នុងកុំព្យូទ័រ...",
        "bg_remove_btn": "ចាប់ផ្តើមលុបផ្ទៃខាងក្រោយ",
        "bg_save_btn": "រក្សាទុកឯកសារ Cutout...",
        "bg_mode_transparent": "ផ្ទៃថ្លា Transparent (PNG)",
        "bg_mode_white": "ផ្ទៃពណ៌ស (Studio White)",
        "bg_mode_black": "ផ្ទៃពណ៌ខ្មៅ (Studio Black)",
        "bg_mode_green": "ផ្ទៃពណ៌បៃតង Chroma Key",

        # Facebook & Social
        "fb_title": "ទាញយកវីដេអូ និង Reels ពី Facebook",
        "fb_desc": "ទាញយកវីដេអូសាធារណៈ Reels និង Clips ពី Facebook, Instagram និង TikTok។",
        "fb_quality_hd": "កម្រិតច្បាស់ HD",
        "fb_quality_sd": "កម្រិតធម្មតា SD",
        "fb_quality_audio": "ទាញយកតែសំឡេង MP3",

        # Playlist
        "pl_title": "ទាញយកបញ្ជីចាក់ YouTube (Playlist Batch)",
        "pl_desc": "វិភាគបញ្ជីចាក់ទាំងមូល ជ្រើសរើសវីដេអូដែលចង់បាន និងទាញយកជាបន្តបន្ទាប់។",
        "pl_fetch_btn": "ទាញយកទិន្នន័យបញ្ជីចាក់",
        "pl_select_all": "ជ្រើសរើសទាំងអស់",
        "pl_deselect_all": "ដោះការជ្រើសរើស",
        "pl_download_selected": "ទាញយកវីដេអូដែលបានជ្រើស",
        "pl_col_idx": "ល.រ",
        "pl_col_title": "ចំណងជើង",
        "pl_col_duration": "ថិរវេលា",
        "pl_col_status": "ស្ថានភាព",

        # Audio Extractor
        "aud_title": "ឧបករណ៍ស្រង់ និងទាញយកសំឡេង",
        "aud_desc": "ស្រង់យកសំឡេងគុណភាពខ្ពស់កម្រិតស្ទូឌីយោ ជាមួយជម្រើស Bitrate និងទម្រង់ចម្រុះ។",
        "aud_format_label": "ទម្រង់ឯកសារសំឡេង:",
        "aud_bitrate_label": "កម្រិតគុណភាព Bitrate:",

        # Frame Extractor
        "frame_title": "ឧបករណ៍ចាប់យករូបភាពពីវីដេអូ",
        "frame_desc": "បើកឯកសារវីដេអូក្នុងកុំព្យូទ័រ និងចាប់យករូបភាពតាមពេលវេលាជាក់លាក់ដោយគ្មានបាត់បង់គុណភាព។",
        "frame_open_btn": "បើកវីដេអូក្នុងម៉ាស៊ីន...",
        "frame_capture_btn": "ចាប់យករូបភាពបច្ចុប្បន្ន",
        "frame_batch_btn": "ចាប់យករូបភាពស្វ័យប្រវត្តិ (1 រូប / វិនាទី)",
        "frame_save_btn": "រក្សាទុករូបភាពទាំងអស់",

        # Audio Cutter
        "cutter_title": "ឧបករណ៍កាត់តសំឡេងជាមួយ Waveform",
        "cutter_desc": "ផ្ទុកឯកសារសំឡេង មើលរលកសំឡេង និងកាត់ផ្នែកដែលចង់បានយ៉ាងជាក់លាក់។",
        "cutter_open_btn": "បើកឯកសារសំឡេង...",
        "cutter_start": "ពេលវេលាចាប់ផ្តើម (ម៉ោង:នាទី:វិនាទី):",
        "cutter_end": "ពេលវេលាបញ្ចប់ (ម៉ោង:នាទី:វិនាទី):",
        "cutter_trim_btn": "កាត់ និងរក្សាទុកផ្នែកសំឡេង",
    }
}


class MediaToolsProApp:
    """Main Desktop GUI Application for Media Tools Pro."""
    
    def __init__(self, root: tk.Tk):
        self.root = root
        self.lang = "en"
        self.t = TRANSLATIONS[self.lang]

        self.root.title(f"{self.t['app_title']} - {self.t['version']}")
        self.root.geometry("1000x740")
        self.root.minsize(840, 620)
        self.root.configure(bg="#e6edf5")

        # Application State
        self.download_queue = queue.Queue()
        self.current_download_process = None
        self.is_downloading = False
        self.cancel_requested = False
        
        # Media state
        self.video_cap = None
        self.video_path = None
        self.video_fps = 30.0
        self.video_total_frames = 0
        self.video_duration_sec = 0.0
        self.captured_frames = []
        
        self.audio_path = None
        self.audio_duration_sec = 0.0
        self.audio_peaks = []
        
        self.playlist_items = []
        self.thumbnail_image_ref = None

        # Remove background state
        self.bg_image_path = None
        self.bg_orig_image = None
        self.bg_processed_image = None
        self.bg_preview_photo = None
        self.bg_orig_preview_photo = None

        # Check dependencies
        self.has_ffmpeg = self._check_ffmpeg()

        self._setup_styles()
        self._build_ui()
        self._start_queue_poller()

    # -------------------------------------------------------------
    # Styling and Theme Configuration
    # -------------------------------------------------------------
    def _setup_styles(self):
        style = ttk.Style()
        style.theme_use("clam")
        
        # Colors
        self.c_bg = "#e6edf5"
        self.c_card = "#e6edf5"
        self.c_card_inset = "#dbe3ed"
        self.c_primary = "#0ea5e9"  # Sky
        self.c_accent_green = "#10b981"  # Emerald
        self.c_accent_red = "#ef4444"  # Red
        self.c_accent_purple = "#8b5cf6"  # Purple
        self.c_text_dark = "#0f172a"
        self.c_text_muted = "#475569"

        # Configure TTK widgets
        style.configure("TNotebook", background=self.c_bg, borderwidth=0)
        style.configure("TNotebook.Tab", background="#d5e0ec", foreground="#334155", font=("Segoe UI", 10, "bold"), padding=[14, 8])
        style.map("TNotebook.Tab", background=[("selected", "#ffffff")], foreground=[("selected", "#0ea5e9")])
        
        style.configure("TFrame", background=self.c_bg)
        style.configure("TLabel", background=self.c_bg, foreground=self.c_text_dark, font=("Segoe UI", 9))
        style.configure("Header.TLabel", font=("Segoe UI", 13, "bold"), foreground=self.c_text_dark)
        style.configure("Muted.TLabel", foreground=self.c_text_muted, font=("Segoe UI", 9))
        
        style.configure("TProgressbar", thickness=16, troughcolor="#d1dce9", background=self.c_accent_green)
        style.configure("Treeview", background="#ffffff", fieldbackground="#ffffff", foreground=self.c_text_dark, font=("Segoe UI", 9), rowheight=26)
        style.configure("Treeview.Heading", font=("Segoe UI", 9, "bold"), background="#e2e8f0")

    def _check_ffmpeg(self) -> bool:
        """Verify if FFmpeg binary is available on PATH."""
        return shutil.which("ffmpeg") is not None

    # -------------------------------------------------------------
    # Main UI Layout
    # -------------------------------------------------------------
    def _build_ui(self):
        # 1. Top Header Banner
        header = tk.Frame(self.root, bg=self.c_bg, padx=20, pady=10, relief="flat")
        header.pack(fill="x")

        left_header = tk.Frame(header, bg=self.c_bg)
        left_header.pack(side="left")

        self.title_lbl = tk.Label(
            left_header, 
            text=f"⚡ {self.t['app_title']}", 
            font=("Segoe UI", 16, "bold"), 
            bg=self.c_bg, 
            fg=self.c_text_dark
        )
        self.title_lbl.pack(anchor="w")

        self.subtitle_lbl = tk.Label(
            left_header, 
            text=self.t["app_subtitle"], 
            font=("Segoe UI", 9), 
            bg=self.c_bg, 
            fg=self.c_text_muted
        )
        self.subtitle_lbl.pack(anchor="w")

        # Right Header: Status pills & Language button
        right_header = tk.Frame(header, bg=self.c_bg)
        right_header.pack(side="right", fill="y")

        # Diagnostics pill
        ffmpeg_color = "#16a34a" if self.has_ffmpeg else "#dc2626"
        ffmpeg_text = "FFmpeg: OK" if self.has_ffmpeg else "FFmpeg: Missing (720p Max)"
        ffmpeg_lbl = tk.Label(
            right_header, 
            text=ffmpeg_text, 
            font=("Consolas", 8, "bold"), 
            bg="#ffffff", 
            fg=ffmpeg_color, 
            relief="solid", 
            bd=1, 
            padx=8, 
            pady=3
        )
        ffmpeg_lbl.pack(side="left", padx=(0, 10))

        self.lang_btn = tk.Button(
            right_header, 
            text=self.t["language_btn"], 
            font=("Segoe UI", 9, "bold"), 
            bg="#ffffff", 
            fg=self.c_text_dark, 
            relief="solid", 
            bd=1, 
            padx=12, 
            pady=4, 
            cursor="hand2", 
            command=self._toggle_language
        )
        self.lang_btn.pack(side="left")

        # 2. Main Tabs Notebook
        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(fill="both", expand=True, padx=16, pady=(6, 8))

        # Tab 1: Universal / YouTube
        self.tab_yt = ttk.Frame(self.notebook, padding=16)
        self.notebook.add(self.tab_yt, text=self.t["tab_universal"])
        self._build_universal_tab()

        # Tab 2: TikTok Downloader
        self.tab_tiktok = ttk.Frame(self.notebook, padding=16)
        self.notebook.add(self.tab_tiktok, text=self.t["tab_tiktok"])
        self._build_tiktok_tab()

        # Tab 3: Instagram Downloader
        self.tab_ig = ttk.Frame(self.notebook, padding=16)
        self.notebook.add(self.tab_ig, text=self.t["tab_instagram"])
        self._build_instagram_tab()

        # Tab 4: Facebook & Social
        self.tab_fb = ttk.Frame(self.notebook, padding=16)
        self.notebook.add(self.tab_fb, text=self.t["tab_facebook"])
        self._build_facebook_tab()

        # Tab 5: Playlist Batch
        self.tab_pl = ttk.Frame(self.notebook, padding=16)
        self.notebook.add(self.tab_pl, text=self.t["tab_playlist"])
        self._build_playlist_tab()

        # Tab 6: Audio Downloader
        self.tab_aud = ttk.Frame(self.notebook, padding=16)
        self.notebook.add(self.tab_aud, text=self.t["tab_audio"])
        self._build_audio_tab()

        # Tab 7: Remove Background Studio
        self.tab_bg = ttk.Frame(self.notebook, padding=16)
        self.notebook.add(self.tab_bg, text=self.t["tab_remove_bg"])
        self._build_remove_bg_tab()

        # Tab 8: Frame Extractor
        self.tab_frame = ttk.Frame(self.notebook, padding=16)
        self.notebook.add(self.tab_frame, text=self.t["tab_frame"])
        self._build_frame_tab()

        # Tab 9: Audio Cutter
        self.tab_cutter = ttk.Frame(self.notebook, padding=16)
        self.notebook.add(self.tab_cutter, text=self.t["tab_cutter"])
        self._build_cutter_tab()

        # Tab 10: Logs Console
        self.tab_logs = ttk.Frame(self.notebook, padding=16)
        self.notebook.add(self.tab_logs, text=self.t["tab_logs"])
        self._build_logs_tab()

        # 3. Global Bottom Progress & Status Bar
        self._build_global_status_bar()

    def _toggle_language(self):
        self.lang = "km" if self.lang == "en" else "en"
        self.t = TRANSLATIONS[self.lang]
        
        # Update Main Header
        self.root.title(f"{self.t['app_title']} - {self.t['version']}")
        self.title_lbl.config(text=f"⚡ {self.t['app_title']}")
        self.subtitle_lbl.config(text=self.t["app_subtitle"])
        self.lang_btn.config(text=self.t["language_btn"])
        
        # Update Notebook tab titles
        self.notebook.tab(0, text=self.t["tab_universal"])
        self.notebook.tab(1, text=self.t["tab_tiktok"])
        self.notebook.tab(2, text=self.t["tab_instagram"])
        self.notebook.tab(3, text=self.t["tab_facebook"])
        self.notebook.tab(4, text=self.t["tab_playlist"])
        self.notebook.tab(5, text=self.t["tab_audio"])
        self.notebook.tab(6, text=self.t["tab_remove_bg"])
        self.notebook.tab(7, text=self.t["tab_frame"])
        self.notebook.tab(8, text=self.t["tab_cutter"])
        self.notebook.tab(9, text=self.t["tab_logs"])

        self.log_message(f"🌐 Language switched to: {'Khmer (ភាសាខ្មែរ)' if self.lang == 'km' else 'English'}")

    # -------------------------------------------------------------
    # Global Bottom Status & Progress Bar
    # -------------------------------------------------------------
    def _build_global_status_bar(self):
        status_frame = tk.Frame(self.root, bg="#dbe3ed", padx=16, pady=8, relief="flat")
        status_frame.pack(fill="x", side="bottom")

        # Top line: Status text & Speed/ETA
        top_row = tk.Frame(status_frame, bg="#dbe3ed")
        top_row.pack(fill="x", pady=(0, 4))

        self.status_lbl = tk.Label(
            top_row, 
            text=f"● {self.t['status_ready']}", 
            font=("Segoe UI", 9, "bold"), 
            bg="#dbe3ed", 
            fg=self.c_text_dark
        )
        self.status_lbl.pack(side="left")

        self.stats_lbl = tk.Label(
            top_row, 
            text="0% • 0.0 MB/s • ETA --:--", 
            font=("Consolas", 9), 
            bg="#dbe3ed", 
            fg=self.c_text_muted
        )
        self.stats_lbl.pack(side="right")

        # Progress bar
        self.global_progress = ttk.Progressbar(status_frame, mode="determinate", maximum=100)
        self.global_progress.pack(fill="x")

    # =============================================================
    # Tab 1: Universal / YouTube Downloader
    # =============================================================
    def _build_universal_tab(self):
        f = self.tab_yt
        
        # Section Title & Description
        tk.Label(f, text=self.t["yt_title"], font=("Segoe UI", 12, "bold"), bg=self.c_bg).pack(anchor="w")
        tk.Label(f, text=self.t["yt_desc"], font=("Segoe UI", 9), bg=self.c_bg, fg=self.c_text_muted).pack(anchor="w", pady=(0, 10))

        # URL Input with Paste & Analyze
        tk.Label(f, text=self.t["url_label"], font=("Segoe UI", 9, "bold"), bg=self.c_bg).pack(anchor="w")
        url_box = tk.Frame(f, bg=self.c_bg)
        url_box.pack(fill="x", pady=(2, 10))

        self.yt_url_var = tk.StringVar()
        self.yt_url_entry = tk.Entry(url_box, textvariable=self.yt_url_var, font=("Consolas", 10), relief="solid", bd=1)
        self.yt_url_entry.pack(side="left", fill="x", expand=True, ipady=5)

        tk.Button(
            url_box, text="📋 Paste", bg="#ffffff", fg=self.c_text_dark, relief="solid", bd=1,
            command=lambda: self._paste_to_entry(self.yt_url_entry)
        ).pack(side="left", padx=(6, 0), ipadx=6)

        self.yt_analyze_btn = tk.Button(
            url_box, text=f"🔍 {self.t['analyze']}", bg="#0ea5e9", fg="#ffffff", font=("Segoe UI", 9, "bold"),
            relief="flat", cursor="hand2", command=lambda: self._start_analysis(self.yt_url_var.get(), self._on_yt_analyzed)
        )
        self.yt_analyze_btn.pack(side="left", padx=(6, 0), ipadx=10)

        # Video Preview & Info Card
        self.yt_info_card = tk.Frame(f, bg="#ffffff", relief="solid", bd=1, padx=12, pady=10)
        self.yt_info_card.pack(fill="x", pady=(0, 10))

        self.yt_thumb_lbl = tk.Label(self.yt_info_card, text="[No Thumbnail]", bg="#e2e8f0", width=16, height=5)
        self.yt_thumb_lbl.pack(side="left", padx=(0, 12))

        info_text_frame = tk.Frame(self.yt_info_card, bg="#ffffff")
        info_text_frame.pack(side="left", fill="both", expand=True)

        self.yt_video_title = tk.Label(info_text_frame, text="No video analyzed yet", font=("Segoe UI", 10, "bold"), bg="#ffffff", wraplength=560, justify="left")
        self.yt_video_title.pack(anchor="w")

        self.yt_video_meta = tk.Label(info_text_frame, text="Uploader: -- • Duration: -- • Views: --", font=("Segoe UI", 9), bg="#ffffff", fg=self.c_text_muted)
        self.yt_video_meta.pack(anchor="w", pady=(4, 0))

        # Quality Preset Selector
        quality_box = tk.Frame(f, bg=self.c_bg)
        quality_box.pack(fill="x", pady=(0, 10))

        tk.Label(quality_box, text=self.t["preset_label"], font=("Segoe UI", 9, "bold"), bg=self.c_bg).pack(anchor="w")
        self.yt_quality_var = tk.StringVar(value="best")
        self.yt_quality_combo = ttk.Combobox(
            quality_box, 
            textvariable=self.yt_quality_var,
            values=[
                "best - Auto Best (4K / 1080p + Audio)",
                "1080p - Full HD (MP4)",
                "720p - HD (MP4)",
                "480p - Standard (MP4)",
                "360p - Low Data (MP4)",
                "audio_mp3 - MP3 High Bitrate (320 kbps)",
                "audio_wav - Lossless Master (WAV)",
            ],
            state="readonly"
        )
        self.yt_quality_combo.current(0)
        self.yt_quality_combo.pack(fill="x", pady=(2, 0), ipady=3)

        # Options Checkboxes
        opts_box = tk.Frame(f, bg=self.c_bg)
        opts_box.pack(fill="x", pady=(0, 10))

        self.opt_subtitles = tk.BooleanVar(value=False)
        self.opt_thumbnail = tk.BooleanVar(value=True)
        self.opt_metadata = tk.BooleanVar(value=True)

        tk.Checkbutton(opts_box, text=self.t["opt_subtitles"], variable=self.opt_subtitles, bg=self.c_bg).pack(side="left", padx=(0, 16))
        tk.Checkbutton(opts_box, text=self.t["opt_thumbnail"], variable=self.opt_thumbnail, bg=self.c_bg).pack(side="left", padx=(0, 16))
        tk.Checkbutton(opts_box, text=self.t["opt_metadata"], variable=self.opt_metadata, bg=self.c_bg).pack(side="left")

        # Destination Folder
        dest_box = tk.Frame(f, bg=self.c_bg)
        dest_box.pack(fill="x", pady=(0, 12))
        tk.Label(dest_box, text=self.t["dest_label"], font=("Segoe UI", 9, "bold"), bg=self.c_bg).pack(anchor="w")
        
        dest_input_box = tk.Frame(dest_box, bg=self.c_bg)
        dest_input_box.pack(fill="x", pady=(2, 0))
        self.yt_dest_entry = tk.Entry(dest_input_box, font=("Segoe UI", 9), relief="solid", bd=1)
        self.yt_dest_entry.insert(0, os.path.expanduser("~/Downloads"))
        self.yt_dest_entry.pack(side="left", fill="x", expand=True, ipady=4)

        tk.Button(
            dest_input_box, text=f"📁 {self.t['browse']}", bg="#ffffff", fg=self.c_text_dark, relief="solid", bd=1,
            command=lambda: self._browse_folder(self.yt_dest_entry)
        ).pack(side="left", padx=(6, 0), ipadx=8)

        # Action Buttons
        action_box = tk.Frame(f, bg=self.c_bg)
        action_box.pack(fill="x", pady=(4, 0))

        self.yt_download_btn = tk.Button(
            action_box, text=f"⬇ {self.t['download']}", bg="#10b981", fg="#ffffff", font=("Segoe UI", 11, "bold"),
            relief="flat", cursor="hand2", padx=20, pady=8, command=self._start_universal_download
        )
        self.yt_download_btn.pack(side="left", fill="x", expand=True, padx=(0, 8))

        self.yt_cancel_btn = tk.Button(
            action_box, text=f"✕ {self.t['cancel']}", bg="#ef4444", fg="#ffffff", font=("Segoe UI", 10, "bold"),
            relief="flat", cursor="hand2", padx=16, pady=8, command=self._cancel_download, state="disabled"
        )
        self.yt_cancel_btn.pack(side="left")

    def _on_yt_analyzed(self, info: dict):
        """Callback when video metadata analysis finishes."""
        if not info:
            return
        title = info.get("title", "Unknown Title")
        uploader = info.get("uploader", info.get("channel", "Unknown"))
        duration = str(timedelta(seconds=int(info.get("duration", 0))))
        views = f"{info.get('view_count', 0):,}" if info.get("view_count") else "N/A"

        self.yt_video_title.config(text=title)
        self.yt_video_meta.config(text=f"Author: {uploader}  •  Duration: {duration}  •  Views: {views}")

        # Fetch thumbnail if PIL is available
        thumb_url = info.get("thumbnail")
        if thumb_url and Image and ImageTk and urllib:
            def load_thumb():
                try:
                    req = urllib.request.Request(thumb_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req, timeout=5) as response:
                        img_data = response.read()
                    image = Image.open(BytesIO(img_data)).resize((120, 68), Image.Resampling.LANCZOS)
                    photo = ImageTk.PhotoImage(image)
                    self.root.after(0, lambda: self._update_yt_thumb(photo))
                except Exception as e:
                    self.log_message(f"Thumbnail load error: {e}")
            threading.Thread(target=load_thumb, daemon=True).start()

    def _update_yt_thumb(self, photo):
        self.thumbnail_image_ref = photo
        self.yt_thumb_lbl.config(image=photo, text="", width=120, height=68)

    def _start_universal_download(self):
        url = self.yt_url_var.get().strip()
        dest = self.yt_dest_entry.get().strip()
        if not url:
            messagebox.showwarning("Warning", "Please enter a valid video URL.")
            return

        quality_choice = self.yt_quality_combo.get().split(" - ")[0]
        
        # Build yt-dlp options based on quality choice
        ydl_opts = {
            'outtmpl': os.path.join(dest, '%(title).100s.%(ext)s'),
            'trim_file_name': 100,
            'nocheckcertificate': True,
            'ignoreerrors': False,
            'no_color': True,
        }

        if quality_choice == "best":
            if self.has_ffmpeg:
                ydl_opts['format'] = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best'
                ydl_opts['merge_output_format'] = 'mp4'
            else:
                ydl_opts['format'] = 'best[ext=mp4]/best'
        elif quality_choice == "1080p":
            ydl_opts['format'] = 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080]'
            ydl_opts['merge_output_format'] = 'mp4'
        elif quality_choice == "720p":
            ydl_opts['format'] = 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720]'
            ydl_opts['merge_output_format'] = 'mp4'
        elif quality_choice == "480p":
            ydl_opts['format'] = 'bestvideo[height<=480][ext=mp4]+bestaudio/best[height<=480]'
        elif quality_choice == "360p":
            ydl_opts['format'] = 'bestvideo[height<=360][ext=mp4]+bestaudio/best[height<=360]'
        elif quality_choice == "audio_mp3":
            ydl_opts['format'] = 'bestaudio/best'
            ydl_opts['postprocessors'] = [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '320',
            }]
        elif quality_choice == "audio_wav":
            ydl_opts['format'] = 'bestaudio/best'
            ydl_opts['postprocessors'] = [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'wav',
            }]

        if self.opt_thumbnail.get():
            ydl_opts['writethumbnail'] = True
        if self.opt_metadata.get():
            ydl_opts['addmetadata'] = True

        self._execute_ytdlp_download(url, ydl_opts, self.yt_download_btn, self.yt_cancel_btn)

    # =============================================================
    # Tab 2: TikTok No-Watermark Downloader
    # =============================================================
    def _build_tiktok_tab(self):
        f = self.tab_tiktok
        
        # Section Header
        tk.Label(f, text=self.t["tiktok_title"], font=("Segoe UI", 12, "bold"), bg=self.c_bg).pack(anchor="w")
        tk.Label(f, text=self.t["tiktok_desc"], font=("Segoe UI", 9), bg=self.c_bg, fg=self.c_text_muted).pack(anchor="w", pady=(0, 10))

        # URL Input
        tk.Label(f, text=self.t["url_label"], font=("Segoe UI", 9, "bold"), bg=self.c_bg).pack(anchor="w")
        url_box = tk.Frame(f, bg=self.c_bg)
        url_box.pack(fill="x", pady=(2, 10))

        self.tiktok_url_var = tk.StringVar()
        self.tiktok_url_entry = tk.Entry(url_box, textvariable=self.tiktok_url_var, font=("Consolas", 10), relief="solid", bd=1)
        self.tiktok_url_entry.pack(side="left", fill="x", expand=True, ipady=5)

        tk.Button(
            url_box, text="📋 Paste", bg="#ffffff", fg=self.c_text_dark, relief="solid", bd=1,
            command=lambda: self._paste_to_entry(self.tiktok_url_entry)
        ).pack(side="left", padx=(6, 0), ipadx=6)

        self.tiktok_analyze_btn = tk.Button(
            url_box, text=f"🔍 {self.t['analyze']}", bg="#0ea5e9", fg="#ffffff", font=("Segoe UI", 9, "bold"),
            relief="flat", cursor="hand2", command=lambda: self._start_analysis(self.tiktok_url_var.get(), self._on_tiktok_analyzed)
        )
        self.tiktok_analyze_btn.pack(side="left", padx=(6, 0), ipadx=10)

        # TikTok Info Card
        self.tiktok_info_card = tk.Frame(f, bg="#ffffff", relief="solid", bd=1, padx=12, pady=10)
        self.tiktok_info_card.pack(fill="x", pady=(0, 10))

        self.tiktok_thumb_lbl = tk.Label(self.tiktok_info_card, text="[TikTok]", bg="#e2e8f0", width=16, height=5)
        self.tiktok_thumb_lbl.pack(side="left", padx=(0, 12))

        info_text_frame = tk.Frame(self.tiktok_info_card, bg="#ffffff")
        info_text_frame.pack(side="left", fill="both", expand=True)

        self.tiktok_video_title = tk.Label(info_text_frame, text="No TikTok analyzed yet", font=("Segoe UI", 10, "bold"), bg="#ffffff", wraplength=560, justify="left")
        self.tiktok_video_title.pack(anchor="w")

        self.tiktok_video_meta = tk.Label(info_text_frame, text="Creator: -- • Duration: --", font=("Segoe UI", 9), bg="#ffffff", fg=self.c_text_muted)
        self.tiktok_video_meta.pack(anchor="w", pady=(4, 0))

        # Format / Watermark Option
        tk.Label(f, text=self.t["preset_label"], font=("Segoe UI", 9, "bold"), bg=self.c_bg).pack(anchor="w", pady=(2, 2))
        self.tiktok_mode_var = tk.StringVar(value="nowm")
        radio_box = tk.Frame(f, bg=self.c_bg)
        radio_box.pack(fill="x", pady=(0, 10))

        tk.Radiobutton(radio_box, text=self.t["tiktok_opt_nowm"], variable=self.tiktok_mode_var, value="nowm", bg=self.c_bg).pack(side="left", padx=(0, 16))
        tk.Radiobutton(radio_box, text=self.t["tiktok_opt_wm"], variable=self.tiktok_mode_var, value="wm", bg=self.c_bg).pack(side="left", padx=(0, 16))
        tk.Radiobutton(radio_box, text=self.t["tiktok_opt_sound"], variable=self.tiktok_mode_var, value="audio", bg=self.c_bg).pack(side="left")

        # Destination Folder
        dest_box = tk.Frame(f, bg=self.c_bg)
        dest_box.pack(fill="x", pady=(0, 12))
        tk.Label(dest_box, text=self.t["dest_label"], font=("Segoe UI", 9, "bold"), bg=self.c_bg).pack(anchor="w")
        dest_in = tk.Frame(dest_box, bg=self.c_bg)
        dest_in.pack(fill="x", pady=(2, 0))
        self.tiktok_dest_entry = tk.Entry(dest_in, font=("Segoe UI", 9), relief="solid", bd=1)
        self.tiktok_dest_entry.insert(0, os.path.expanduser("~/Downloads"))
        self.tiktok_dest_entry.pack(side="left", fill="x", expand=True, ipady=4)
        tk.Button(dest_in, text=f"📁 {self.t['browse']}", bg="#ffffff", fg=self.c_text_dark, relief="solid", bd=1,
                  command=lambda: self._browse_folder(self.tiktok_dest_entry)).pack(side="left", padx=(6, 0), ipadx=8)

        # Download Button
        self.tiktok_btn = tk.Button(
            f, text=f"⚡ {self.t['download']} TikTok (Clean HD)", bg="#000000", fg="#00f2fe", font=("Segoe UI", 11, "bold"),
            relief="flat", cursor="hand2", padx=20, pady=8, command=self._start_tiktok_download
        )
        self.tiktok_btn.pack(fill="x")

    def _on_tiktok_analyzed(self, info):
        title = info.get("title", "TikTok Video")
        uploader = info.get("uploader", info.get("uploader_id", "TikTok Creator"))
        duration = str(timedelta(seconds=int(info.get("duration", 0)))) if info.get("duration") else "00:15"
        self.tiktok_video_title.config(text=title)
        self.tiktok_video_meta.config(text=f"Creator: @{uploader}  •  Duration: {duration}")

    def _start_tiktok_download(self):
        url = self.tiktok_url_var.get().strip()
        dest = self.tiktok_dest_entry.get().strip()
        if not url:
            messagebox.showwarning("Warning", "Please enter a TikTok URL.")
            return

        choice = self.tiktok_mode_var.get()
        ydl_opts = {
            'outtmpl': os.path.join(dest, '%(title).100s_%(id)s.%(ext)s'),
            'trim_file_name': 100,
            'nocheckcertificate': True,
        }

        if choice == "audio":
            ydl_opts['format'] = 'bestaudio/best'
            ydl_opts['postprocessors'] = [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '320',
            }]
        elif choice == "wm":
            ydl_opts['format'] = 'best[ext=mp4]/best'
        else: # nowm
            ydl_opts['format'] = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best'
            if self.has_ffmpeg:
                ydl_opts['merge_output_format'] = 'mp4'

        self._execute_ytdlp_download(url, ydl_opts, self.tiktok_btn, None)

    # =============================================================
    # Tab 3: Instagram Reels & Posts Downloader
    # =============================================================
    def _build_instagram_tab(self):
        f = self.tab_ig
        
        # Section Header
        tk.Label(f, text=self.t["ig_title"], font=("Segoe UI", 12, "bold"), bg=self.c_bg).pack(anchor="w")
        tk.Label(f, text=self.t["ig_desc"], font=("Segoe UI", 9), bg=self.c_bg, fg=self.c_text_muted).pack(anchor="w", pady=(0, 10))

        # URL Input
        tk.Label(f, text=self.t["url_label"], font=("Segoe UI", 9, "bold"), bg=self.c_bg).pack(anchor="w")
        url_box = tk.Frame(f, bg=self.c_bg)
        url_box.pack(fill="x", pady=(2, 10))

        self.ig_url_var = tk.StringVar()
        self.ig_url_entry = tk.Entry(url_box, textvariable=self.ig_url_var, font=("Consolas", 10), relief="solid", bd=1)
        self.ig_url_entry.pack(side="left", fill="x", expand=True, ipady=5)

        tk.Button(
            url_box, text="📋 Paste", bg="#ffffff", fg=self.c_text_dark, relief="solid", bd=1,
            command=lambda: self._paste_to_entry(self.ig_url_entry)
        ).pack(side="left", padx=(6, 0), ipadx=6)

        self.ig_analyze_btn = tk.Button(
            url_box, text=f"🔍 {self.t['analyze']}", bg="#e1306c", fg="#ffffff", font=("Segoe UI", 9, "bold"),
            relief="flat", cursor="hand2", command=lambda: self._start_analysis(self.ig_url_var.get(), self._on_ig_analyzed)
        )
        self.ig_analyze_btn.pack(side="left", padx=(6, 0), ipadx=10)

        # Instagram Info Card
        self.ig_info_card = tk.Frame(f, bg="#ffffff", relief="solid", bd=1, padx=12, pady=10)
        self.ig_info_card.pack(fill="x", pady=(0, 10))

        self.ig_thumb_lbl = tk.Label(self.ig_info_card, text="[Instagram]", bg="#e2e8f0", width=16, height=5)
        self.ig_thumb_lbl.pack(side="left", padx=(0, 12))

        info_text_frame = tk.Frame(self.ig_info_card, bg="#ffffff")
        info_text_frame.pack(side="left", fill="both", expand=True)

        self.ig_video_title = tk.Label(info_text_frame, text="No Instagram post analyzed yet", font=("Segoe UI", 10, "bold"), bg="#ffffff", wraplength=560, justify="left")
        self.ig_video_title.pack(anchor="w")

        self.ig_video_meta = tk.Label(info_text_frame, text="Account: -- • Type: Reels / Post", font=("Segoe UI", 9), bg="#ffffff", fg=self.c_text_muted)
        self.ig_video_meta.pack(anchor="w", pady=(4, 0))

        # Format Options
        tk.Label(f, text=self.t["preset_label"], font=("Segoe UI", 9, "bold"), bg=self.c_bg).pack(anchor="w", pady=(2, 2))
        self.ig_mode_var = tk.StringVar(value="reels")
        radio_box = tk.Frame(f, bg=self.c_bg)
        radio_box.pack(fill="x", pady=(0, 10))

        tk.Radiobutton(radio_box, text=self.t["ig_opt_reels"], variable=self.ig_mode_var, value="reels", bg=self.c_bg).pack(side="left", padx=(0, 16))
        tk.Radiobutton(radio_box, text=self.t["ig_opt_audio"], variable=self.ig_mode_var, value="audio", bg=self.c_bg).pack(side="left")

        # Destination Folder
        dest_box = tk.Frame(f, bg=self.c_bg)
        dest_box.pack(fill="x", pady=(0, 12))
        tk.Label(dest_box, text=self.t["dest_label"], font=("Segoe UI", 9, "bold"), bg=self.c_bg).pack(anchor="w")
        dest_in = tk.Frame(dest_box, bg=self.c_bg)
        dest_in.pack(fill="x", pady=(2, 0))
        self.ig_dest_entry = tk.Entry(dest_in, font=("Segoe UI", 9), relief="solid", bd=1)
        self.ig_dest_entry.insert(0, os.path.expanduser("~/Downloads"))
        self.ig_dest_entry.pack(side="left", fill="x", expand=True, ipady=4)
        tk.Button(dest_in, text=f"📁 {self.t['browse']}", bg="#ffffff", fg=self.c_text_dark, relief="solid", bd=1,
                  command=lambda: self._browse_folder(self.ig_dest_entry)).pack(side="left", padx=(6, 0), ipadx=8)

        # Download Button
        self.ig_btn = tk.Button(
            f, text=f"📸 {self.t['download']} Instagram Reels (1080p)", bg="#e1306c", fg="#ffffff", font=("Segoe UI", 11, "bold"),
            relief="flat", cursor="hand2", padx=20, pady=8, command=self._start_instagram_download
        )
        self.ig_btn.pack(fill="x")

    def _on_ig_analyzed(self, info):
        title = info.get("title", "Instagram Reel / Post")
        uploader = info.get("uploader", info.get("uploader_id", "Instagram User"))
        self.ig_video_title.config(text=title[:100])
        self.ig_video_meta.config(text=f"Account: @{uploader}  •  Format: High Quality")

    def _start_instagram_download(self):
        url = self.ig_url_var.get().strip()
        dest = self.ig_dest_entry.get().strip()
        if not url:
            messagebox.showwarning("Warning", "Please enter an Instagram URL.")
            return

        choice = self.ig_mode_var.get()
        ydl_opts = {
            'outtmpl': os.path.join(dest, '%(title).100s_%(id)s.%(ext)s'),
            'trim_file_name': 100,
            'nocheckcertificate': True,
        }

        if choice == "audio":
            ydl_opts['format'] = 'bestaudio/best'
            ydl_opts['postprocessors'] = [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '320',
            }]
        else:
            ydl_opts['format'] = 'best[ext=mp4]/best'

        self._execute_ytdlp_download(url, ydl_opts, self.ig_btn, None)

    # =============================================================
    # Tab 4: Facebook & Social Downloader
    # =============================================================
    def _build_facebook_tab(self):
        f = self.tab_fb
        tk.Label(f, text=self.t["fb_title"], font=("Segoe UI", 12, "bold"), bg=self.c_bg).pack(anchor="w")
        tk.Label(f, text=self.t["fb_desc"], font=("Segoe UI", 9), bg=self.c_bg, fg=self.c_text_muted).pack(anchor="w", pady=(0, 12))

        # URL
        tk.Label(f, text=self.t["url_label"], font=("Segoe UI", 9, "bold"), bg=self.c_bg).pack(anchor="w")
        self.fb_url_var = tk.StringVar()
        fb_url_box = tk.Frame(f, bg=self.c_bg)
        fb_url_box.pack(fill="x", pady=(2, 10))

        self.fb_url_entry = tk.Entry(fb_url_box, textvariable=self.fb_url_var, font=("Consolas", 10), relief="solid", bd=1)
        self.fb_url_entry.pack(side="left", fill="x", expand=True, ipady=5)

        tk.Button(
            fb_url_box, text="📋 Paste", bg="#ffffff", fg=self.c_text_dark, relief="solid", bd=1,
            command=lambda: self._paste_to_entry(self.fb_url_entry)
        ).pack(side="left", padx=(6, 0), ipadx=6)

        # Quality Radio Buttons
        tk.Label(f, text=self.t["preset_label"], font=("Segoe UI", 9, "bold"), bg=self.c_bg).pack(anchor="w", pady=(6, 2))
        self.fb_quality_var = tk.StringVar(value="hd")
        radio_box = tk.Frame(f, bg=self.c_bg)
        radio_box.pack(fill="x", pady=(0, 10))

        tk.Radiobutton(radio_box, text=self.t["fb_quality_hd"], variable=self.fb_quality_var, value="hd", bg=self.c_bg).pack(side="left", padx=(0, 16))
        tk.Radiobutton(radio_box, text=self.t["fb_quality_sd"], variable=self.fb_quality_var, value="sd", bg=self.c_bg).pack(side="left", padx=(0, 16))
        tk.Radiobutton(radio_box, text=self.t["fb_quality_audio"], variable=self.fb_quality_var, value="mp3", bg=self.c_bg).pack(side="left")

        # Destination
        dest_box = tk.Frame(f, bg=self.c_bg)
        dest_box.pack(fill="x", pady=(0, 14))
        tk.Label(dest_box, text=self.t["dest_label"], font=("Segoe UI", 9, "bold"), bg=self.c_bg).pack(anchor="w")
        dest_in = tk.Frame(dest_box, bg=self.c_bg)
        dest_in.pack(fill="x", pady=(2, 0))
        self.fb_dest_entry = tk.Entry(dest_in, font=("Segoe UI", 9), relief="solid", bd=1)
        self.fb_dest_entry.insert(0, os.path.expanduser("~/Downloads"))
        self.fb_dest_entry.pack(side="left", fill="x", expand=True, ipady=4)
        tk.Button(dest_in, text=f"📁 {self.t['browse']}", bg="#ffffff", fg=self.c_text_dark, relief="solid", bd=1,
                  command=lambda: self._browse_folder(self.fb_dest_entry)).pack(side="left", padx=(6, 0), ipadx=8)

        # Download Button
        self.fb_btn = tk.Button(
            f, text=f"⬇ {self.t['download']} (Facebook/Reels)", bg="#0ea5e9", fg="#ffffff", font=("Segoe UI", 11, "bold"),
            relief="flat", cursor="hand2", padx=20, pady=8, command=self._start_facebook_download
        )
        self.fb_btn.pack(fill="x")

    def _start_facebook_download(self):
        url = self.fb_url_var.get().strip()
        dest = self.fb_dest_entry.get().strip()
        if not url:
            messagebox.showwarning("Warning", "Please enter a Facebook / Reels URL.")
            return

        choice = self.fb_quality_var.get()
        ydl_opts = {
            'outtmpl': os.path.join(dest, '%(title).100s.%(ext)s'),
            'trim_file_name': 100,
            'nocheckcertificate': True,
        }

        if choice == "hd":
            ydl_opts['format'] = 'best[ext=mp4]/best'
        elif choice == "sd":
            ydl_opts['format'] = 'worst[ext=mp4]/worst'
        elif choice == "mp3":
            ydl_opts['format'] = 'bestaudio/best'
            ydl_opts['postprocessors'] = [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '320',
            }]

        self._execute_ytdlp_download(url, ydl_opts, self.fb_btn)

    # =============================================================
    # Tab 3: Playlist Batch Downloader
    # =============================================================
    def _build_playlist_tab(self):
        f = self.tab_pl
        tk.Label(f, text=self.t["pl_title"], font=("Segoe UI", 12, "bold"), bg=self.c_bg).pack(anchor="w")
        tk.Label(f, text=self.t["pl_desc"], font=("Segoe UI", 9), bg=self.c_bg, fg=self.c_text_muted).pack(anchor="w", pady=(0, 10))

        # URL Input
        tk.Label(f, text=self.t["url_label"], font=("Segoe UI", 9, "bold"), bg=self.c_bg).pack(anchor="w")
        pl_url_box = tk.Frame(f, bg=self.c_bg)
        pl_url_box.pack(fill="x", pady=(2, 8))

        self.pl_url_var = tk.StringVar()
        self.pl_url_entry = tk.Entry(pl_url_box, textvariable=self.pl_url_var, font=("Consolas", 10), relief="solid", bd=1)
        self.pl_url_entry.pack(side="left", fill="x", expand=True, ipady=5)

        self.pl_fetch_btn = tk.Button(
            pl_url_box, text=f"🔍 {self.t['pl_fetch_btn']}", bg="#8b5cf6", fg="#ffffff", font=("Segoe UI", 9, "bold"),
            relief="flat", cursor="hand2", command=self._fetch_playlist_items
        )
        self.pl_fetch_btn.pack(side="left", padx=(6, 0), ipadx=10)

        # Playlist Treeview
        tree_frame = tk.Frame(f, bg="#ffffff", relief="solid", bd=1)
        tree_frame.pack(fill="both", expand=True, pady=(0, 8))

        columns = ("idx", "title", "duration", "status")
        self.pl_tree = ttk.Treeview(tree_frame, columns=columns, show="headings", selectmode="extended")
        self.pl_tree.heading("idx", text=self.t["pl_col_idx"])
        self.pl_tree.heading("title", text=self.t["pl_col_title"])
        self.pl_tree.heading("duration", text=self.t["pl_col_duration"])
        self.pl_tree.heading("status", text=self.t["pl_col_status"])

        self.pl_tree.column("idx", width=45, anchor="center")
        self.pl_tree.column("title", width=450, anchor="w")
        self.pl_tree.column("duration", width=90, anchor="center")
        self.pl_tree.column("status", width=120, anchor="center")

        tree_scroll = ttk.Scrollbar(tree_frame, orient="vertical", command=self.pl_tree.yview)
        self.pl_tree.configure(yscrollcommand=tree_scroll.set)

        self.pl_tree.pack(side="left", fill="both", expand=True)
        tree_scroll.pack(side="right", fill="y")

        # Selection Action Bar
        select_bar = tk.Frame(f, bg=self.c_bg)
        select_bar.pack(fill="x", pady=(0, 8))

        tk.Button(select_bar, text=self.t["pl_select_all"], bg="#ffffff", relief="solid", bd=1,
                  command=lambda: self.pl_tree.selection_set(self.pl_tree.get_children())).pack(side="left", padx=(0, 6), ipadx=6)
        tk.Button(select_bar, text=self.t["pl_deselect_all"], bg="#ffffff", relief="solid", bd=1,
                  command=lambda: self.pl_tree.selection_remove(self.pl_tree.selection())).pack(side="left", padx=(0, 6), ipadx=6)

        # Destination & Batch Action
        dest_box = tk.Frame(f, bg=self.c_bg)
        dest_box.pack(fill="x", pady=(0, 10))
        self.pl_dest_entry = tk.Entry(dest_box, font=("Segoe UI", 9), relief="solid", bd=1)
        self.pl_dest_entry.insert(0, os.path.expanduser("~/Downloads"))
        self.pl_dest_entry.pack(side="left", fill="x", expand=True, ipady=4)
        tk.Button(dest_box, text=f"📁 {self.t['browse']}", bg="#ffffff", relief="solid", bd=1,
                  command=lambda: self._browse_folder(self.pl_dest_entry)).pack(side="left", padx=(6, 0), ipadx=8)

        self.pl_download_btn = tk.Button(
            f, text=f"⬇ {self.t['pl_download_selected']}", bg="#8b5cf6", fg="#ffffff", font=("Segoe UI", 11, "bold"),
            relief="flat", cursor="hand2", padx=20, pady=8, command=self._start_batch_playlist_download
        )
        self.pl_download_btn.pack(fill="x")

    def _fetch_playlist_items(self):
        url = self.pl_url_var.get().strip()
        if not url:
            messagebox.showwarning("Warning", "Please enter a playlist URL.")
            return

        def run():
            try:
                self.log_message("🔍 Querying playlist contents...")
                self._update_status("Fetching playlist metadata...", 10)
                
                # Clear treeview
                self.root.after(0, lambda: self.pl_tree.delete(*self.pl_tree.get_children()))
                
                ydl_opts = {
                    'extract_flat': True,
                    'skip_download': True,
                    'ignoreerrors': True,
                }
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    data = ydl.extract_info(url, download=False)
                
                entries = data.get("entries", [])
                self.playlist_items = []

                for idx, item in enumerate(entries, 1):
                    if item:
                        dur = str(timedelta(seconds=int(item.get("duration", 0)))) if item.get("duration") else "--:--"
                        item_tuple = (idx, item.get("title", "Item " + str(idx)), dur, "Pending", item.get("url") or item.get("id"))
                        self.playlist_items.append(item_tuple)

                def insert_items():
                    for item in self.playlist_items:
                        item_id = self.pl_tree.insert("", "end", values=(item[0], item[1], item[2], item[3]))
                        self.pl_tree.selection_add(item_id)
                    self._update_status(f"Found {len(self.playlist_items)} playlist items.", 100)
                    self.log_message(f"✓ Enumerated {len(self.playlist_items)} playlist tracks.")

                self.root.after(0, insert_items)
            except Exception as e:
                self.log_message(f"Playlist fetch error: {e}")
                self._update_status(f"Error fetching playlist: {str(e)[:50]}", 0)

        threading.Thread(target=run, daemon=True).start()

    def _start_batch_playlist_download(self):
        selected_ids = self.pl_tree.selection()
        if not selected_ids:
            messagebox.showwarning("Warning", "Please select at least one item from the playlist.")
            return

        dest = self.pl_dest_entry.get().strip()

        def batch_run():
            self.is_downloading = True
            self.cancel_requested = False
            total_selected = len(selected_ids)
            self.log_message(f"🚀 Starting batch download of {total_selected} items...")

            for i, tree_id in enumerate(selected_ids, 1):
                if self.cancel_requested:
                    self.log_message("⏹ Batch download stopped by user.")
                    break

                values = self.pl_tree.item(tree_id, "values")
                idx, title, dur, _ = values
                self.pl_tree.item(tree_id, values=(idx, title, dur, "Downloading..."))
                self._update_status(f"Downloading ({i}/{total_selected}): {title[:35]}...", int((i / total_selected) * 100))

                # Find entry URL
                target_url = None
                for item in self.playlist_items:
                    if str(item[0]) == str(idx):
                        target_url = item[4]
                        break

                if target_url:
                    if not target_url.startswith("http"):
                        target_url = f"https://www.youtube.com/watch?v={target_url}"
                    
                    ydl_opts = {
                        'outtmpl': os.path.join(dest, '%(title).100s.%(ext)s'),
                        'trim_file_name': 100,
                        'format': 'best[ext=mp4]/best',
                        'nocheckcertificate': True,
                    }
                    try:
                        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                            ydl.download([target_url])
                        self.pl_tree.item(tree_id, values=(idx, title, dur, "✓ Complete"))
                    except Exception as e:
                        self.pl_tree.item(tree_id, values=(idx, title, dur, "✗ Failed"))
                        self.log_message(f"Error downloading {title}: {e}")

            self.is_downloading = False
            self._update_status("Batch processing finished.", 100)

        threading.Thread(target=batch_run, daemon=True).start()

    # =============================================================
    # Tab 4: Audio Downloader & Extractor
    # =============================================================
    def _build_audio_tab(self):
        f = self.tab_aud
        tk.Label(f, text=self.t["aud_title"], font=("Segoe UI", 12, "bold"), bg=self.c_bg).pack(anchor="w")
        tk.Label(f, text=self.t["aud_desc"], font=("Segoe UI", 9), bg=self.c_bg, fg=self.c_text_muted).pack(anchor="w", pady=(0, 12))

        # URL Input
        tk.Label(f, text=self.t["url_label"], font=("Segoe UI", 9, "bold"), bg=self.c_bg).pack(anchor="w")
        self.aud_url_var = tk.StringVar()
        aud_url_box = tk.Frame(f, bg=self.c_bg)
        aud_url_box.pack(fill="x", pady=(2, 10))

        self.aud_url_entry = tk.Entry(aud_url_box, textvariable=self.aud_url_var, font=("Consolas", 10), relief="solid", bd=1)
        self.aud_url_entry.pack(side="left", fill="x", expand=True, ipady=5)

        tk.Button(
            aud_url_box, text="📋 Paste", bg="#ffffff", fg=self.c_text_dark, relief="solid", bd=1,
            command=lambda: self._paste_to_entry(self.aud_url_entry)
        ).pack(side="left", padx=(6, 0), ipadx=6)

        # Format & Bitrate Grid
        grid_frame = tk.Frame(f, bg=self.c_bg)
        grid_frame.pack(fill="x", pady=(0, 10))

        col1 = tk.Frame(grid_frame, bg=self.c_bg)
        col1.pack(side="left", fill="x", expand=True, padx=(0, 8))
        tk.Label(col1, text=self.t["aud_format_label"], font=("Segoe UI", 9, "bold"), bg=self.c_bg).pack(anchor="w")
        self.aud_format_var = tk.StringVar(value="mp3")
        self.aud_format_combo = ttk.Combobox(col1, textvariable=self.aud_format_var, values=["mp3", "m4a", "wav", "flac", "opus"], state="readonly")
        self.aud_format_combo.current(0)
        self.aud_format_combo.pack(fill="x", pady=(2, 0), ipady=3)

        col2 = tk.Frame(grid_frame, bg=self.c_bg)
        col2.pack(side="left", fill="x", expand=True, padx=(8, 0))
        tk.Label(col2, text=self.t["aud_bitrate_label"], font=("Segoe UI", 9, "bold"), bg=self.c_bg).pack(anchor="w")
        self.aud_bitrate_var = tk.StringVar(value="320")
        self.aud_bitrate_combo = ttk.Combobox(col2, textvariable=self.aud_bitrate_var, values=["320 kbps (Studio)", "256 kbps (High)", "192 kbps (Standard)", "128 kbps (Compact)"], state="readonly")
        self.aud_bitrate_combo.current(0)
        self.aud_bitrate_combo.pack(fill="x", pady=(2, 0), ipady=3)

        # Destination
        dest_box = tk.Frame(f, bg=self.c_bg)
        dest_box.pack(fill="x", pady=(10, 14))
        tk.Label(dest_box, text=self.t["dest_label"], font=("Segoe UI", 9, "bold"), bg=self.c_bg).pack(anchor="w")
        dest_in = tk.Frame(dest_box, bg=self.c_bg)
        dest_in.pack(fill="x", pady=(2, 0))
        self.aud_dest_entry = tk.Entry(dest_in, font=("Segoe UI", 9), relief="solid", bd=1)
        self.aud_dest_entry.insert(0, os.path.expanduser("~/Downloads"))
        self.aud_dest_entry.pack(side="left", fill="x", expand=True, ipady=4)
        tk.Button(dest_in, text=f"📁 {self.t['browse']}", bg="#ffffff", relief="solid", bd=1,
                  command=lambda: self._browse_folder(self.aud_dest_entry)).pack(side="left", padx=(6, 0), ipadx=8)

        # Action button
        self.aud_dl_btn = tk.Button(
            f, text=f"🎵 {self.t['download']} (Pure Audio)", bg="#10b981", fg="#ffffff", font=("Segoe UI", 11, "bold"),
            relief="flat", cursor="hand2", padx=20, pady=8, command=self._start_audio_download
        )
        self.aud_dl_btn.pack(fill="x")

    def _start_audio_download(self):
        url = self.aud_url_var.get().strip()
        dest = self.aud_dest_entry.get().strip()
        if not url:
            messagebox.showwarning("Warning", "Please enter a valid media URL.")
            return

        fmt = self.aud_format_var.get()
        bitrate = self.aud_bitrate_var.get().split(" ")[0]

        ydl_opts = {
            'outtmpl': os.path.join(dest, '%(title).100s.%(ext)s'),
            'trim_file_name': 100,
            'format': 'bestaudio/best',
            'nocheckcertificate': True,
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': fmt,
                'preferredquality': bitrate,
            }, {
                'key': 'FFmpegMetadata',
            }]
        }

        self._execute_ytdlp_download(url, ydl_opts, self.aud_dl_btn)

    # =============================================================
    # Tab 7: AI Image Background Remover Studio
    # =============================================================
    def _build_remove_bg_tab(self):
        f = self.tab_bg
        
        # Section Header
        tk.Label(f, text=self.t["bg_title"], font=("Segoe UI", 12, "bold"), bg=self.c_bg).pack(anchor="w")
        tk.Label(f, text=self.t["bg_desc"], font=("Segoe UI", 9), bg=self.c_bg, fg=self.c_text_muted).pack(anchor="w", pady=(0, 8))

        # Open File Bar
        top_bar = tk.Frame(f, bg=self.c_bg)
        top_bar.pack(fill="x", pady=(0, 8))

        self.bg_file_entry = tk.Entry(top_bar, font=("Segoe UI", 9), relief="solid", bd=1)
        self.bg_file_entry.pack(side="left", fill="x", expand=True, ipady=4)

        tk.Button(
            top_bar, text=f"📂 {self.t['bg_open_btn']}", bg="#0ea5e9", fg="#ffffff", font=("Segoe UI", 9, "bold"),
            relief="flat", cursor="hand2", command=self._browse_bg_image
        ).pack(side="left", padx=(8, 0), ipadx=10, ipady=3)

        # Background Replacement Mode Options
        opt_box = tk.Frame(f, bg=self.c_bg)
        opt_box.pack(fill="x", pady=(0, 8))
        tk.Label(opt_box, text="Backdrop Style:", font=("Segoe UI", 9, "bold"), bg=self.c_bg).pack(side="left", padx=(0, 10))

        self.bg_mode_var = tk.StringVar(value="transparent")
        tk.Radiobutton(opt_box, text=self.t["bg_mode_transparent"], variable=self.bg_mode_var, value="transparent", bg=self.c_bg, command=self._refresh_bg_preview).pack(side="left", padx=(0, 12))
        tk.Radiobutton(opt_box, text=self.t["bg_mode_white"], variable=self.bg_mode_var, value="white", bg=self.c_bg, command=self._refresh_bg_preview).pack(side="left", padx=(0, 12))
        tk.Radiobutton(opt_box, text=self.t["bg_mode_black"], variable=self.bg_mode_var, value="black", bg=self.c_bg, command=self._refresh_bg_preview).pack(side="left", padx=(0, 12))
        tk.Radiobutton(opt_box, text=self.t["bg_mode_green"], variable=self.bg_mode_var, value="green", bg=self.c_bg, command=self._refresh_bg_preview).pack(side="left")

        # Side-by-Side Preview Displays
        preview_container = tk.Frame(f, bg=self.c_bg)
        preview_container.pack(fill="both", expand=True, pady=(0, 8))

        # Left: Original Image
        left_box = tk.Frame(preview_container, bg="#ffffff", relief="solid", bd=1)
        left_box.pack(side="left", fill="both", expand=True, padx=(0, 4))
        
        tk.Label(left_box, text="Original Photo", font=("Segoe UI", 9, "bold"), bg="#f1f5f9", fg=self.c_text_dark, pady=3).pack(fill="x")
        self.bg_orig_lbl = tk.Label(left_box, text="[No Image Loaded]\nClick 'Open Source Image' to begin", bg="#ffffff", fg=self.c_text_muted)
        self.bg_orig_lbl.pack(fill="both", expand=True, padx=8, pady=8)

        # Right: Cutout / Processed Image
        right_box = tk.Frame(preview_container, bg="#ffffff", relief="solid", bd=1)
        right_box.pack(side="left", fill="both", expand=True, padx=(4, 0))
        
        tk.Label(right_box, text="Background Removed Cutout", font=("Segoe UI", 9, "bold"), bg="#f1f5f9", fg=self.c_text_dark, pady=3).pack(fill="x")
        self.bg_result_lbl = tk.Label(right_box, text="[Cutout Preview]\nClick 'Remove Background' to generate", bg="#ffffff", fg=self.c_text_muted)
        self.bg_result_lbl.pack(fill="both", expand=True, padx=8, pady=8)

        # Action Buttons Row
        action_bar = tk.Frame(f, bg=self.c_bg)
        action_bar.pack(fill="x", pady=(2, 0))

        self.bg_process_btn = tk.Button(
            action_bar, text=f"✨ {self.t['bg_remove_btn']}", bg="#10b981", fg="#ffffff", font=("Segoe UI", 10, "bold"),
            relief="flat", cursor="hand2", padx=16, pady=6, command=self._start_remove_bg_thread
        )
        self.bg_process_btn.pack(side="left", fill="x", expand=True, padx=(0, 6))

        self.bg_save_btn = tk.Button(
            action_bar, text=f"💾 {self.t['bg_save_btn']}", bg="#0ea5e9", fg="#ffffff", font=("Segoe UI", 10, "bold"),
            relief="flat", cursor="hand2", padx=16, pady=6, command=self._save_remove_bg
        )
        self.bg_save_btn.pack(side="left", fill="x", expand=True, padx=(6, 0))

    def _browse_bg_image(self):
        if not Image:
            messagebox.showerror("Error", "Pillow (PIL) library is required for image processing.")
            return
        
        file_path = filedialog.askopenfilename(
            title="Select Source Image",
            filetypes=[("Image Files", "*.png;*.jpg;*.jpeg;*.webp;*.bmp;*.avif"), ("All Files", "*.*")]
        )
        if not file_path:
            return

        self.bg_image_path = file_path
        self.bg_file_entry.delete(0, tk.END)
        self.bg_file_entry.insert(0, file_path)

        try:
            self.bg_orig_image = Image.open(file_path).convert("RGBA")
            self.bg_processed_image = None
            self._render_bg_original_preview()
            self.bg_result_lbl.config(image="", text="[Ready to Process]\nClick 'Remove Background' to generate cutout")
            self.log_message(f"📷 Loaded source image: {os.path.basename(file_path)} ({self.bg_orig_image.width}x{self.bg_orig_image.height})")
            self._update_status(f"Loaded {os.path.basename(file_path)}", 0)
        except Exception as e:
            messagebox.showerror("Error", f"Failed to open image:\n{e}")

    def _render_bg_original_preview(self):
        if not self.bg_orig_image or not ImageTk:
            return
        
        w, h = self.bg_orig_image.size
        max_w, max_h = 320, 200
        ratio = min(max_w / max(w, 1), max_h / max(h, 1))
        new_size = (max(1, int(w * ratio)), max(1, int(h * ratio)))

        resized = self.bg_orig_image.resize(new_size, Image.Resampling.LANCZOS)
        self.bg_orig_preview_photo = ImageTk.PhotoImage(resized)
        self.bg_orig_lbl.config(image=self.bg_orig_preview_photo, text="")

    def _start_remove_bg_thread(self):
        if not self.bg_orig_image:
            messagebox.showwarning("Warning", "Please open an image first.")
            return

        self.bg_process_btn.config(state="disabled", text="⏳ Removing background...")
        self._update_status("Removing image background with AI neural matting...", 30)
        self.log_message("✨ Initiating background removal...")

        def process_worker():
            try:
                # 1. Try rembg if installed
                result_img = None
                if rembg_remove is not None:
                    try:
                        self.log_message("🧠 Processing with Rembg U2Net model...")
                        result_img = rembg_remove(self.bg_orig_image)
                    except Exception as re:
                        self.log_message(f"Notice: Rembg encountered an error: {re}. Falling back to edge matting.")

                # 2. Fallback matting if rembg is unavailable
                if result_img is None:
                    self.log_message("🎨 Applying adaptive luminance/chroma matting...")
                    img_rgba = self.bg_orig_image.copy().convert("RGBA")
                    datas = img_rgba.getdata()
                    
                    # Detect corner background color
                    corners = [datas[0], datas[img_rgba.width - 1], datas[-1], datas[-img_rgba.width]]
                    avg_bg_r = sum(c[0] for c in corners) // 4
                    avg_bg_g = sum(c[1] for c in corners) // 4
                    avg_bg_b = sum(c[2] for c in corners) // 4

                    new_data = []
                    threshold = 42
                    for item in datas:
                        diff = abs(item[0] - avg_bg_r) + abs(item[1] - avg_bg_g) + abs(item[2] - avg_bg_b)
                        if diff < threshold:
                            new_data.append((item[0], item[1], item[2], 0))
                        elif diff < threshold + 25:
                            alpha = int(((diff - threshold) / 25.0) * 255)
                            new_data.append((item[0], item[1], item[2], alpha))
                        else:
                            new_data.append(item)
                    
                    img_rgba.putdata(new_data)
                    result_img = img_rgba

                self.bg_processed_image = result_img
                self.root.after(0, self._on_bg_remove_success)
            except Exception as e:
                self.root.after(0, lambda: self._on_bg_remove_error(str(e)))

        threading.Thread(target=process_worker, daemon=True).start()

    def _on_bg_remove_success(self):
        self.bg_process_btn.config(state="normal", text=f"✨ {self.t['bg_remove_btn']}")
        self._refresh_bg_preview()
        self._update_status("Background removal completed!", 100)
        self.log_message("✓ Background removal completed successfully.")

    def _on_bg_remove_error(self, err_msg):
        self.bg_process_btn.config(state="normal", text=f"✨ {self.t['bg_remove_btn']}")
        self._update_status(f"Error removing background: {err_msg[:40]}", 0)
        self.log_message(f"✗ Remove BG failed: {err_msg}")
        messagebox.showerror("Error", f"Failed to remove background:\n{err_msg}")

    def _get_composited_bg_image(self):
        if not self.bg_processed_image:
            return None
        
        mode = self.bg_mode_var.get()
        if mode == "transparent":
            return self.bg_processed_image

        bg_colors = {
            "white": (255, 255, 255, 255),
            "black": (15, 23, 42, 255),
            "green": (34, 197, 94, 255),
        }
        solid_color = bg_colors.get(mode, (255, 255, 255, 255))
        
        composite = Image.new("RGBA", self.bg_processed_image.size, solid_color)
        composite.paste(self.bg_processed_image, (0, 0), self.bg_processed_image)
        return composite

    def _refresh_bg_preview(self):
        if not self.bg_processed_image or not ImageTk:
            return
        
        composite = self._get_composited_bg_image()
        if not composite:
            return

        w, h = composite.size
        max_w, max_h = 320, 200
        ratio = min(max_w / max(w, 1), max_h / max(h, 1))
        new_size = (max(1, int(w * ratio)), max(1, int(h * ratio)))

        resized = composite.resize(new_size, Image.Resampling.LANCZOS)
        self.bg_preview_photo = ImageTk.PhotoImage(resized)
        self.bg_result_lbl.config(image=self.bg_preview_photo, text="")

    def _save_remove_bg(self):
        if not self.bg_processed_image:
            messagebox.showwarning("Warning", "No processed image to save. Please run 'Remove Background' first.")
            return

        composite = self._get_composited_bg_image()
        mode = self.bg_mode_var.get()
        default_name = "cutout_transparent.png" if mode == "transparent" else f"cutout_{mode}.png"
        
        save_path = filedialog.asksaveasfilename(
            title="Save Cutout Image",
            initialfile=default_name,
            filetypes=[("PNG Image (Lossless & Alpha)", "*.png"), ("JPEG Image", "*.jpg"), ("WebP Image", "*.webp")]
        )
        if not save_path:
            return

        try:
            if save_path.lower().endswith((".jpg", ".jpeg")):
                composite.convert("RGB").save(save_path, "JPEG", quality=95)
            else:
                composite.save(save_path)
            self.log_message(f"💾 Saved cutout image to: {save_path}")
            self._update_status(f"Saved: {os.path.basename(save_path)}", 100)
            messagebox.showinfo("Success", f"Cutout image saved successfully!\n\nLocation: {save_path}")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save image:\n{e}")

    # =============================================================
    # Tab 8: Video Frame Snapshot Extractor
    # =============================================================
    def _build_frame_tab(self):
        f = self.tab_frame
        tk.Label(f, text=self.t["frame_title"], font=("Segoe UI", 12, "bold"), bg=self.c_bg).pack(anchor="w")
        tk.Label(f, text=self.t["frame_desc"], font=("Segoe UI", 9), bg=self.c_bg, fg=self.c_text_muted).pack(anchor="w", pady=(0, 8))

        # Open File Bar
        top_bar = tk.Frame(f, bg=self.c_bg)
        top_bar.pack(fill="x", pady=(0, 8))

        self.frame_file_lbl = tk.Label(top_bar, text="No video loaded", bg="#ffffff", relief="solid", bd=1, anchor="w", padx=10)
        self.frame_file_lbl.pack(side="left", fill="x", expand=True, ipady=4)

        tk.Button(
            top_bar, text=f"📂 {self.t['frame_open_btn']}", bg="#0ea5e9", fg="#ffffff", font=("Segoe UI", 9, "bold"),
            relief="flat", cursor="hand2", command=self._open_local_video
        ).pack(side="left", padx=(8, 0), ipadx=10, ipady=3)

        # Video Canvas Preview Area
        preview_container = tk.Frame(f, bg="#0f172a", height=220, relief="solid", bd=1)
        preview_container.pack(fill="x", pady=(0, 8))
        preview_container.pack_propagate(False)

        self.frame_canvas = tk.Canvas(preview_container, bg="#0f172a", highlightthickness=0)
        self.frame_canvas.pack(fill="both", expand=True)

        # Timeline Scrubber & Step Controls
        scrubber_box = tk.Frame(f, bg=self.c_bg)
        scrubber_box.pack(fill="x", pady=(0, 8))

        self.frame_slider = ttk.Scale(scrubber_box, from_=0, to=100, orient="horizontal", command=self._on_frame_slider_move)
        self.frame_slider.pack(fill="x", pady=(0, 4))

        controls_row = tk.Frame(scrubber_box, bg=self.c_bg)
        controls_row.pack(fill="x")

        # Step buttons
        tk.Button(controls_row, text="⏮ -1s", bg="#ffffff", relief="solid", bd=1, command=lambda: self._seek_frame_relative(-1.0)).pack(side="left", padx=(0, 4))
        tk.Button(controls_row, text="◀ -0.1s", bg="#ffffff", relief="solid", bd=1, command=lambda: self._seek_frame_relative(-0.1)).pack(side="left", padx=(0, 4))
        tk.Button(controls_row, text="+0.1s ▶", bg="#ffffff", relief="solid", bd=1, command=lambda: self._seek_frame_relative(0.1)).pack(side="left", padx=(0, 4))
        tk.Button(controls_row, text="+1s ⏭", bg="#ffffff", relief="solid", bd=1, command=lambda: self._seek_frame_relative(1.0)).pack(side="left", padx=(0, 8))

        self.frame_time_lbl = tk.Label(controls_row, text="00:00:00 / 00:00:00", font=("Consolas", 10, "bold"), bg="#ffffff", relief="solid", bd=1, padx=8, pady=2)
        self.frame_time_lbl.pack(side="left")

        # Capture Actions
        action_bar = tk.Frame(f, bg=self.c_bg)
        action_bar.pack(fill="x", pady=(4, 0))

        tk.Button(
            action_bar, text=f"📷 {self.t['frame_capture_btn']}", bg="#10b981", fg="#ffffff", font=("Segoe UI", 10, "bold"),
            relief="flat", cursor="hand2", padx=16, pady=6, command=self._capture_current_frame
        ).pack(side="left", fill="x", expand=True, padx=(0, 6))

        tk.Button(
            action_bar, text=f"⚡ {self.t['frame_batch_btn']}", bg="#8b5cf6", fg="#ffffff", font=("Segoe UI", 10, "bold"),
            relief="flat", cursor="hand2", padx=16, pady=6, command=self._batch_extract_frames
        ).pack(side="left", padx=(6, 0))

    def _open_local_video(self):
        if not cv2:
            messagebox.showerror("Error", "OpenCV (cv2) is required. Install via `pip install opencv-python`.")
            return

        path = filedialog.askopenfilename(filetypes=[("Video files", "*.mp4 *.mkv *.avi *.mov *.webm")])
        if not path:
            return

        self.video_path = path
        self.frame_file_lbl.config(text=os.path.basename(path))

        if self.video_cap:
            self.video_cap.release()

        self.video_cap = cv2.VideoCapture(path)
        self.video_total_frames = int(self.video_cap.get(cv2.CAP_PROP_FRAME_COUNT))
        self.video_fps = self.video_cap.get(cv2.CAP_PROP_FPS) or 30.0
        self.video_duration_sec = self.video_total_frames / self.video_fps

        self.frame_slider.config(to=self.video_duration_sec)
        self.frame_slider.set(0)
        self._render_video_frame(0.0)

    def _on_frame_slider_move(self, val):
        sec = float(val)
        self._render_video_frame(sec)

    def _seek_frame_relative(self, delta_sec):
        curr = self.frame_slider.get()
        new_val = max(0, min(self.video_duration_sec, curr + delta_sec))
        self.frame_slider.set(new_val)
        self._render_video_frame(new_val)

    def _render_video_frame(self, timestamp_sec: float):
        if not self.video_cap or not cv2 or not Image or not ImageTk:
            return

        self.video_cap.set(cv2.CAP_PROP_POS_MSEC, timestamp_sec * 1000)
        success, frame = self.video_cap.read()
        if success:
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            canvas_w = self.frame_canvas.winfo_width() or 600
            canvas_h = self.frame_canvas.winfo_height() or 220

            # Scale aspect ratio
            h, w, _ = frame_rgb.shape
            scale = min(canvas_w / w, canvas_h / h)
            new_w, new_h = max(1, int(w * scale)), max(1, int(h * scale))

            img_pil = Image.fromarray(frame_rgb).resize((new_w, new_h), Image.Resampling.BILINEAR)
            self.current_frame_photo = ImageTk.PhotoImage(img_pil)

            self.frame_canvas.delete("all")
            self.frame_canvas.create_image(canvas_w // 2, canvas_h // 2, image=self.current_frame_photo, anchor="center")

            curr_str = str(timedelta(seconds=int(timestamp_sec)))
            total_str = str(timedelta(seconds=int(self.video_duration_sec)))
            self.frame_time_lbl.config(text=f"{curr_str} / {total_str}")

    def _capture_current_frame(self):
        if not self.video_cap:
            messagebox.showwarning("Warning", "Please open a video file first.")
            return

        sec = self.frame_slider.get()
        save_path = filedialog.asksaveasfilename(
            defaultextension=".png",
            initialfile=f"snapshot_{int(sec)}s.png",
            filetypes=[("PNG Image", "*.png"), ("JPEG Image", "*.jpg")]
        )
        if save_path:
            self.video_cap.set(cv2.CAP_PROP_POS_MSEC, sec * 1000)
            success, frame = self.video_cap.read()
            if success:
                cv2.imwrite(save_path, frame)
                messagebox.showinfo("Saved", f"Snapshot frame saved to:\n{save_path}")
                self.log_message(f"✓ Saved video frame to {save_path}")

    def _batch_extract_frames(self):
        if not self.video_cap:
            messagebox.showwarning("Warning", "Please open a video file first.")
            return

        out_dir = filedialog.askdirectory(title="Select folder for extracted frames")
        if not out_dir:
            return

        def run_batch():
            total_sec = int(self.video_duration_sec)
            self.log_message(f"⚡ Batch capturing {total_sec} frames (1/sec)...")
            for s in range(0, total_sec + 1):
                self.video_cap.set(cv2.CAP_PROP_POS_MSEC, s * 1000)
                success, frame = self.video_cap.read()
                if success:
                    cv2.imwrite(os.path.join(out_dir, f"frame_{s:04d}s.png"), frame)
            self.log_message(f"✓ Batch frame extraction completed in {out_dir}")
            messagebox.showinfo("Complete", f"Extracted {total_sec} frames to:\n{out_dir}")

        threading.Thread(target=run_batch, daemon=True).start()

    # =============================================================
    # Tab 6: Audio Waveform Cutter & Trimmer
    # =============================================================
    def _build_cutter_tab(self):
        f = self.tab_cutter
        tk.Label(f, text=self.t["cutter_title"], font=("Segoe UI", 12, "bold"), bg=self.c_bg).pack(anchor="w")
        tk.Label(f, text=self.t["cutter_desc"], font=("Segoe UI", 9), bg=self.c_bg, fg=self.c_text_muted).pack(anchor="w", pady=(0, 8))

        # Open File Bar
        top_bar = tk.Frame(f, bg=self.c_bg)
        top_bar.pack(fill="x", pady=(0, 8))

        self.cutter_file_lbl = tk.Label(top_bar, text="No audio loaded", bg="#ffffff", relief="solid", bd=1, anchor="w", padx=10)
        self.cutter_file_lbl.pack(side="left", fill="x", expand=True, ipady=4)

        tk.Button(
            top_bar, text=f"🎵 {self.t['cutter_open_btn']}", bg="#0ea5e9", fg="#ffffff", font=("Segoe UI", 9, "bold"),
            relief="flat", cursor="hand2", command=self._open_local_audio
        ).pack(side="left", padx=(8, 0), ipadx=10, ipady=3)

        # Waveform Canvas
        wave_container = tk.Frame(f, bg="#0f172a", height=130, relief="solid", bd=1)
        wave_container.pack(fill="x", pady=(0, 8))
        wave_container.pack_propagate(False)

        self.waveform_canvas = tk.Canvas(wave_container, bg="#0f172a", highlightthickness=0)
        self.waveform_canvas.pack(fill="both", expand=True)
        self.waveform_canvas.bind("<Button-1>", self._on_waveform_click)

        # Start & End Timestamp Entries
        time_grid = tk.Frame(f, bg=self.c_bg)
        time_grid.pack(fill="x", pady=(0, 10))

        col1 = tk.Frame(time_grid, bg=self.c_bg)
        col1.pack(side="left", fill="x", expand=True, padx=(0, 8))
        tk.Label(col1, text=self.t["cutter_start"], font=("Segoe UI", 9, "bold"), bg=self.c_bg).pack(anchor="w")
        self.cutter_start_entry = tk.Entry(col1, font=("Consolas", 10), relief="solid", bd=1)
        self.cutter_start_entry.insert(0, "00:00:00")
        self.cutter_start_entry.pack(fill="x", pady=(2, 0), ipady=4)

        col2 = tk.Frame(time_grid, bg=self.c_bg)
        col2.pack(side="left", fill="x", expand=True, padx=(8, 0))
        tk.Label(col2, text=self.t["cutter_end"], font=("Segoe UI", 9, "bold"), bg=self.c_bg).pack(anchor="w")
        self.cutter_end_entry = tk.Entry(col2, font=("Consolas", 10), relief="solid", bd=1)
        self.cutter_end_entry.insert(0, "00:00:30")
        self.cutter_end_entry.pack(fill="x", pady=(2, 0), ipady=4)

        # Action Trim Button
        self.cutter_trim_btn = tk.Button(
            f, text=f"✂ {self.t['cutter_trim_btn']}", bg="#10b981", fg="#ffffff", font=("Segoe UI", 11, "bold"),
            relief="flat", cursor="hand2", padx=20, pady=8, command=self._execute_audio_trim
        )
        self.cutter_trim_btn.pack(fill="x")

    def _open_local_audio(self):
        path = filedialog.askopenfilename(filetypes=[("Audio files", "*.mp3 *.wav *.ogg *.flac *.m4a")])
        if not path:
            return

        self.audio_path = path
        self.cutter_file_lbl.config(text=os.path.basename(path))

        def load_audio():
            try:
                self.log_message(f"🎵 Decoding waveform for {os.path.basename(path)}...")
                if AudioSegment:
                    seg = AudioSegment.from_file(path)
                    self.audio_duration_sec = len(seg) / 1000.0
                    raw_data = seg.get_array_of_samples()
                    step = max(1, len(raw_data) // 180)
                    self.audio_peaks = [abs(raw_data[i]) / (2**15) for i in range(0, len(raw_data), step)]
                else:
                    self.audio_duration_sec = 60.0
                    self.audio_peaks = [abs(math.sin(i * 0.1)) for i in range(180)]

                self.root.after(0, self._draw_waveform)
            except Exception as e:
                self.log_message(f"Audio load error: {e}")

        threading.Thread(target=load_audio, daemon=True).start()

    def _draw_waveform(self):
        canvas = self.waveform_canvas
        canvas.delete("all")
        w = canvas.winfo_width() or 600
        h = canvas.winfo_height() or 130

        if not self.audio_peaks:
            return

        num_bars = len(self.audio_peaks)
        bar_w = w / max(1, num_bars)

        for i, peak in enumerate(self.audio_peaks):
            x = i * bar_w
            bar_h = peak * (h - 20)
            y1 = (h - bar_h) / 2
            y2 = y1 + bar_h
            canvas.create_rectangle(x, y1, x + max(1, bar_w - 1), y2, fill="#10b981", outline="")

    def _on_waveform_click(self, event):
        w = self.waveform_canvas.winfo_width() or 600
        if self.audio_duration_sec <= 0:
            return
        ratio = max(0.0, min(1.0, event.x / w))
        target_sec = ratio * self.audio_duration_sec
        time_str = str(timedelta(seconds=int(target_sec)))
        self.cutter_start_entry.delete(0, tk.END)
        self.cutter_start_entry.insert(0, time_str)

    def _execute_audio_trim(self):
        if not self.audio_path:
            messagebox.showwarning("Warning", "Please load an audio file first.")
            return

        t_start = self._parse_time_str(self.cutter_start_entry.get().strip())
        t_end = self._parse_time_str(self.cutter_end_entry.get().strip())

        if t_end <= t_start:
            messagebox.showwarning("Warning", "End time must be greater than Start time.")
            return

        save_path = filedialog.asksaveasfilename(
            defaultextension=".mp3",
            filetypes=[("MP3 Audio", "*.mp3"), ("WAV Audio", "*.wav"), ("M4A Audio", "*.m4a")]
        )
        if not save_path:
            return

        def run_trim():
            try:
                self.log_message(f"✂ Slicing segment {t_start}s to {t_end}s...")
                if self.has_ffmpeg:
                    cmd = [
                        "ffmpeg", "-y", "-ss", str(t_start), "-to", str(t_end),
                        "-i", self.audio_path, "-c", "copy", save_path
                    ]
                    subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
                elif AudioSegment:
                    seg = AudioSegment.from_file(self.audio_path)
                    trimmed = seg[int(t_start * 1000):int(t_end * 1000)]
                    trimmed.export(save_path, format=os.path.splitext(save_path)[1].replace(".", "") or "mp3")
                
                self.log_message(f"✓ Trimmed audio segment saved to:\n{save_path}")
                messagebox.showinfo("Success", f"Segment saved successfully:\n{save_path}")
            except Exception as e:
                self.log_message(f"Trim error: {e}")
                messagebox.showerror("Error", f"Failed to trim audio: {e}")

        threading.Thread(target=run_trim, daemon=True).start()

    # =============================================================
    # Tab 7: Logs Terminal
    # =============================================================
    def _build_logs_tab(self):
        f = self.tab_logs
        
        top_row = tk.Frame(f, bg=self.c_bg)
        top_row.pack(fill="x", pady=(0, 6))

        tk.Label(top_row, text="Activity & Download Stream Console", font=("Segoe UI", 11, "bold"), bg=self.c_bg).pack(side="left")

        tk.Button(
            top_row, text="Clear Logs", bg="#ffffff", relief="solid", bd=1,
            command=lambda: self.log_text.delete("1.0", tk.END)
        ).pack(side="right")

        self.log_text = scrolledtext.ScrolledText(
            f, wrap="word", bg="#0f172a", fg="#38bdf8", insertbackground="#38bdf8",
            font=("Consolas", 9), relief="solid", bd=1
        )
        self.log_text.pack(fill="both", expand=True)

        self.log_message("⚡ Media Tools Pro engine initialized.")
        if self.has_ffmpeg:
            self.log_message("✓ FFmpeg encoder detected.")
        else:
            self.log_message("⚠ FFmpeg binary not found on PATH. Higher resolutions (1080p+/4K) require FFmpeg.")

    def log_message(self, text: str):
        timestamp = time.strftime("[%H:%M:%S] ")
        msg = timestamp + text + "\n"
        self.download_queue.put(("log", msg))

    # =============================================================
    # Core Engine: yt-dlp Download Execution & Hooks
    # =============================================================
    def _execute_ytdlp_download(self, url: str, ydl_opts: dict, btn_to_disable=None, cancel_btn=None):
        if not yt_dlp:
            messagebox.showerror("Error", "yt-dlp is not installed. Install via `pip install yt-dlp`.")
            return

        if self.is_downloading:
            messagebox.showwarning("Busy", "A download is already in progress.")
            return

        def run_downloader():
            self.is_downloading = True
            self.cancel_requested = False
            if btn_to_disable:
                self.root.after(0, lambda: btn_to_disable.config(state="disabled"))
            if cancel_btn:
                self.root.after(0, lambda: cancel_btn.config(state="normal"))

            self._update_status(self.t["status_downloading"], 5)
            self.log_message(f"⬇ Initiating stream download for: {url}")

            # Attach custom progress hook & safe filename constraint
            ydl_opts['progress_hooks'] = [self._ytdlp_progress_hook]
            ydl_opts.setdefault('trim_file_name', 100)
            ydl_opts.setdefault('restrictfilenames', False)

            try:
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    self.current_download_process = ydl
                    ydl.download([url])

                if not self.cancel_requested:
                    self._update_status(self.t["status_complete"], 100)
                    self.log_message("✓ Download finished successfully!")
                    messagebox.showinfo("Success", "Media downloaded successfully!")
                else:
                    self._update_status(self.t["status_cancelled"], 0)
            except Exception as e:
                self._update_status(f"{self.t['status_error']}: {str(e)[:50]}", 0)
                self.log_message(f"✗ Download error: {e}")
                messagebox.showerror("Download Error", str(e))
            finally:
                self.is_downloading = False
                self.current_download_process = None
                if btn_to_disable:
                    self.root.after(0, lambda: btn_to_disable.config(state="normal"))
                if cancel_btn:
                    self.root.after(0, lambda: cancel_btn.config(state="disabled"))

        threading.Thread(target=run_downloader, daemon=True).start()

    def _ytdlp_progress_hook(self, d: dict):
        if self.cancel_requested:
            raise Exception("Download cancelled by user.")

        if d['status'] == 'downloading':
            total = d.get('total_bytes') or d.get('total_bytes_estimate') or 1
            downloaded = d.get('downloaded_bytes', 0)
            percent = min(100, int((downloaded / total) * 100))

            speed_str = d.get('_speed_str', '-- MB/s')
            eta_str = d.get('_eta_str', '--:--')
            size_mb = f"{downloaded / (1024*1024):.1f}MB"

            stats = f"{percent}% • {speed_str} • ETA {eta_str} • {size_mb}"
            self.download_queue.put(("progress", (percent, stats)))

        elif d['status'] == 'finished':
            self.download_queue.put(("progress", (100, "Muxing & finalizing file...")))

    def _cancel_download(self):
        self.cancel_requested = True
        self.log_message("⏹ Cancellation signal sent...")

    def _start_analysis(self, url: str, callback):
        if not url:
            messagebox.showwarning("Warning", "Please enter a valid URL.")
            return

        def analyze():
            self._update_status(self.t["status_analyzing"], 20)
            self.log_message(f"🔍 Analyzing stream metadata for {url}...")
            try:
                ydl_opts = {'skip_download': True, 'nocheckcertificate': True}
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(url, download=False)
                self.root.after(0, lambda: callback(info))
                self._update_status(self.t["status_ready"], 100)
                self.log_message(f"✓ Retrieved metadata: {info.get('title', 'Unknown')}")
            except Exception as e:
                self.log_message(f"Analysis error: {e}")
                self._update_status(f"Analysis error: {str(e)[:45]}", 0)

        threading.Thread(target=analyze, daemon=True).start()

    # -------------------------------------------------------------
    # Queue Poller & Utilities
    # -------------------------------------------------------------
    def _start_queue_poller(self):
        try:
            while not self.download_queue.empty():
                kind, data = self.download_queue.get_nowait()
                if kind == "progress":
                    pct, stats = data
                    self.global_progress['value'] = pct
                    self.stats_lbl.config(text=stats)
                elif kind == "status":
                    msg = data
                    self.status_lbl.config(text=msg)
                elif kind == "log":
                    self.log_text.insert(tk.END, data)
                    self.log_text.see(tk.END)
        except queue.Empty:
            pass

        self.root.after(100, self._start_queue_poller)

    def _update_status(self, msg: str, pct: int):
        self.download_queue.put(("status", f"● {msg}"))
        self.download_queue.put(("progress", (pct, self.stats_lbl.cget("text"))))

    def _browse_folder(self, entry_widget):
        path = filedialog.askdirectory()
        if path:
            entry_widget.delete(0, tk.END)
            entry_widget.insert(0, path)

    def _paste_to_entry(self, entry_widget):
        try:
            text = self.root.clipboard_get()
            entry_widget.delete(0, tk.END)
            entry_widget.insert(0, text.strip())
        except Exception:
            pass

    def _parse_time_str(self, time_str: str) -> float:
        try:
            parts = time_str.split(":")
            if len(parts) == 3:
                return float(parts[0]) * 3600 + float(parts[1]) * 60 + float(parts[2])
            elif len(parts) == 2:
                return float(parts[0]) * 60 + float(parts[1])
            return float(time_str)
        except Exception:
            return 0.0


def main():
    root = tk.Tk()
    app = MediaToolsProApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
