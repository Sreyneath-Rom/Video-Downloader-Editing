import React, { useState, useEffect } from 'react';
import {
  ToolTab,
  Language,
  GlobalDownloadState,
  UiMode,
  DesktopTheme,
  DownloadQueueTask,
} from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { YouTubeDownloader } from './components/YouTubeDownloader';
import { FacebookDownloader } from './components/FacebookDownloader';
import { PlaylistDownloader } from './components/PlaylistDownloader';
import { AudioDownloader } from './components/AudioDownloader';
import { VideoFrameExtractor } from './components/VideoFrameExtractor';
import { AudioCutter } from './components/AudioCutter';
import { ActivityLogs } from './components/ActivityLogs';
import { GlobalStatusBar } from './components/GlobalStatusBar';
import { DesktopWindowControls } from './components/DesktopWindowControls';
import { QuickActionBar } from './components/QuickActionBar';
import { DownloadAssistModal } from './components/DownloadAssistModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { DesktopDownloadQueueDock } from './components/DesktopDownloadQueueDock';
import { DesktopMediaInspector } from './components/DesktopMediaInspector';
import { logger } from './utils/logger';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ToolTab>('youtube');
  const [lang, setLang] = useState<Language>('en');
  const [uiMode, setUiMode] = useState<UiMode>('desktop');
  const [desktopTheme, setDesktopTheme] = useState<DesktopTheme>('dark_studio');
  const [logCount, setLogCount] = useState<number>(0);
  const [assistModalOpen, setAssistModalOpen] = useState<boolean>(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [queueDockOpen, setQueueDockOpen] = useState<boolean>(false);
  const [inspectorCollapsed, setInspectorCollapsed] = useState<boolean>(false);
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

  // Global Keyboard Shortcuts (⌘K for command palette, ⌘1-7 for tabs)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      if (e.metaKey || e.altKey) {
        if (e.key === '1') {
          e.preventDefault();
          setActiveTab('youtube');
        } else if (e.key === '2') {
          e.preventDefault();
          setActiveTab('facebook');
        } else if (e.key === '3') {
          e.preventDefault();
          setActiveTab('playlist_youtube');
        } else if (e.key === '4') {
          e.preventDefault();
          setActiveTab('audio_download');
        } else if (e.key === '5') {
          e.preventDefault();
          setActiveTab('video_frame_extractor');
        } else if (e.key === '6') {
          e.preventDefault();
          setActiveTab('audio_cutter');
        } else if (e.key === '7') {
          e.preventDefault();
          setActiveTab('logs');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'km' : 'en'));
  };

  const toggleUiMode = () => {
    setUiMode((prev) => {
      const next = prev === 'web' ? 'desktop' : 'web';
      if (next === 'web') {
        setDesktopTheme('light_neumorphic');
      } else {
        setDesktopTheme('dark_studio');
      }
      return next;
    });
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

  // Determine root CSS theme class
  const getThemeClass = () => {
    if (uiMode === 'web') return 'theme-light-neumorphic bg-[#e6edf5] text-slate-800';
    if (desktopTheme === 'dark_studio') return 'theme-dark-studio bg-[#0b0f17] text-slate-100';
    if (desktopTheme === 'sequoia_slate') return 'theme-sequoia-slate bg-[#0f172a] text-slate-100';
    return 'theme-light-neumorphic bg-[#e6edf5] text-slate-800';
  };

  return (
    <div
      id="app-root"
      className={`min-h-screen flex flex-col selection:bg-emerald-500 selection:text-white transition-colors duration-300 ${getThemeClass()} ${
        lang === 'km' ? 'font-khmer' : 'font-sans'
      }`}
    >
      {/* App Top Header */}
      <Header
        lang={lang}
        onToggleLang={toggleLanguage}
        activeTab={activeTab}
        uiMode={uiMode}
        onToggleUiMode={toggleUiMode}
        onOpenLogs={() => setActiveTab('logs')}
        onOpenAssistModal={() => setAssistModalOpen(true)}
        logCount={logCount}
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
          {/* Top Window / Desktop Studio Controls Ribbon */}
          <DesktopWindowControls
            lang={lang}
            activeTab={activeTab}
            uiMode={uiMode}
            onToggleUiMode={toggleUiMode}
            onOpenAssistModal={() => setAssistModalOpen(true)}
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
            onToggleInspector={() => setInspectorCollapsed((prev) => !prev)}
            onToggleQueue={() => setQueueDockOpen((prev) => !prev)}
            currentTheme={desktopTheme}
            onSelectTheme={setDesktopTheme}
            activeQueueCount={downloadTasks.filter((t) => t.status === 'downloading').length}
          />

          {/* Quick Demo Sample Selector */}
          <QuickActionBar
            lang={lang}
            activeTab={activeTab}
            onSelectSample={handleSelectSample}
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
            {activeTab === 'video_frame_extractor' && (
              <VideoFrameExtractor lang={lang} />
            )}
            {activeTab === 'audio_cutter' && <AudioCutter lang={lang} />}
            {activeTab === 'logs' && <ActivityLogs lang={lang} />}
          </div>
        </main>

        {/* Right Pro Media & Hardware Inspector (Desktop Studio Mode) */}
        {uiMode === 'desktop' && (
          <DesktopMediaInspector
            lang={lang}
            activeTab={activeTab}
            isCollapsed={inspectorCollapsed}
            onToggleCollapse={() => setInspectorCollapsed((prev) => !prev)}
            onOpenAssistModal={() => setAssistModalOpen(true)}
          />
        )}
      </div>

      {/* Global Bottom Status & Download Metrics Bar */}
      <GlobalStatusBar state={downloadState} lang={lang} />

      {/* Desktop Download Queue & Background Tasks Dock */}
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
        onToggleTheme={setDesktopTheme}
        currentTheme={desktopTheme}
        onToggleLang={toggleLanguage}
        onOpenAssistModal={() => setAssistModalOpen(true)}
      />

      {/* Download Options & Fast Stream Assist Modal */}
      <DownloadAssistModal
        isOpen={assistModalOpen}
        onClose={() => setAssistModalOpen(false)}
        lang={lang}
        mediaUrl={activeSampleUrl || 'https://youtube.com/watch?v=4xDzrJKXOOY'}
        mediaTitle="Universal_Stream_Direct"
        format="mp4"
        quality="1080p"
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
