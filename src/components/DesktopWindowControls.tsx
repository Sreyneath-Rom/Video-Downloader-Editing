import React from 'react';
import { Language, ToolTab } from '../types';
import { translations } from '../translations';
import {
  Search,
  Layers,
} from 'lucide-react';

interface DesktopWindowControlsProps {
  lang: Language;
  activeTab: ToolTab;
  onOpenCommandPalette?: () => void;
  onToggleQueue?: () => void;
  activeQueueCount?: number;
}

export const DesktopWindowControls: React.FC<DesktopWindowControlsProps> = ({
  lang,
  activeTab,
  onOpenCommandPalette,
  onToggleQueue,
  activeQueueCount = 0,
}) => {
  const t = translations[lang];

  const getTabDisplayName = () => {
    switch (activeTab) {
      case 'youtube':
        return t.tabYouTube;
      case 'facebook':
        return t.tabFacebook;
      case 'playlist_youtube':
        return t.tabPlaylist;
      case 'audio_download':
        return t.tabAudioDownload;
      case 'video_frame_extractor':
        return t.tabFrameExtractor;
      case 'audio_cutter':
        return t.tabAudioCutter;
      case 'logs':
        return t.tabLogs;
      default:
        return 'Workspace';
    }
  };

  return (
    <div
      id="desktop-window-bar"
      className="w-full desktop-window-header border rounded-2xl p-2 sm:p-2.5 sm:px-4 flex flex-wrap items-center justify-between gap-2.5 shadow-sm text-xs font-medium select-none transition-all duration-300"
    >
      {/* Left: Active Module Indicator */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <div className="flex items-center gap-2 min-w-0 font-semibold truncate text-xs sm:text-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="font-bold text-slate-800 dark:text-slate-100 truncate">{getTabDisplayName()}</span>
        </div>
      </div>

      {/* Center: Command Search Bar */}
      <div className="flex-1 max-w-sm hidden md:flex items-center">
        {onOpenCommandPalette && (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl neu-inset text-slate-400 hover:text-slate-200 transition text-[11px] font-medium"
            title="Search modules and presets"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-emerald-500" />
              <span>Search modules, presets, URLs...</span>
            </div>
          </button>
        )}
      </div>

      {/* Right: Actions (Queue Toggle & Quick Search) */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Mobile Search button */}
        {onOpenCommandPalette && (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl neu-btn text-xs font-semibold"
            title="Search"
          >
            <Search className="w-3.5 h-3.5 text-emerald-500" />
            <span>Search</span>
          </button>
        )}

        {/* Task Queue Drawer Toggle */}
        {onToggleQueue && (
          <button
            type="button"
            onClick={onToggleQueue}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl neu-btn text-xs font-bold transition relative text-slate-700 dark:text-slate-200"
            title="Toggle Download Queue & Background Tasks"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-500" />
            <span>{lang === 'km' ? 'ជួរទាញយក' : 'Task Queue'}</span>
            {activeQueueCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-[9px] font-mono text-slate-950 font-black animate-pulse">
                {activeQueueCount}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
