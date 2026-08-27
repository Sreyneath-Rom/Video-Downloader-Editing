export type Language = 'en' | 'km';

export type ToolTab = 
  | 'youtube'
  | 'facebook'
  | 'playlist_youtube'
  | 'audio_download'
  | 'video_frame_extractor'
  | 'audio_cutter'
  | 'logs';

export interface VideoInfo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  author: string;
  views?: string;
  formats: {
    quality: string;
    ext: string;
    size: string;
    url: string;
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
