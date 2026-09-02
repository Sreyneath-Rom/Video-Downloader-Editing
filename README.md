# Media Studio Pro (ឧបករណ៍មេឌៀកម្រិតខ្ពស់)

A modern multimedia suite for downloading, extracting, editing, and processing video, audio, and image content. Available both as a high-performance **Web Application (React 18 + TypeScript + Tailwind CSS)** and as a standalone **Desktop GUI (`main.py` with Python Tkinter + `yt-dlp` + `OpenCV` + `pydub`)**.

---

## 📌 Overview

**Media Studio Pro** unifies video downloading, stream extraction, video frame capture, audio trimming, and AI-powered image background removal into a sleek, responsive interface with bilingual localization in **English** and **Khmer (ភាសាខ្មែរ)**.

### ✨ Key Highlights
- **Comprehensive Media Toolkit**:
  - 🌐 **Web Suite**: 100% browser-native AI background removal, audio trimming, and frame extraction using Web Audio, Canvas, and WebAssembly APIs.
  - 💻 **Desktop Edition (`main.py`)**: Native Python desktop application powered by `yt-dlp`, `OpenCV (cv2)`, and `pydub`.
- **Streamlined Icon-Only Header**: Fast tool switching with active highlights, real-time engine status indicator, and responsive mobile tray.
- **Full Bilingual Localization**: Seamless instant switching between English and Khmer (ភាសាខ្មែរ).
- **Interactive Audio Waveform Visualizer**: Drag-and-click interval selection, loop auditions, and lossless WAV/MP3 exports.
- **AI Image Background Removal & Matting**: Instant subject extraction with dual-pane split comparison, custom backdrops, solid color fills, and manual brush refinement.
- **Precision Video Snapshotting**: Frame-by-frame seeking (`-1s`, `-0.1s`, `+0.1s`, `+1s`) with instant PNG/JPEG snapshot generation.
- **Dark & Light Studio Themes**: Contrast-optimized themes designed for extended creative sessions.

---

## 🚀 Features & Tools

### 1. 📺 YouTube / Universal Video Downloader
Download high-resolution video streams from YouTube with complete metadata previews.
- **Options**: Resolution selector (`4K 2160p`, `1440p 2K`, `1080p Full HD`, `720p HD`, `480p SD`, `360p`), custom format choices, and live download simulation.

### 2. 🎵 TikTok Video & Audio Downloader
Save clean, watermark-free TikTok videos, high-fidelity audio, and covers.
- **Options**: `Clean HD Video (No Watermark)`, `Original Audio MP3 (320kbps)`, or `HD Cover Image (JPG)`.

### 3. 📸 Instagram Reels & Media Downloader
Extract Instagram Reels, IGTV clips, carousel photos, and stories.
- **Options**: `1080p Full HD Video`, `Original High-Res Photo (JPG)`, or `Audio Track (MP3)`.

### 4. 📘 Facebook Video Downloader
Save public videos, reels, and clips from Facebook in HD or SD quality.
- **Options**: `1080p HD Video`, `720p SD Video`, or direct audio extraction.

### 5. 📑 YouTube Playlist Batch Downloader
Batch process and download entire YouTube playlists with item selection checklists.
- **Options**: Selective queueing, batch format selector (`Video MP4` or `Audio MP3`), and individual progress bars.

### 6. 🎧 Audio Stream Downloader
Extract pure audio tracks from online media sources with studio-grade bitrate controls.
- **Options**: Containers (`MP3`, `M4A / AAC`, `WAV`, `FLAC`), bitrates (`320 kbps`, `256 kbps`, `192 kbps`, `128 kbps`).

### 7. ✂️ AI Image Background Remover & Matting
Remove backgrounds from photos locally using browser-based AI edge-detection and smart matting.
- **Features**:
  - Instant background cutout with adjustable edge sensitivity and smoothing.
  - Dual-pane interactive split-slider before/after comparison.
  - Background replacements: transparent PNG, solid colors, gradient presets, or custom uploaded image backdrops.
  - Manual brush refinement: Erase and Restore brushes with adjustable brush size and softness.

### 8. 🎞️ Video Frame Extractor
Extract lossless snapshots from any local video file without quality degradation.
- **Features**: Scrubbing controls, frame micro-stepping, instant PNG/JPEG frame export, and batch image gallery.

### 9. 🎼 Interactive Audio Waveform Cutter
Trim, slice, and fade audio tracks locally with visual waveform feedback.
- **Features**: Visual waveform scrubber, timestamp inputs (`HH:MM:SS`), audition playback, looping, and lossless WAV/MP3 export.

### 10. 📜 Terminal Activity Logs
Real-time diagnostic console logging background operations, download metrics, extraction events, and system errors.

---

## 🌐 Bilingual Support (English / ភាសាខ្មែរ)

