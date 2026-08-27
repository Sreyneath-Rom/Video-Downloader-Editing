export type Language = 'en' | 'km';

export type ToolTab = 
  | 'youtube'
  | 'facebook'
  | 'playlist_youtube'
  | 'audio_download'
  | 'video_frame_extractor'
  | 'audio_cutter';

export interface VideoInfo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  author: string;
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
}

export interface ExtractedFrame {
  id: string;
  timestamp: string;
  dataUrl: string;
  timeInSeconds: number;
}
