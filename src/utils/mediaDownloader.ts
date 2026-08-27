import { VideoInfo, PlaylistItem } from '../types';

export function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export async function fetchYouTubeInfo(url: string): Promise<VideoInfo> {
  const id = extractYouTubeId(url) || 'dQw4w9WgXcQ';
  let title = 'Sample YouTube Media Stream';
  let author = 'Media Creator';
  const thumbnail = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80`;

  try {
    const oembedUrl = `https://noembed.com/embed?url=${encodeURIComponent(url)}`;
    const res = await fetch(oembedUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.title) title = data.title;
      if (data.author_name) author = data.author_name;
    }
  } catch {
    // fallback to default preview
  }

  return {
    id,
    title,
    thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg` || thumbnail,
    duration: '04:15',
    author,
    formats: [
      { quality: '1080p Full HD', ext: 'mp4', size: '142.4 MB', url: '#' },
      { quality: '720p HD', ext: 'mp4', size: '68.2 MB', url: '#' },
      { quality: '480p SD', ext: 'mp4', size: '32.1 MB', url: '#' },
      { quality: '360p', ext: 'mp4', size: '18.5 MB', url: '#' },
    ]
  };
}

export async function fetchFacebookInfo(url: string): Promise<VideoInfo> {
  const cleanUrl = url.trim();
  const id = 'fb_' + Math.random().toString(36).substring(7);
  return {
    id,
    title: cleanUrl.includes('reel') ? 'Facebook Reel Video Clip' : 'Facebook Public Video Post',
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=80',
    duration: '02:30',
    author: 'Facebook Creator',
    formats: [
      { quality: 'HD 1080p (High Definition)', ext: 'mp4', size: '45.8 MB', url: '#' },
      { quality: 'SD 720p (Standard Definition)', ext: 'mp4', size: '21.4 MB', url: '#' },
      { quality: 'Audio Only (MP3)', ext: 'mp3', size: '5.2 MB', url: '#' },
    ]
  };
}

export async function fetchPlaylistInfo(_url: string): Promise<PlaylistItem[]> {
  return [
    {
      id: 'p1',
      title: '01. High Dynamic Range 4K Nature Showcase',
      duration: '03:45',
      thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80',
      selected: true,
    },
    {
      id: 'p2',
      title: '02. Ambient Chill Beats & Soundscapes',
      duration: '05:20',
      thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
      selected: true,
    },
    {
      id: 'p3',
      title: '03. Cinematic Drone Overviews - Mountain Horizon',
      duration: '04:12',
      thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300&auto=format&fit=crop&q=80',
      selected: true,
    },
    {
      id: 'p4',
      title: '04. Acoustic Master Guitar Solo Recording',
      duration: '02:58',
      thumbnail: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300&auto=format&fit=crop&q=80',
      selected: false,
    }
  ];
}

export function simulateDownload(
  onProgress: (percent: number, status: string) => void,
  onComplete: () => void
) {
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 15) + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      onProgress(100, 'Finalizing container muxing & audio sync...');
      setTimeout(() => {
        onComplete();
      }, 500);
    } else {
      onProgress(progress, `Downloading chunks... ${progress}%`);
    }
  }, 200);

  return () => clearInterval(interval);
}
