import React, { useState, useEffect } from 'react';
import { ToolTab, Language, GlobalDownloadState, UiMode } from './types';
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
import { logger } from './utils/logger';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ToolTab>('youtube');
  const [lang, setLang] = useState<Language>('en');
  const [uiMode, setUiMode] = useState<UiMode>('web');
  const [logCount, setLogCount] = useState<number>(0);
  const [assistModalOpen, setAssistModalOpen] = useState<boolean>(false);
  const [activeSampleUrl, setActiveSampleUrl] = useState<string>('');

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

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'km' : 'en'));
  };

  const toggleUiMode = () => {
    setUiMode((prev) => (prev === 'web' ? 'desktop' : 'web'));
  };

  const updateGlobalState = (updated: Partial<GlobalDownloadState>) => {
    setDownloadState((prev) => ({
      ...prev,
      ...updated,
    }));
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

  return (
    <div
      id="app-root"
      className={`min-h-screen flex flex-col bg-[#e6edf5] text-slate-800 selection:bg-emerald-500 selection:text-white ${
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

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1650px] w-full mx-auto gap-4 sm:gap-6 p-3 sm:p-5 lg:p-7">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          lang={lang}
          onToggleLang={toggleLanguage}
          logCount={logCount}
        />

        <main className="flex-1 min-w-0 flex flex-col gap-3 sm:gap-4">
          {/* Top Window / Web App Ribbon Controls */}
          <DesktopWindowControls
            lang={lang}
            activeTab={activeTab}
            uiMode={uiMode}
            onToggleUiMode={toggleUiMode}
            onOpenAssistModal={() => setAssistModalOpen(true)}
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
      </div>

      {/* Global Bottom Status & Download Metrics Bar */}
      <GlobalStatusBar state={downloadState} lang={lang} />

      {/* Download Options Assist Modal */}
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
      <footer className="px-4 sm:px-6 py-3.5 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2 max-w-[1650px] w-full mx-auto border-t border-slate-300/50">
        <div className="font-medium">
          Media Tools Pro &bull; Universal Video Downloader & Audio Studio Suite
        </div>
        <div className="flex flex-wrap justify-center items-center gap-2 font-medium text-[11px] sm:text-xs">
          <span>Direct Stream &bull; HTML5 Audio &bull; Lossless Extractor</span>
          <span>&bull;</span>
          <span className="text-slate-600">English / ភាសាខ្មែរ</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
