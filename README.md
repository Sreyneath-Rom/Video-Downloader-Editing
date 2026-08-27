# Media Tools Pro (ឧបករណ៍មេឌៀកម្រិតខ្ពស់)

A modern multimedia suite for downloading, extracting, and editing video and audio content. Available both as a high-performance **Web Application (React 18 + TypeScript + Tailwind CSS)** and as a standalone **Desktop GUI (`main.py` with Python Tkinter + `yt-dlp` + `OpenCV` + `pydub`)**.

---

## 📌 Overview

**Media Tools Pro** unifies essential media downloading, stream extraction, video frame capture, and audio trimming into a single, intuitive interface with full bilingual localization in **English** and **Khmer (ភាសាខ្មែរ)**.

### ✨ Key Highlights
- **Dual Deployment Options**:
  - 🌐 **Web Suite**: 100% browser-native audio trimming and frame extraction using Web Audio & Canvas APIs.
  - 💻 **Desktop Edition (`main.py`)**: Native Python Tkinter application powered by `yt-dlp`, `OpenCV (cv2)`, and `pydub`.
- **Tactile Neumorphic Design**: Soft dual-shadow aesthetic with high-contrast typography and responsive controls.
- **Full Bilingual Localization**: Seamless instant switching between English and Khmer (ភាសាខ្មែរ).
- **Interactive Audio Waveform Visualizer**: Drag-and-click interval selection, loop auditions, and lossless WAV/MP3 exports.
- **Precision Video Snapshotting**: Frame-by-frame seeking (`-1s`, `-0.1s`, `+0.1s`, `+1s`) with instant PNG/JPEG frame generation.

---

## 🚀 Features & Tools

### 1. 📺 YouTube Video Downloader
Download high-resolution video streams from YouTube with full metadata previews.
- **Process**: Paste a YouTube link → select resolution (`1080p Full HD`, `720p HD`, `480p SD`, `360p`) → set destination folder → Start Download.

### 2. 📘 Facebook Video Downloader
Save public videos, reels, and clips from Facebook.
- **Process**: Paste Facebook video/reel URL → choose HD or SD format → set destination → Start Download.

### 3. 📑 YouTube Playlist Downloader
Batch download all video tracks in a public YouTube playlist with individual progress trackers.
- **Process**: Paste playlist link → click **Fetch Playlist** → select/deselect specific items → choose format (Video MP4 / Audio MP3) → Download Selected.

### 4. 🎵 Audio Stream Downloader
Extract pure audio tracks from online media sources with studio-grade bitrate controls.
- **Process**: Paste URL → choose container (`MP3`, `M4A / AAC`, `WAV`) → select bitrate (`320 kbps`, `192 kbps`, `128 kbps`) → Download Audio.

### 5. 🎞️ Video Frame Extractor
Extract lossless, high-resolution snapshots from any video file without quality degradation.
- **Process**: Upload/drag video (`MP4`, `WebM`, `MKV`, `AVI`, `MOV`) → scrub or seek to timestamp → click **Extract Image** → preview and download individual stills or batch ZIP.

### 6. ✂️ Interactive Audio Waveform Cutter
Trim and slice audio tracks locally with interactive waveform visualization.
- **Process**: Upload audio file (`MP3`, `WAV`, `OGG`, `FLAC`, `M4A`) → click waveform or enter `HH:MM:SS` timestamps → audition via **Play Selection** or **Loop** → export to WAV or MP3.

---

## 🌐 Bilingual Support (English / ភាសាខ្មែរ)

Toggle between English and Khmer at any time using the header language toggle:
- **English**: Standard interface terms and technical tooltips.
- **ភាសាខ្មែរ (Khmer)**: Native translations for all tabs, buttons, inputs, placeholders, and status alerts.

---

## 💻 Running the Applications

### 🌐 Option A: Web Application (React + Vite + TypeScript)

#### Prerequisites
- Node.js 18+ and npm / bun

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

The repository includes a standalone Python desktop application (`main.py`) matching all 6 tool modules.

#### Prerequisites
- Python 3.8+
- `ffmpeg` installed on your system PATH (`brew install ffmpeg` on macOS, `sudo apt install ffmpeg` on Linux, or from [ffmpeg.org](https://ffmpeg.org/) on Windows).

#### Quickstart:
```bash
# 1. Install Python packages
pip install yt-dlp opencv-python pydub pillow

# 2. Launch the desktop GUI
python main.py
```

---

## 🛠️ Project Structure

```
├── main.py                    # Standalone Python Tkinter desktop application
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
│   │   ├── Header.tsx         # Top banner with language selector
│   │   ├── Sidebar.tsx        # Navigation sidebar with tactile tab buttons
│   │   ├── YouTubeDownloader.tsx # YouTube downloader component
│   │   ├── FacebookDownloader.tsx # Facebook downloader component
│   │   ├── PlaylistDownloader.tsx # Batch playlist processor
│   │   ├── AudioDownloader.tsx   # Audio extraction & bitrate selector
│   │   ├── VideoFrameExtractor.tsx # Frame snapshot extractor & gallery
│   │   ├── AudioCutter.tsx       # Waveform canvas cutter & playback
│   │   └── icons.tsx          # SVG icons
│   └── utils/
│       ├── audioProcessing.ts # Web Audio buffer decode, waveform & WAV encoder
│       ├── videoProcessing.ts # HTML5 Canvas frame snapshot & export helpers
│       ├── mediaDownloader.ts # Media stream simulation & validation utilities
│       └── time.ts            # Timestamp parsers & time formatters
```

---

## 🔒 Privacy & Security

All audio trimming, waveform decoding, and video frame captures in the web app execute **100% locally in your browser** using the Web Audio API and HTML5 Canvas. Your uploaded files are never uploaded to any external server.
