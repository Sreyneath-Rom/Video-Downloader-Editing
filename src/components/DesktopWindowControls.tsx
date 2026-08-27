import React, { useState } from 'react';
import { Language, ToolTab, UiMode } from '../types';
import { translations } from '../translations';
import {
  Monitor,
  Globe,
  Folder,
  HardDrive,
  Cpu,
  CheckCircle2,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface DesktopWindowControlsProps {
  lang: Language;
  activeTab: ToolTab;
  uiMode: UiMode;
  onToggleUiMode: () => void;
  onOpenAssistModal?: () => void;
}

export const DesktopWindowControls: React.FC<DesktopWindowControlsProps> = ({
  lang,
  activeTab,
  uiMode,
  onToggleUiMode,
  onOpenAssistModal,
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
      className="w-full bg-[#dbe4ee]/90 backdrop-blur-md border border-[#cbd8e5] rounded-2xl p-2.5 sm:px-4 flex flex-wrap items-center justify-between gap-2.5 shadow-sm text-xs font-medium text-slate-700 select-none"
    >
      {/* Left: Window Traffic Lights & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Traffic Light Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="w-3 h-3 rounded-full bg-rose-400 hover:bg-rose-500 transition shadow-xs border border-rose-500/30 cursor-pointer"
            title="Close Workspace"
          />
          <span
            className="w-3 h-3 rounded-full bg-amber-400 hover:bg-amber-500 transition shadow-xs border border-amber-500/30 cursor-pointer"
            title="Minimize"
          />
          <span
            onClick={() => setIsWindowMaximized(!isWindowMaximized)}
            className="w-3 h-3 rounded-full bg-emerald-400 hover:bg-emerald-500 transition shadow-xs border border-emerald-500/30 cursor-pointer"
            title="Maximize / Restore"
          />
        </div>

        <div className="h-4 w-px bg-slate-300 hidden sm:block shrink-0" />

        {/* Title Breadcrumbs */}
        <div className="flex items-center gap-1.5 min-w-0 text-slate-600 font-semibold truncate text-[11px] sm:text-xs">
          <span className="text-slate-500 hidden md:inline">Media Tools Pro</span>
          <span className="text-slate-400 hidden md:inline">/</span>
          <span className="text-slate-800 font-bold flex items-center gap-1 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse shrink-0" />
            {getTabDisplayName()}
          </span>
        </div>
      </div>

      {/* Center: System Telemetry (WebAudio & Direct Stream API) */}
      <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-600">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg neu-inset bg-[#e6edf5]/70 border border-slate-300/40">
          <Cpu className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-mono font-medium">Mux Core: 60fps</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg neu-inset bg-[#e6edf5]/70 border border-slate-300/40">
          <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-mono font-medium">Stream: Attached</span>
        </div>
      </div>

      {/* Right: Mode Switcher & Destination Directory */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Copy Download Path Chip */}
        <button
          type="button"
          onClick={handleCopyDir}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl neu-btn text-[11px] font-semibold text-slate-600 hover:text-emerald-700 transition"
          title="Click to copy save directory path"
        >
          <Folder className="w-3.5 h-3.5 text-amber-600" />
          <span className="font-mono text-[10px] truncate max-w-[130px]">~/Downloads</span>
          {copiedDir ? (
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          ) : (
            <Copy className="w-3 h-3 text-slate-400" />
          )}
        </button>

        {/* View Mode Toggle: Desktop Edition vs Web App */}
        <button
          id="toggle-ui-mode-btn"
          type="button"
          onClick={onToggleUiMode}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl neu-btn text-slate-800 font-bold text-xs hover:text-emerald-700 transition"
          title="Switch between Modern Web Application & Desktop Studio Mode"
        >
          {uiMode === 'web' ? (
            <>
              <Monitor className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'km' ? 'ប្លង់ Desktop' : 'Desktop UI'}</span>
            </>
          ) : (
            <>
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>{lang === 'km' ? 'ប្លង់ Web App' : 'Web App UI'}</span>
            </>
          )}
        </button>

        {/* Mirror Options Hub */}
        {onOpenAssistModal && (
          <button
            type="button"
            onClick={onOpenAssistModal}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl neu-btn text-purple-700 font-bold text-xs hover:text-purple-900 transition"
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
