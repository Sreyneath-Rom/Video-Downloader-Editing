import React, { useState } from 'react';
import { ToolTab, Language } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { YouTubeDownloader } from './components/YouTubeDownloader';
import { FacebookDownloader } from './components/FacebookDownloader';
import { PlaylistDownloader } from './components/PlaylistDownloader';
import { AudioDownloader } from './components/AudioDownloader';
import { VideoFrameExtractor } from './components/VideoFrameExtractor';
import { AudioCutter } from './components/AudioCutter';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ToolTab>('youtube');
  const [lang, setLang] = useState<Language>('en');

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'km' : 'en'));
  };

  return (
    <div id="app-root" className={`min-h-screen flex flex-col bg-[#e6edf5] text-slate-800 selection:bg-emerald-500 selection:text-white ${lang === 'km' ? 'font-khmer' : 'font-sans'}`}>
      <Header
        lang={lang}
        onToggleLang={toggleLanguage}
        activeTab={activeTab}
      />

      <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] w-full mx-auto gap-4 sm:gap-6 p-3 sm:p-6 lg:p-8">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          lang={lang}
          onToggleLang={toggleLanguage}
        />

        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            {activeTab === 'youtube' && <YouTubeDownloader lang={lang} />}
            {activeTab === 'facebook' && <FacebookDownloader lang={lang} />}
            {activeTab === 'playlist_youtube' && <PlaylistDownloader lang={lang} />}
            {activeTab === 'audio_download' && <AudioDownloader lang={lang} />}
            {activeTab === 'video_frame_extractor' && <VideoFrameExtractor lang={lang} />}
            {activeTab === 'audio_cutter' && <AudioCutter lang={lang} />}
          </div>
        </main>
      </div>

      <footer className="mt-auto px-4 sm:px-6 py-4 sm:py-5 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4 max-w-[1600px] w-full mx-auto border-t border-slate-300/40">
        <div className="font-medium">Media Tools Pro &bull; Video Downloader & Audio Studio</div>
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 font-medium text-[11px] sm:text-xs">
          <span>Engine: WebAudio & HTML5 Canvas API</span>
          <span>&bull;</span>
          <span className="text-slate-600">English / ភាសាខ្មែរ</span>
        </div>
      </footer>
    </div>
  );
};

export default App;