Toggle between English and Khmer at any time via the header globe button:
- **English**: Standard technical terms and tooltips.
- **ភាសាខ្មែរ (Khmer)**: Native translations for all tabs, controls, placeholders, tooltips, and status notifications.

---

## 💻 Running the Applications

### 🌐 Option A: Web Application (React + Vite + TypeScript)

#### Prerequisites
- Node.js 18+ and npm / bun / pnpm

#### Quickstart:
```bash
# 1. Install dependencies
npm install

# 2. Start local dev server (port 3000)
npm run dev

# 3. Type-check & lint
npm run lint

# 4. Production build
npm run build
```

---

### 🖥️ Option B: Desktop Edition (`main.py` Python GUI)

The repository includes a standalone Python desktop application (`main.py`) powered by `yt-dlp`, `OpenCV (cv2)`, `Pillow`, and `pydub`.

#### Desktop Capabilities:
- 🌐 **Universal Downloader**: Downloads from YouTube (4K / 1080p muxing), Facebook, TikTok, Instagram, Twitter/X, Reddit, Bilibili, and 1000+ online video sources.
- 📑 **Interactive Playlist Batching**: Analyzes playlist contents, displays an interactive Treeview checklist with video titles & durations, and downloads queues with individual progress indicators.
- 🎵 **Audio Stream Extractor**: Studio-grade MP3 (320kbps), M4A, Lossless WAV, FLAC, and OPUS with embedded metadata & ID3 tags.
- 🎞️ **Real-time Video Frame Canvas**: Open local video files, scrub through video frames with visual canvas playback, and capture stills (single frame or batch 1 frame/sec).
- ✂️ **Audio Waveform Trimmer**: Interactive audio waveform canvas with clickable interval placement and FFmpeg lossless export.
- 📜 **Live Activity Terminal**: Real-time console showing download logs, speed, ETA, and FFmpeg diagnostics.
- 🇰🇭 **Bilingual Support**: Instant toggling between English and Khmer (ភាសាខ្មែរ).

#### Prerequisites
- Python 3.8+
- `ffmpeg` installed on your system PATH (`brew install ffmpeg` on macOS, `sudo apt install ffmpeg` on Linux, or from [ffmpeg.org](https://ffmpeg.org/) on Windows).

#### Quick Start for main.py:
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run the desktop application
python main.py
```

---

## 🛠️ Project Structure

```
├── main.py                    # Standalone Python Tkinter desktop application
├── requirements.txt           # Python desktop dependencies (yt-dlp, opencv-python, pydub, pillow)
├── index.html                 # Web app HTML entry point
├── package.json               # Web app dependencies and scripts
├── vite.config.ts             # Vite configuration
├── tailwind.config.js         # Tailwind CSS styling configuration
├── README.md                  # Documentation and user guide
├── src/
│   ├── main.tsx               # React application entry point
│   ├── App.tsx                # Main app layout, tab routing & state
│   ├── translations.ts        # English & Khmer localization dictionaries
│   ├── types/
│   │   └── index.ts           # Shared TypeScript interfaces & types
│   ├── components/
│   │   ├── Header.tsx         # Icon-only streamlined navigation header & theme switcher
│   │   ├── Sidebar.tsx        # Navigation sidebar with categorized tool tabs
│   │   ├── YouTubeDownloader.tsx # YouTube & Universal 4K downloader
│   │   ├── TikTokDownloader.tsx  # TikTok watermark-free downloader
│   │   ├── InstagramDownloader.tsx # Instagram Reels & Media downloader
│   │   ├── FacebookDownloader.tsx  # Facebook video downloader
│   │   ├── PlaylistDownloader.tsx  # Batch playlist processor
│   │   ├── AudioDownloader.tsx     # Audio stream extraction & bitrate selector
│   │   ├── ImageBackgroundRemover.tsx # AI background cutout & canvas matting
│   │   ├── VideoFrameExtractor.tsx # Frame snapshot extractor & gallery
│   │   ├── AudioCutter.tsx         # Waveform canvas cutter & audio export
│   │   ├── LogsPanel.tsx           # Real-time terminal activity logs
│   │   └── icons.tsx               # Brand and utility vector icons
│   └── utils/
│       ├── audioProcessing.ts # Web Audio buffer decode, waveform & WAV encoder
│       ├── videoProcessing.ts # HTML5 Canvas frame snapshot & export helpers
│       ├── mediaDownloader.ts # Media stream simulation & validation utilities
│       ├── logger.ts          # Centralized event logging dispatcher
│       └── time.ts            # Timestamp parsers & time formatters
```

---

## 🔒 Privacy & Local Processing

All audio trimming, waveform decoding, video frame extractions, and AI image background removals execute **100% locally in your browser** using the Web Audio API, WebAssembly, and HTML5 Canvas. Your uploaded files are never uploaded to any external server.
