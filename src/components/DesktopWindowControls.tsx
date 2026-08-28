import React, { useState } from 'react';
import { Language, ToolTab, UiMode, DesktopTheme } from '../types';
import { translations } from '../translations';
import {
  Monitor,
  Globe,
  Folder,
  CheckCircle2,
  Copy,
  ExternalLink,
  Search,
  Sliders,
  Moon,
  Sun,
  Layers,
} from 'lucide-react';

interface DesktopWindowControlsProps {
  lang: Language;
  activeTab: ToolTab;
  uiMode: UiMode;
  onToggleUiMode: () => void;
  onOpenAssistModal?: () => void;
  onOpenCommandPalette?: () => void;
  onToggleInspector?: () => void;
  onToggleQueue?: () => void;
  currentTheme?: DesktopTheme;
  onSelectTheme?: (theme: DesktopTheme) => void;
  activeQueueCount?: number;
}

export const DesktopWindowControls: React.FC<DesktopWindowControlsProps> = ({
  lang,
  activeTab,
  uiMode,
  onToggleUiMode,
  onOpenAssistModal,
  onOpenCommandPalette,
  onToggleInspector,
  onToggleQueue,
  currentTheme = 'dark_studio',
  onSelectTheme,
  activeQueueCount = 0,
}) => {
  const t = translations[lang];
  const [copiedDir, setCopiedDir] = useState(false);
  const [isWindowMaximized, setIsWindowMaximized] = useState(true);

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

  const handleCopyDir = () => {
    navigator.clipboard.writeText('~/Downloads/MediaToolsPro');
    setCopiedDir(true);
    setTimeout(() => setCopiedDir(false), 2000);
  };

  return (
    <div
      id="desktop-window-bar"
      className="w-full desktop-window-header border rounded-2xl p-2 sm:p-2.5 sm:px-4 flex flex-wrap items-center justify-between gap-2.5 shadow-sm text-xs font-medium select-none transition-all duration-300"
    >
      {/* Left: Window Traffic Lights & Breadcrumbs */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {/* macOS Traffic Light Buttons */}
        <div className="flex items-center gap-1.5 shrink-0 group">
          <span
            className="w-3 h-3 rounded-full mac-traffic-close transition shadow-xs cursor-pointer flex items-center justify-center text-[8px] text-rose-950 font-bold opacity-90 hover:opacity-100"
            title="Close Window"
          >
            <span className="hidden group-hover:block">&times;</span>
          </span>
          <span
            className="w-3 h-3 rounded-full mac-traffic-min transition shadow-xs cursor-pointer flex items-center justify-center text-[8px] text-amber-950 font-bold opacity-90 hover:opacity-100"
            title="Minimize"
          >
            <span className="hidden group-hover:block">&minus;</span>
          </span>
          <span
            onClick={() => setIsWindowMaximized(!isWindowMaximized)}
            className="w-3 h-3 rounded-full mac-traffic-max transition shadow-xs cursor-pointer flex items-center justify-center text-[8px] text-emerald-950 font-bold opacity-90 hover:opacity-100"
            title="Expand / Fullscreen"
          >
            <span className="hidden group-hover:block">+</span>
          </span>
        </div>

        <div className="h-4 w-px bg-slate-400/30 hidden sm:block shrink-0" />

        {/* Title & Active Module Indicator */}
        <div className="flex items-center gap-1.5 min-w-0 font-semibold truncate text-[11px] sm:text-xs">
          <span className="text-slate-400 hidden md:inline">Media Tools Pro</span>
          <span className="text-slate-400/60 hidden md:inline">/</span>
          <span className="font-bold flex items-center gap-1.5 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="truncate">{getTabDisplayName()}</span>
          </span>
        </div>
      </div>

      {/* Center: Command Palette Trigger (`⌘K`) & Search */}
      <div className="flex-1 max-w-xs hidden xl:flex items-center">
        {onOpenCommandPalette && (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl neu-inset text-slate-400 hover:text-slate-200 transition text-[11px] font-medium"
            title="Open Command Palette (⌘K)"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-emerald-400" />
              <span>Search modules, presets, URLs...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800/80 text-[10px] font-mono border border-slate-700 text-slate-300">
              ⌘K
            </kbd>
          </button>
        )}
      </div>

      {/* Right: Studio Controls (Theme, Queue, Inspector, Mode) */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Command Launcher (Mobile/Tablet view) */}
        {onOpenCommandPalette && (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="xl:hidden flex items-center gap-1 p-1.5 sm:px-2.5 rounded-xl neu-btn text-xs font-semibold"
            title="Search Commands (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">⌘K</span>
          </button>
        )}

        {/* Theme Quick Selector */}
        {onSelectTheme && (
          <div className="hidden sm:flex items-center p-0.5 rounded-xl neu-inset gap-1">
            <button
              type="button"
              onClick={() => onSelectTheme('dark_studio')}
              className={`p-1 px-2 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
                currentTheme === 'dark_studio'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Pro Dark Studio (Onyx & Cyan)"
            >
              <Moon className="w-3 h-3" />
              <span>Dark</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTheme('sequoia_slate')}
              className={`p-1 px-2 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
                currentTheme === 'sequoia_slate'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="macOS Sequoia Slate Glass"
            >
              <Monitor className="w-3 h-3" />
              <span>Sequoia</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTheme('light_neumorphic')}
              className={`p-1 px-2 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
                currentTheme === 'light_neumorphic'
                  ? 'bg-amber-500/20 text-amber-600 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Classic Neumorphic Light"
            >
              <Sun className="w-3 h-3" />
              <span>Light</span>
            </button>
          </div>
        )}

        {/* Copy Download Path Chip */}
        <button
          type="button"
          onClick={handleCopyDir}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl neu-btn text-[11px] font-semibold transition"
          title="Click to copy save directory path"
        >
          <Folder className="w-3.5 h-3.5 text-amber-500" />
          <span className="font-mono text-[10px] truncate max-w-[100px]">~/Downloads</span>
          {copiedDir ? (
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          ) : (
            <Copy className="w-3 h-3 text-slate-400" />
          )}
        </button>

        {/* Task Queue Drawer Toggle */}
        {onToggleQueue && (
          <button
            type="button"
            onClick={onToggleQueue}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl neu-btn text-xs font-bold transition relative"
            title="Toggle Download Queue & Background Tasks"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">{lang === 'km' ? 'ភារកិច្ច' : 'Queue'}</span>
            {activeQueueCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-[9px] font-mono text-slate-950 font-black animate-pulse">
                {activeQueueCount}
              </span>
            )}
          </button>
        )}

        {/* Inspector Panel Toggle */}
        {onToggleInspector && (
          <button
            type="button"
            onClick={onToggleInspector}
            className="hidden 2xl:flex items-center gap-1 px-2.5 py-1 rounded-xl neu-btn text-xs font-bold transition"
            title="Toggle Studio Inspector Panel"
          >
            <Sliders className="w-3.5 h-3.5 text-sky-500" />
            <span>Inspector</span>
          </button>
        )}

        {/* View Mode Toggle: Desktop Edition vs Web App */}
        <button
          id="toggle-ui-mode-btn"
          type="button"
          onClick={onToggleUiMode}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl neu-btn font-bold text-xs hover:text-emerald-500 transition"
          title="Switch between Modern Web Application & Desktop Studio Mode"
        >
          {uiMode === 'web' ? (
            <>
              <Monitor className="w-3.5 h-3.5 text-emerald-500" />
              <span>{lang === 'km' ? 'ប្លង់ Desktop' : 'Desktop UI'}</span>
            </>
          ) : (
            <>
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              <span>{lang === 'km' ? 'ប្លង់ Web App' : 'Web App UI'}</span>
            </>
          )}
        </button>

        {/* Direct Stream Assist Mirrors Hub */}
        {onOpenAssistModal && (
          <button
            type="button"
            onClick={onOpenAssistModal}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl neu-btn text-purple-400 font-bold text-xs hover:text-purple-300 transition"
            title="Download Options & Fast Stream Mirrors"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="hidden sm:inline">Mirrors</span>
          </button>
        )}
      </div>
    </div>
  );
};
