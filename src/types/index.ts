export type Language = 'en' | 'km';
export type UiMode = 'web' | 'desktop';
export type DesktopTheme = 'dark_studio' | 'sequoia_slate' | 'light_neumorphic';

export type ToolTab = 
  | 'youtube'
  | 'tiktok'
  | 'instagram'
  | 'facebook'
  | 'playlist_youtube'
  | 'audio_download'
  | 'video_frame_extractor'
  | 'audio_cutter'
  | 'remove_bg'
  | 'logs';

export interface DownloadQueueTask {
  id: string;
  title: string;
  sourceUrl: string;
  format: string;
  quality: string;
  progress: number;
  speed: string;
  eta: string;
  size: string;
  status: 'queued' | 'downloading' | 'processing' | 'completed' | 'paused' | 'failed';
  timestamp: string;
  type: 'video' | 'audio' | 'playlist' | 'frame' | 'image';
}

export interface VideoInfo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  author: string;
  views?: string;
  likes?: string;
  soundName?: string;
  isNoWatermark?: boolean;
  formats: {
    quality: string;
    ext: string;
    size: string;
    url: string;
    id?: string;
  }[];
}

export interface PlaylistItem {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  selected: boolean;
  status?: 'pending' | 'downloading' | 'completed' | 'failed';
}

export interface ExtractedFrame {
  id: string;
  timestamp: string;
  dataUrl: string;
  timeInSeconds: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
  source?: string;
}

export interface GlobalDownloadState {
  isDownloading: boolean;
  progress: number;
  speed: string;
  eta: string;
  downloadedBytes: string;
  totalBytes: string;
  statusText: string;
  activeItem?: string;
}

