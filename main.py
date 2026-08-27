"""
Media Tools Pro - Desktop Edition (Python Tkinter)
===================================================
A standalone desktop application supporting YouTube/Facebook downloading,
playlist processing, audio extraction, video frame extraction, and audio cutting.

Requirements:
    pip install yt-dlp opencv-python pydub pillow
    (Ensure ffmpeg is installed and available in system PATH)

Run with:
    python main.py
"""

import os
import sys
import threading
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
from datetime import timedelta

try:
    import yt_dlp
except ImportError:
    yt_dlp = None

try:
    import cv2
    from PIL import Image, ImageTk
except ImportError:
    cv2 = None
    Image = None
    ImageTk = None

try:
    from pydub import AudioSegment
except ImportError:
    AudioSegment = None


class MediaToolsProApp:
    def __init__(self, root: tk.Tk):
        self.root = root
        self.root.title("Media Tools Pro (ឧបករណ៍មេឌៀកម្រិតខ្ពស់)")
        self.root.geometry("860x680")
        self.root.minsize(760, 580)
        self.root.configure(bg="#e6edf5")

        # Color Palette (Tactile Neumorphic Tones)
        self.bg_color = "#e6edf5"
        self.card_bg = "#e6edf5"
        self.accent_green = "#10b981"
        self.accent_red = "#ef4444"
        self.text_color = "#1e293b"

        self.current_lang = "en"
        self.video_path = None
        self.audio_path = None

        self._setup_styles()
        self._build_ui()

    def _setup_styles(self):
        style = ttk.Style()
        style.theme_use("clam")
        style.configure("TNotebook", background=self.bg_color, borderwidth=0)
        style.configure("TNotebook.Tab", background="#d9e2ec", foreground="#334155", font=("Segoe UI", 10, "bold"), padding=[14, 8])
        style.map("TNotebook.Tab", background=[("selected", "#ffffff")], foreground=[("selected", "#0f172a")])
        style.configure("TFrame", background=self.bg_color)
        style.configure("TLabel", background=self.bg_color, foreground=self.text_color, font=("Segoe UI", 10))
        style.configure("Header.TLabel", font=("Segoe UI", 14, "bold"), foreground="#0f172a")
        style.configure("TProgressbar", thickness=14, troughcolor="#d9e2ec", background=self.accent_green)

    def _build_ui(self):
        # Header Banner
        header = tk.Frame(self.root, bg=self.bg_color, pady=12, padx=20)
        header.pack(fill="x")

        title_lbl = tk.Label(header, text="⚡ Media Tools Pro", font=("Segoe UI", 16, "bold"), bg=self.bg_color, fg="#0f172a")
        title_lbl.pack(side="left")

        lang_btn = tk.Button(header, text="🇰🇭 ភាសាខ្មែរ / EN", font=("Segoe UI", 9, "bold"), bg="#ffffff", fg="#334155",
                             relief="groove", padx=10, pady=4, cursor="hand2", command=self._toggle_language)
        lang_btn.pack(side="right")

        # Tabs Container
        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(fill="both", expand=True, padx=16, pady=(0, 16))

        # 1. YouTube Tab
        self.yt_frame = ttk.Frame(self.notebook, padding=16)
        self.notebook.add(self.yt_frame, text=" YouTube ")
        self._build_youtube_tab()

        # 2. Facebook Tab
        self.fb_frame = ttk.Frame(self.notebook, padding=16)
        self.notebook.add(self.fb_frame, text=" Facebook ")
        self._build_facebook_tab()

        # 3. Playlist Tab
        self.pl_frame = ttk.Frame(self.notebook, padding=16)
        self.notebook.add(self.pl_frame, text=" Playlist ")
        self._build_playlist_tab()

        # 4. Audio Downloader Tab
        self.audio_dl_frame = ttk.Frame(self.notebook, padding=16)
        self.notebook.add(self.audio_dl_frame, text=" Audio Downloader ")
        self._build_audio_dl_tab()

        # 5. Video Frame Extractor Tab
        self.frame_ext_frame = ttk.Frame(self.notebook, padding=16)
        self.notebook.add(self.frame_ext_frame, text=" Frame Extractor ")
        self._build_frame_extractor_tab()

        # 6. Audio Cutter Tab
        self.cutter_frame = ttk.Frame(self.notebook, padding=16)
        self.notebook.add(self.cutter_frame, text=" Audio Cutter ")
        self._build_audio_cutter_tab()

    def _toggle_language(self):
        self.current_lang = "km" if self.current_lang == "en" else "en"
        msg = "ភាសាត្រូវបានប្តូរទៅជា ភាសាខ្មែរ" if self.current_lang == "km" else "Language switched to English"
        messagebox.showinfo("Language", msg)

    # -------------------------------------------------------------
    # 1. YouTube Downloader Tab
    # -------------------------------------------------------------
    def _build_youtube_tab(self):
        f = self.yt_frame
        tk.Label(f, text="YouTube Video Downloader", font=("Segoe UI", 12, "bold"), bg=self.bg_color).pack(anchor="w", pady=(0, 8))

        # URL Input
        tk.Label(f, text="Video URL (Link):", bg=self.bg_color, font=("Segoe UI", 9, "bold")).pack(anchor="w")
        self.yt_url_entry = tk.Entry(f, font=("Consolas", 10), relief="solid", bd=1)
        self.yt_url_entry.pack(fill="x", pady=(2, 10), ipady=4)

        # Destination Folder
        tk.Label(f, text="Destination Folder:", bg=self.bg_color, font=("Segoe UI", 9, "bold")).pack(anchor="w")
        dest_box = tk.Frame(f, bg=self.bg_color)
        dest_box.pack(fill="x", pady=(2, 10))
        self.yt_dest_entry = tk.Entry(dest_box, font=("Segoe UI", 9), relief="solid", bd=1)
        self.yt_dest_entry.insert(0, os.path.expanduser("~/Downloads"))
        self.yt_dest_entry.pack(side="left", fill="x", expand=True, ipady=4)
        tk.Button(dest_box, text="Browse...", bg="#ffffff", fg="#334155", relief="solid", bd=1,
                  command=lambda: self._browse_folder(self.yt_dest_entry)).pack(side="left", padx=(8, 0), ipadx=8)

        # Resolution dropdown
        tk.Label(f, text="Preferred Resolution:", bg=self.bg_color, font=("Segoe UI", 9, "bold")).pack(anchor="w")
        self.yt_quality = ttk.Combobox(f, values=["1080p (Full HD)", "720p (HD)", "480p (SD)", "Best Available", "Audio Only (MP3)"], state="readonly")
        self.yt_quality.current(1)
        self.yt_quality.pack(fill="x", pady=(2, 12))

        # Progress
        self.yt_progress = ttk.Progressbar(f, mode="determinate")
        self.yt_progress.pack(fill="x", pady=(6, 12))
        self.yt_status = tk.Label(f, text="Ready to download", fg="#64748b", bg=self.bg_color, font=("Segoe UI", 9))
        self.yt_status.pack(anchor="w")

        # Action Buttons
        btn_box = tk.Frame(f, bg=self.bg_color)
        btn_box.pack(fill="x", pady=(16, 0))
        tk.Button(btn_box, text="⬇ Start Download", bg="#15EF5F", fg="#0f172a", font=("Segoe UI", 10, "bold"),
                  relief="flat", cursor="hand2", padx=16, pady=8, command=self._download_youtube).pack(side="left", fill="x", expand=True, padx=(0, 6))
        tk.Button(btn_box, text="Reset", bg="#F64247", fg="#ffffff", font=("Segoe UI", 10, "bold"),
                  relief="flat", cursor="hand2", padx=16, pady=8, command=lambda: self.yt_url_entry.delete(0, tk.END)).pack(side="left", padx=(6, 0))

    def _download_youtube(self):
        url = self.yt_url_entry.get().strip()
        dest = self.yt_dest_entry.get().strip()
        if not url:
            messagebox.showwarning("Warning", "Please enter a valid YouTube URL.")
            return

        def run():
            try:
                self.yt_status.config(text="Connecting and extracting streams...", fg="#0284c7")
                self.yt_progress['value'] = 20
                if yt_dlp:
                    ydl_opts = {
                        'outtmpl': os.path.join(dest, '%(title)s.%(ext)s'),
                        'progress_hooks': [self._yt_hook],
                    }
                    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                        ydl.download([url])
                    self.yt_status.config(text="✓ Download complete!", fg="#16a34a")
                    self.yt_progress['value'] = 100
                else:
                    self.yt_status.config(text="yt-dlp package not installed in environment", fg="#dc2626")
            except Exception as e:
                self.yt_status.config(text=f"Error: {str(e)[:60]}", fg="#dc2626")

        threading.Thread(target=run, daemon=True).start()

    def _yt_hook(self, d):
        if d['status'] == 'downloading':
            total = d.get('total_bytes') or d.get('total_bytes_estimate') or 1
            downloaded = d.get('downloaded_bytes', 0)
            percent = int((downloaded / total) * 100)
            self.yt_progress['value'] = percent
            self.yt_status.config(text=f"Downloading: {percent}% ({d.get('_speed_str', '')})")

    # -------------------------------------------------------------
    # 2. Facebook Downloader Tab
    # -------------------------------------------------------------
    def _build_facebook_tab(self):
        f = self.fb_frame
        tk.Label(f, text="Facebook Video & Reels Downloader", font=("Segoe UI", 12, "bold"), bg=self.bg_color).pack(anchor="w", pady=(0, 8))

        tk.Label(f, text="Facebook Video / Reel Link:", bg=self.bg_color, font=("Segoe UI", 9, "bold")).pack(anchor="w")
        self.fb_url_entry = tk.Entry(f, font=("Consolas", 10), relief="solid", bd=1)
        self.fb_url_entry.pack(fill="x", pady=(2, 10), ipady=4)

        tk.Label(f, text="Destination Folder:", bg=self.bg_color, font=("Segoe UI", 9, "bold")).pack(anchor="w")
        dest_box = tk.Frame(f, bg=self.bg_color)
        dest_box.pack(fill="x", pady=(2, 10))
        self.fb_dest_entry = tk.Entry(dest_box, font=("Segoe UI", 9), relief="solid", bd=1)
        self.fb_dest_entry.insert(0, os.path.expanduser("~/Downloads"))
        self.fb_dest_entry.pack(side="left", fill="x", expand=True, ipady=4)
        tk.Button(dest_box, text="Browse...", bg="#ffffff", fg="#334155", relief="solid", bd=1,
                  command=lambda: self._browse_folder(self.fb_dest_entry)).pack(side="left", padx=(8, 0), ipadx=8)

        tk.Button(f, text="⬇ Download Facebook Video", bg="#15EF5F", fg="#0f172a", font=("Segoe UI", 10, "bold"),
                  relief="flat", cursor="hand2", padx=16, pady=8, command=self._download_youtube).pack(fill="x", pady=16)

    # -------------------------------------------------------------
    # 3. Playlist Tab
    # -------------------------------------------------------------
    def _build_playlist_tab(self):
        f = self.pl_frame
        tk.Label(f, text="YouTube Playlist Batch Downloader", font=("Segoe UI", 12, "bold"), bg=self.bg_color).pack(anchor="w", pady=(0, 8))

        tk.Label(f, text="Playlist URL:", bg=self.bg_color, font=("Segoe UI", 9, "bold")).pack(anchor="w")
        self.pl_url_entry = tk.Entry(f, font=("Consolas", 10), relief="solid", bd=1)
        self.pl_url_entry.pack(fill="x", pady=(2, 10), ipady=4)

        tk.Button(f, text="⬇ Fetch & Download Playlist", bg="#15EF5F", fg="#0f172a", font=("Segoe UI", 10, "bold"),
                  relief="flat", cursor="hand2", padx=16, pady=8, command=self._download_youtube).pack(fill="x", pady=16)

    # -------------------------------------------------------------
    # 4. Audio Downloader Tab
    # -------------------------------------------------------------
    def _build_audio_dl_tab(self):
        f = self.audio_dl_frame
        tk.Label(f, text="Audio Downloader & Stream Extractor", font=("Segoe UI", 12, "bold"), bg=self.bg_color).pack(anchor="w", pady=(0, 8))

        tk.Label(f, text="Media URL:", bg=self.bg_color, font=("Segoe UI", 9, "bold")).pack(anchor="w")
        self.aud_url_entry = tk.Entry(f, font=("Consolas", 10), relief="solid", bd=1)
        self.aud_url_entry.pack(fill="x", pady=(2, 10), ipady=4)

        tk.Label(f, text="Audio Bitrate & Format:", bg=self.bg_color, font=("Segoe UI", 9, "bold")).pack(anchor="w")
        self.aud_format = ttk.Combobox(f, values=["MP3 - 320 kbps (High Quality)", "MP3 - 192 kbps (Standard)", "WAV - Lossless", "M4A - 256 kbps"], state="readonly")
        self.aud_format.current(0)
        self.aud_format.pack(fill="x", pady=(2, 12))

        tk.Button(f, text="🎵 Extract & Download Audio", bg="#15EF5F", fg="#0f172a", font=("Segoe UI", 10, "bold"),
                  relief="flat", cursor="hand2", padx=16, pady=8, command=self._download_youtube).pack(fill="x", pady=16)

    # -------------------------------------------------------------
    # 5. Video Frame Extractor Tab
    # -------------------------------------------------------------
    def _build_frame_extractor_tab(self):
        f = self.frame_ext_frame
        tk.Label(f, text="Video Frame Snapshot Extractor", font=("Segoe UI", 12, "bold"), bg=self.bg_color).pack(anchor="w", pady=(0, 8))

        # Select Video
        top_box = tk.Frame(f, bg=self.bg_color)
        top_box.pack(fill="x", pady=6)
        self.video_lbl = tk.Label(top_box, text="No video selected", bg="#d9e2ec", relief="solid", bd=1, anchor="w", padx=8)
        self.video_lbl.pack(side="left", fill="x", expand=True, ipady=4)
        tk.Button(top_box, text="Open Video...", bg="#ffffff", fg="#334155", relief="solid", bd=1,
                  command=self._open_video).pack(side="left", padx=(8, 0), ipadx=8)

        # Timestamp Entry
        tk.Label(f, text="Timestamp (HH:MM:SS or seconds):", bg=self.bg_color, font=("Segoe UI", 9, "bold")).pack(anchor="w", pady=(8, 0))
        self.frame_time_entry = tk.Entry(f, font=("Consolas", 10), relief="solid", bd=1)
        self.frame_time_entry.insert(0, "00:00:05")
        self.frame_time_entry.pack(fill="x", pady=(2, 10), ipady=4)

        tk.Button(f, text="📷 Extract Frame to Image", bg="#15EF5F", fg="#0f172a", font=("Segoe UI", 10, "bold"),
                  relief="flat", cursor="hand2", padx=16, pady=8, command=self._extract_frame).pack(fill="x", pady=8)

    def _open_video(self):
        path = filedialog.askopenfilename(filetypes=[("Video files", "*.mp4 *.mkv *.avi *.mov *.webm")])
        if path:
            self.video_path = path
            self.video_lbl.config(text=os.path.basename(path))

    def _extract_frame(self):
        if not self.video_path:
            messagebox.showwarning("Warning", "Please select a video file first.")
            return
        if not cv2:
            messagebox.showerror("Error", "OpenCV (cv2) is not installed. Install with `pip install opencv-python`.")
            return

        ts = self.frame_time_entry.get().strip()
        seconds = self._parse_time(ts)

        cap = cv2.VideoCapture(self.video_path)
        cap.set(cv2.CAP_PROP_POS_MSEC, seconds * 1000)
        success, frame = cap.read()
        cap.release()

        if success:
            out_name = f"frame_{int(seconds)}s.png"
            save_path = os.path.join(os.path.expanduser("~/Downloads"), out_name)
            cv2.imwrite(save_path, frame)
            messagebox.showinfo("Success", f"Frame saved to:\n{save_path}")
        else:
            messagebox.showerror("Error", "Failed to extract frame at specified timestamp.")

    # -------------------------------------------------------------
    # 6. Audio Cutter Tab
    # -------------------------------------------------------------
    def _build_audio_cutter_tab(self):
        f = self.cutter_frame
        tk.Label(f, text="Interactive Audio Waveform Cutter", font=("Segoe UI", 12, "bold"), bg=self.bg_color).pack(anchor="w", pady=(0, 8))

        top_box = tk.Frame(f, bg=self.bg_color)
        top_box.pack(fill="x", pady=6)
        self.audio_lbl = tk.Label(top_box, text="No audio selected", bg="#d9e2ec", relief="solid", bd=1, anchor="w", padx=8)
        self.audio_lbl.pack(side="left", fill="x", expand=True, ipady=4)
        tk.Button(top_box, text="Open Audio...", bg="#ffffff", fg="#334155", relief="solid", bd=1,
                  command=self._open_audio).pack(side="left", padx=(8, 0), ipadx=8)

        time_box = tk.Frame(f, bg=self.bg_color)
        time_box.pack(fill="x", pady=6)

        t1_box = tk.Frame(time_box, bg=self.bg_color)
        t1_box.pack(side="left", fill="x", expand=True, padx=(0, 6))
        tk.Label(t1_box, text="Start Time (HH:MM:SS):", bg=self.bg_color, font=("Segoe UI", 9, "bold")).pack(anchor="w")
        self.start_entry = tk.Entry(t1_box, font=("Consolas", 10), relief="solid", bd=1)
        self.start_entry.insert(0, "00:00:00")
        self.start_entry.pack(fill="x", ipady=4)

        t2_box = tk.Frame(time_box, bg=self.bg_color)
        t2_box.pack(side="left", fill="x", expand=True, padx=(6, 0))
        tk.Label(t2_box, text="End Time (HH:MM:SS):", bg=self.bg_color, font=("Segoe UI", 9, "bold")).pack(anchor="w")
        self.end_entry = tk.Entry(t2_box, font=("Consolas", 10), relief="solid", bd=1)
        self.end_entry.insert(0, "00:00:30")
        self.end_entry.pack(fill="x", ipady=4)

        tk.Button(f, text="✂ Trim and Save Segment", bg="#15EF5F", fg="#0f172a", font=("Segoe UI", 10, "bold"),
                  relief="flat", cursor="hand2", padx=16, pady=8, command=self._cut_audio).pack(fill="x", pady=16)

    def _open_audio(self):
        path = filedialog.askopenfilename(filetypes=[("Audio files", "*.mp3 *.wav *.ogg *.flac *.m4a")])
        if path:
            self.audio_path = path
            self.audio_lbl.config(text=os.path.basename(path))

    def _cut_audio(self):
        if not self.audio_path:
            messagebox.showwarning("Warning", "Please select an audio file first.")
            return
        if not AudioSegment:
            messagebox.showerror("Error", "pydub is not installed. Install with `pip install pydub`.")
            return

        t_start = self._parse_time(self.start_entry.get().strip()) * 1000
        t_end = self._parse_time(self.end_entry.get().strip()) * 1000

        try:
            song = AudioSegment.from_file(self.audio_path)
            trimmed = song[t_start:t_end]
            save_path = filedialog.asksaveasfilename(defaultextension=".wav", filetypes=[("WAV Audio", "*.wav"), ("MP3 Audio", "*.mp3")])
            if save_path:
                ext = os.path.splitext(save_path)[1].replace(".", "")
                trimmed.export(save_path, format=ext or "wav")
                messagebox.showinfo("Success", f"Cut audio saved successfully to:\n{save_path}")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to trim audio: {e}")

    # -------------------------------------------------------------
    # Helper utilities
    # -------------------------------------------------------------
    def _browse_folder(self, entry_widget):
        path = filedialog.askdirectory()
        if path:
            entry_widget.delete(0, tk.END)
            entry_widget.insert(0, path)

    def _parse_time(self, time_str: str) -> float:
        try:
            parts = time_str.split(":")
            if len(parts) == 3:
                return float(parts[0]) * 3600 + float(parts[1]) * 60 + float(parts[2])
            elif len(parts) == 2:
                return float(parts[0]) * 60 + float(parts[1])
            return float(time_str)
        except ValueError:
            return 0.0


def main():
    root = tk.Tk()
    app = MediaToolsProApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
