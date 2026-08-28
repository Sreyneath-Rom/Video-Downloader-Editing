import React from 'react';
import { ToolTab, Language } from '../types';
import { translations } from '../translations';
import { YoutubeIcon, FacebookIcon } from './icons';
import {
  Image as ImageIcon,
  Scissors,
  Music,
  ListVideo,
  Globe,
  Radio,
  Terminal,
  FolderOpen,
  Zap,
  HardDrive,
  Cpu,
  Layers,
} from 'lucide-react';

interface SidebarProps {
  activeTab: ToolTab;
  onSelectTab: (tab: ToolTab) => void;
  lang: Language;
  onToggleLang: () => void;
  logCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  lang,
  onToggleLang,
  logCount = 0,
}) => {
  const t = translations[lang];

  const downloaderTools = [
    {
      id: 'youtube' as ToolTab,
      label: t.tabYouTube,
      icon: YoutubeIcon,
      accentColor: 'text-red-500',
      badge: '4K / 60FPS',
      badgeColor: 'bg-red-500/10 text-red-500 border-red-500/20',
      shortcut: '⌘1',
    },
    {
      id: 'facebook' as ToolTab,
      label: t.tabFacebook,
      icon: FacebookIcon,
      accentColor: 'text-blue-500',
      badge: 'HD Reels',
      badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      shortcut: '⌘2',
    },
    {
      id: 'playlist_youtube' as ToolTab,
      label: t.tabPlaylist,
      icon: ListVideo,
      accentColor: 'text-purple-500',
      badge: 'Batch',
      badgeColor: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      shortcut: '⌘3',
    },
    {
      id: 'audio_download' as ToolTab,
      label: t.tabAudioDownload,
      icon: Music,
      accentColor: 'text-emerald-500',
      badge: '320kbps',
      badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      shortcut: '⌘4',
    },
  ];

  const studioTools = [
    {
      id: 'video_frame_extractor' as ToolTab,
      label: t.tabFrameExtractor,
      icon: ImageIcon,
      accentColor: 'text-sky-500',
      badge: 'Lossless',
      badgeColor: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
      shortcut: '⌘5',
    },
    {
      id: 'audio_cutter' as ToolTab,
      label: t.tabAudioCutter,
      icon: Scissors,
      accentColor: 'text-teal-500',
      badge: 'Waveform',
      badgeColor: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
      shortcut: '⌘6',
    },
  ];

  const systemTools = [
    {
      id: 'logs' as ToolTab,
      label: t.tabLogs,
      icon: Terminal,
      accentColor: 'text-indigo-400',
      badge: logCount > 0 ? (logCount > 99 ? '99+' : logCount.toString()) : undefined,
      badgeColor: 'bg-indigo-500 text-white',
      shortcut: '⌘7',
    },
  ];

  const renderToolButton = (tool: {
    id: ToolTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    badge?: string;
    badgeColor?: string;
    shortcut?: string;
  }) => {
    const Icon = tool.icon;
    const isActive = activeTab === tool.id;

    return (
      <button
        key={tool.id}
        id={`tab-btn-${tool.id}`}
        onClick={() => onSelectTab(tool.id)}
        className={`w-full min-h-[44px] flex items-center justify-between gap-2 px-3 sm:px-3.5 py-2 rounded-2xl text-left font-semibold text-xs sm:text-sm transition-all duration-200 group ${
          isActive
            ? 'web-tab-active font-bold shadow-sm'
            : 'neu-btn hover:text-emerald-500'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`p-1.5 rounded-xl shrink-0 transition-all ${
              isActive
                ? 'neu-card-sm text-emerald-500'
                : 'neu-card-sm text-slate-400 group-hover:text-emerald-400'
            }`}
          >
            <Icon className={`w-4 h-4 ${tool.accentColor}`} />
          </div>
          <span className="truncate leading-tight text-xs font-semibold">{tool.label}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {tool.badge && (
            <span
              className={`px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded-md border shrink-0 ${
                tool.badgeColor || 'bg-slate-700/50 text-slate-300 border-slate-600'
              }`}
            >
              {tool.badge}
            </span>
          )}
          {tool.shortcut && (
            <span className="hidden xl:inline text-[9px] font-mono text-slate-400 opacity-60 group-hover:opacity-100">
              {tool.shortcut}
            </span>
          )}
        </div>
      </button>
    );
  };

  return (
    <aside
      id="app-sidebar"
      className="w-full lg:w-72 neu-card p-3 sm:p-4 shrink-0 flex flex-col justify-between self-start gap-4 sm:gap-5"
    >
      <div className="space-y-4">
        {/* Category 1: Download Engines */}
        <div className="space-y-1.5">
          <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              {lang === 'km' ? 'ម៉ាស៊ីនទាញយក' : 'DOWNLOAD MODULES'}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold font-mono">
              <Radio className="w-2.5 h-2.5 animate-pulse" />
              ONLINE
            </span>
          </div>
          <nav className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5">
            {downloaderTools.map(renderToolButton)}
          </nav>
        </div>

        {/* Category 2: Media Studio */}
        <div className="space-y-1.5">
          <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              {lang === 'km' ? 'ឧបករណ៍កែច្នៃ' : 'STUDIO UTILITIES'}
            </span>
          </div>
          <nav className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5">
            {studioTools.map(renderToolButton)}
          </nav>
        </div>

        {/* Category 3: System Terminal */}
        <div className="space-y-1.5">
          <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span>{lang === 'km' ? 'ប្រព័ន្ធ & កំណត់ត្រា' : 'SYSTEM & TELEMETRY'}</span>
          </div>
          <nav className="grid grid-cols-1 gap-1.5">
            {systemTools.map(renderToolButton)}
          </nav>
        </div>
      </div>

      {/* Desktop / System Bottom Widget */}
      <div className="pt-3 border-t border-slate-400/20 hidden lg:block space-y-3">
        {/* Language switch */}
        <button
          id="sidebar-lang-btn"
          onClick={onToggleLang}
          className="w-full neu-btn flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold transition min-h-[38px]"
        >
          <Globe className="w-4 h-4 text-emerald-500" />
          <span>{t.languageButton}</span>
        </button>

        {/* Downloads folder */}
        <div className="p-3 rounded-2xl neu-inset text-[11px] space-y-1.5">
          <div className="font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
              Save Location
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
              Direct-Mux
            </span>
          </div>
          <p className="font-mono text-[10px] truncate px-2 py-1 rounded neu-card-sm">
            ~/Downloads/MediaToolsPro
          </p>
        </div>

        {/* System telemetry stats */}
        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 px-1">
          <div className="flex items-center gap-1 truncate">
            <Cpu className="w-3 h-3 text-emerald-400" />
            <span>WASM: Ready</span>
          </div>
          <div className="flex items-center gap-1 truncate">
            <HardDrive className="w-3 h-3 text-sky-400" />
            <span>NVENC: Auto</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
