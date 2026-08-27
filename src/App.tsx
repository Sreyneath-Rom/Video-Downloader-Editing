import React, { useState, useEffect } from 'react';
import { ToolTab, Language, GlobalDownloadState } from './types';
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
import { logger } from './utils/logger';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ToolTab>('youtube');
  const [lang, setLang] = useState<Language>('en');
  const [logCount, setLogCount] = useState<number>(0);

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

  const updateGlobalState = (updated: Partial<GlobalDownloadState>) => {
    setDownloadState((prev) => ({
      ...prev,
      ...updated,
    }));
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
        onOpenLogs={() => setActiveTab('logs')}
        logCount={logCount}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1650px] w-full mx-auto gap-4 sm:gap-6 p-3 sm:p-6 lg:p-8">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          lang={lang}
          onToggleLang={toggleLanguage}
          logCount={logCount}
        />

        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            {activeTab === 'youtube' && (
              <YouTubeDownloader
                lang={lang}
                onUpdateGlobalState={updateGlobalState}
              />
            )}
            {activeTab === 'facebook' && (
              <FacebookDownloader
                lang={lang}
                onUpdateGlobalState={updateGlobalState}
              />
            )}
            {activeTab === 'playlist_youtube' && (
              <PlaylistDownloader
                lang={lang}
                onUpdateGlobalState={updateGlobalState}
              />
            )}
            {activeTab === 'audio_download' && (
              <AudioDownloader
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

      {/* App Footer */}
      <footer className="px-4 sm:px-6 py-3.5 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2 max-w-[1650px] w-full mx-auto border-t border-slate-300/40">
        <div className="font-medium">
          Media Tools Pro &bull; Universal Video Downloader & Audio Processing Suite
        </div>
        <div className="flex flex-wrap justify-center items-center gap-2 font-medium text-[11px] sm:text-xs">
          <span>Engine: WebAudio & HTML5 Canvas API</span>
          <span>&bull;</span>
          <span className="text-slate-600">English / ភាសាខ្មែរ</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
