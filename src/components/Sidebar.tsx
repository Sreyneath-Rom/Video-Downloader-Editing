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
      badgeColor: 'bg-red-100 text-red-700 border-red-200',
    },
    {
      id: 'facebook' as ToolTab,
      label: t.tabFacebook,
      icon: FacebookIcon,
      accentColor: 'text-blue-600',
      badge: 'HD Reels',
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
    },
    {
      id: 'playlist_youtube' as ToolTab,
      label: t.tabPlaylist,
      icon: ListVideo,
      accentColor: 'text-purple-600',
      badge: 'Batch',
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
    },
    {
      id: 'audio_download' as ToolTab,
      label: t.tabAudioDownload,
      icon: Music,
      accentColor: 'text-emerald-600',
      badge: '320kbps',
      badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    },
  ];

  const studioTools = [
    {
      id: 'video_frame_extractor' as ToolTab,
      label: t.tabFrameExtractor,
      icon: ImageIcon,
      accentColor: 'text-sky-600',
      badge: 'Lossless',
      badgeColor: 'bg-sky-100 text-sky-700 border-sky-200',
    },
    {
      id: 'audio_cutter' as ToolTab,
      label: t.tabAudioCutter,
      icon: Scissors,
      accentColor: 'text-teal-600',
      badge: 'Waveform',
      badgeColor: 'bg-teal-100 text-teal-700 border-teal-200',
    },
  ];

  const systemTools = [
    {
      id: 'logs' as ToolTab,
      label: t.tabLogs,
      icon: Terminal,
      accentColor: 'text-indigo-600',
      badge: logCount > 0 ? (logCount > 99 ? '99+' : logCount.toString()) : undefined,
      badgeColor: 'bg-indigo-500 text-white',
    },
  ];

  const renderToolButton = (tool: {
    id: ToolTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    badge?: string;
    badgeColor?: string;
  }) => {
    const Icon = tool.icon;
    const isActive = activeTab === tool.id;

    return (
      <button
        key={tool.id}
        id={`tab-btn-${tool.id}`}
        onClick={() => onSelectTab(tool.id)}
        className={`w-full min-h-[44px] flex items-center justify-between gap-2 px-3 sm:px-3.5 py-2 rounded-2xl text-left font-semibold text-xs sm:text-sm transition-all duration-200 ${
          isActive
            ? 'web-tab-active text-slate-900 bg-[#e6edf5] font-bold shadow-inner'
            : 'neu-btn hover:text-slate-900 text-slate-600'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`p-1.5 rounded-xl shrink-0 transition-all ${
              isActive
                ? 'neu-card-sm text-emerald-600 bg-[#e6edf5] shadow-xs'
                : 'neu-card-sm text-slate-500'
            }`}
          >
            <Icon className={`w-4 h-4 ${tool.accentColor}`} />
          </div>
          <span className="truncate leading-tight text-xs font-semibold">{tool.label}</span>
        </div>

        {tool.badge && (
          <span
            className={`px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded-md border shrink-0 ${
              tool.badgeColor || 'bg-slate-200 text-slate-700'
            }`}
          >
            {tool.badge}
          </span>
        )}
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
          <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              {lang === 'km' ? 'ម៉ាស៊ីនទាញយក' : 'DOWNLOAD MODULES'}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
              <Radio className="w-2.5 h-2.5 animate-pulse" />
              Ready
            </span>
          </div>
          <nav className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5">
            {downloaderTools.map(renderToolButton)}
          </nav>
        </div>

        {/* Category 2: Media Studio */}
        <div className="space-y-1.5">
          <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              {lang === 'km' ? 'ឧបករណ៍កែច្នៃ' : 'STUDIO UTILITIES'}
            </span>
          </div>
          <nav className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5">
            {studioTools.map(renderToolButton)}
          </nav>
        </div>

        {/* Category 3: System Terminal */}
        <div className="space-y-1.5">
          <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <span>{lang === 'km' ? 'ប្រព័ន្ធ & កំណត់ត្រា' : 'SYSTEM & TELEMETRY'}</span>
          </div>
          <nav className="grid grid-cols-1 gap-1.5">
            {systemTools.map(renderToolButton)}
          </nav>
        </div>
      </div>

      {/* Desktop / System Bottom Widget */}
      <div className="pt-3 border-t border-slate-300/70 hidden lg:block space-y-3">
        {/* Language switch */}
        <button
          id="sidebar-lang-btn"
          onClick={onToggleLang}
          className="w-full neu-btn flex items-center justify-center gap-2 px-3.5 py-2 text-slate-700 hover:text-emerald-600 text-xs font-bold transition min-h-[38px]"
        >
          <Globe className="w-4 h-4 text-emerald-600" />
          <span>{t.languageButton}</span>
        </button>

        {/* Downloads folder */}
        <div className="p-3 rounded-2xl neu-inset text-[11px] text-slate-600 space-y-1.5">
          <div className="font-bold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
              Save Location
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
              Auto-Sync
            </span>
          </div>
          <p className="text-slate-500 font-mono text-[10px] truncate bg-white/50 px-2 py-1 rounded border border-slate-200/80">
            ~/Downloads/MediaToolsPro
          </p>
        </div>

        {/* System telemetry stats */}
        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500 px-1">
          <div className="flex items-center gap-1 truncate">
            <Cpu className="w-3 h-3 text-slate-400" />
            <span>Mux: HTML5</span>
          </div>
          <div className="flex items-center gap-1 truncate">
            <HardDrive className="w-3 h-3 text-slate-400" />
            <span>API: Ready</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
