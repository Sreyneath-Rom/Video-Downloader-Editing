import React, { useState, useEffect } from 'react';
import {
  ToolTab,
  Language,
  GlobalDownloadState,
  DesktopTheme,
  DownloadQueueTask,
} from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { YouTubeDownloader } from './components/YouTubeDownloader';
import { TikTokDownloader } from './components/TikTokDownloader';
import { InstagramDownloader } from './components/InstagramDownloader';
import { FacebookDownloader } from './components/FacebookDownloader';
import { PlaylistDownloader } from './components/PlaylistDownloader';
import { AudioDownloader } from './components/AudioDownloader';
import { VideoFrameExtractor } from './components/VideoFrameExtractor';
import { AudioCutter } from './components/AudioCutter';
import { ImageBackgroundRemover } from './components/ImageBackgroundRemover';
import { ActivityLogs } from './components/ActivityLogs';
import { GlobalStatusBar } from './components/GlobalStatusBar';
import { DesktopWindowControls } from './components/DesktopWindowControls';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { DesktopDownloadQueueDock } from './components/DesktopDownloadQueueDock';
import { logger } from './utils/logger';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ToolTab>('youtube');
  const [lang, setLang] = useState<Language>('en');
  const [theme, setTheme] = useState<DesktopTheme>('dark_studio');
  const [logCount, setLogCount] = useState<number>(0);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [queueDockOpen, setQueueDockOpen] = useState<boolean>(false);
  const [activeSampleUrl, setActiveSampleUrl] = useState<string>('');

  const [downloadTasks, setDownloadTasks] = useState<DownloadQueueTask[]>([
    {
      id: 'task-demo-1',
      title: 'Synthwave_Sunset_Drive_4K_Pro.mp4',
      sourceUrl: 'https://youtube.com/watch?v=4xDzrJKXOOY',
      format: 'MP4',
      quality: '4K 2160p 60fps',
      progress: 100,
      speed: '18.4 MB/s',
      eta: '00:00',
      size: '248.5 MB',
      status: 'completed',
      timestamp: 'Just now',
      type: 'video',
    },
    {
      id: 'task-demo-2',
      title: 'Khmer_Acoustic_Melody_Master.mp3',
      sourceUrl: 'https://youtube.com/watch?v=jfKfPfyJRdk',
      format: 'MP3',
      quality: '320 kbps (Lossless DSP)',
      progress: 100,
      speed: '8.2 MB/s',
      eta: '00:00',
      size: '14.2 MB',
      status: 'completed',
      timestamp: '5 min ago',
      type: 'audio',
    },
  ]);

  const [downloadState, setDownloadState] = useState<GlobalDownloadState>({
    isDownloading: false,
    progress: 0,
    speed: '0.0 MB/s',
    eta: '--:--',
    downloadedBytes: '0.0 MB',
    totalBytes: '0.0 MB',
    statusText: 'Ready',
  });

  useEffect(() => {
    const unsub = logger.subscribe((logs) => {
      setLogCount(logs.length);
    });
    return () => unsub();
  }, []);

  // Global Keyboard Shortcuts (⌘K for command search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'km' : 'en'));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark_studio' ? 'light_neumorphic' : 'dark_studio'));
  };

  const updateGlobalState = (updated: Partial<GlobalDownloadState>) => {
    setDownloadState((prev) => {
      const next = { ...prev, ...updated };
      if (updated.isDownloading && updated.activeItem) {
        setDownloadTasks((oldTasks) => {
          const existing = oldTasks.find((t) => t.title === updated.activeItem);
          if (existing) {
            return oldTasks.map((t) =>
              t.id === existing.id
                ? {
                    ...t,
                    progress: updated.progress ?? t.progress,
                    speed: updated.speed ?? t.speed,
                    eta: updated.eta ?? t.eta,
                    status: (updated.progress ?? 0) >= 100 ? 'completed' : 'downloading',
                  }
                : t
            );
          } else {
            const newTask: DownloadQueueTask = {
              id: `task-${Date.now()}`,
              title: updated.activeItem || 'Media_Stream_Direct',
              sourceUrl: activeSampleUrl || 'https://youtube.com/watch?v=direct',
              format: activeTab === 'audio_download' ? 'MP3' : 'MP4',
              quality: activeTab === 'audio_download' ? '320 kbps' : '1080p 60fps',
              progress: updated.progress ?? 5,
              speed: updated.speed ?? '12.4 MB/s',
              eta: updated.eta ?? '00:15',
              size: updated.totalBytes ?? '45.0 MB',
              status: (updated.progress ?? 0) >= 100 ? 'completed' : 'downloading',
              timestamp: 'Just now',
              type: activeTab === 'audio_download' ? 'audio' : 'video',
            };
            return [newTask, ...oldTasks];
          }
        });
      }
      return next;
    });
  };

  const handleSelectSample = (url: string) => {
    setActiveSampleUrl(url);
    if (url.includes('playlist')) {
      setActiveTab('playlist_youtube');
    } else if (url.includes('tiktok.com')) {
      setActiveTab('tiktok');
    } else if (url.includes('instagram.com')) {
      setActiveTab('instagram');
    } else if (url.includes('facebook') || url.includes('fb.')) {
      setActiveTab('facebook');
    } else if (url.includes('youtube') || url.includes('youtu.be')) {
      if (activeTab !== 'audio_download') {
        setActiveTab('youtube');
      }
    }
  };

  const handleClearTasks = () => {
    setDownloadTasks([]);
  };

  const handleRemoveTask = (id: string) => {
    setDownloadTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleRetryTask = (id: string) => {
    setDownloadTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: 'downloading', progress: 10, speed: '14.2 MB/s', eta: '00:12' }
          : t
      )
    );
  };

  const isDark = theme === 'dark_studio';

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div
      id="app-root"
      className={`min-h-screen flex flex-col selection:bg-emerald-500 selection:text-white transition-colors duration-300 ${
        isDark ? 'dark theme-dark-studio bg-[#0b0f17] text-slate-100' : 'theme-light-neumorphic bg-[#e6edf5] text-slate-800'
      } ${lang === 'km' ? 'font-khmer' : 'font-sans'}`}
    >
      {/* App Top Header */}
      <Header
        lang={lang}
        onToggleLang={toggleLanguage}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenLogs={() => setActiveTab('logs')}
        logCount={logCount}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onToggleQueue={() => setQueueDockOpen((prev) => !prev)}
        activeQueueCount={downloadTasks.filter((t) => t.status === 'downloading').length}
        downloadState={downloadState}
      />

      {/* Main Studio Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1780px] w-full mx-auto gap-3 sm:gap-5 p-2 sm:p-4 lg:p-6">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          lang={lang}
          onToggleLang={toggleLanguage}
          logCount={logCount}
        />

        {/* Main Content Stage */}
        <main className="flex-1 min-w-0 flex flex-col gap-3 sm:gap-4">
          {/* Top Window Navigation Ribbon */}
          <DesktopWindowControls
            lang={lang}
            activeTab={activeTab}
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
            onToggleQueue={() => setQueueDockOpen((prev) => !prev)}
            activeQueueCount={downloadTasks.filter((t) => t.status === 'downloading').length}
          />

          {/* Active Tool View Container */}
          <div className="w-full">
            {activeTab === 'youtube' && (
              <YouTubeDownloader
                key={activeSampleUrl || 'yt'}
                lang={lang}
                onUpdateGlobalState={updateGlobalState}
              />
            )}
            {activeTab === 'tiktok' && (
              <TikTokDownloader
                key={activeSampleUrl || 'tiktok'}
                lang={lang}
                onUpdateGlobalState={updateGlobalState}
              />
            )}
            {activeTab === 'instagram' && (
              <InstagramDownloader
                key={activeSampleUrl || 'ig'}
                lang={lang}
                onUpdateGlobalState={updateGlobalState}
              />
            )}
            {activeTab === 'facebook' && (
              <FacebookDownloader
                key={activeSampleUrl || 'fb'}
                lang={lang}
                onUpdateGlobalState={updateGlobalState}
              />
            )}
            {activeTab === 'playlist_youtube' && (
              <PlaylistDownloader
                key={activeSampleUrl || 'pl'}
                lang={lang}
                onUpdateGlobalState={updateGlobalState}
              />
            )}
            {activeTab === 'audio_download' && (
              <AudioDownloader
                key={activeSampleUrl || 'aud'}
                lang={lang}
                onUpdateGlobalState={updateGlobalState}
              />
            )}
            {activeTab === 'remove_bg' && (
              <ImageBackgroundRemover lang={lang} />
            )}
            {activeTab === 'video_frame_extractor' && (
              <VideoFrameExtractor lang={lang} />
            )}
            {activeTab === 'audio_cutter' && <AudioCutter lang={lang} />}
            {activeTab === 'logs' && <ActivityLogs lang={lang} />}
          </div>
        </main>
      </div>

      {/* Global Bottom Status & Download Metrics Bar */}
      <GlobalStatusBar state={downloadState} lang={lang} />

      {/* Download Tasks & Background Queue Dock */}
      <DesktopDownloadQueueDock
        lang={lang}
        tasks={downloadTasks}
        onClearTasks={handleClearTasks}
        onRemoveTask={handleRemoveTask}
        onRetryTask={handleRetryTask}
        isOpen={queueDockOpen}
        onToggleOpen={() => setQueueDockOpen((prev) => !prev)}
      />

      {/* Spotlight / Command Palette Modal (`⌘K`) */}
      <CommandPaletteModal
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        lang={lang}
        onSelectTab={setActiveTab}
        onSelectSample={handleSelectSample}
        onToggleTheme={(newTheme) => setTheme(newTheme)}
        currentTheme={theme}
        onToggleLang={toggleLanguage}
      />

      {/* App Footer */}
      <footer className="px-4 sm:px-6 py-3.5 text-center text-xs opacity-75 flex flex-col sm:flex-row justify-between items-center gap-2 max-w-[1780px] w-full mx-auto border-t border-slate-700/20">
        <div className="font-medium">
          Media Tools Pro &bull; Universal Video Downloader & Audio Studio Suite
        </div>
        <div className="flex flex-wrap justify-center items-center gap-2 font-medium text-[11px] sm:text-xs">
          <span>Direct Stream &bull; HTML5 Audio &bull; Lossless Extractor</span>
          <span>&bull;</span>
          <span className="opacity-90">English / ភាសាខ្មែរ</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
