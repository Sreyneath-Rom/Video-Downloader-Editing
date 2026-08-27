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

  const tools = [
    {
      id: 'youtube' as ToolTab,
      label: t.tabYouTube,
      icon: YoutubeIcon,
      accentColor: 'text-red-500',
    },
    {
      id: 'facebook' as ToolTab,
      label: t.tabFacebook,
      icon: FacebookIcon,
      accentColor: 'text-blue-600',
    },
    {
      id: 'playlist_youtube' as ToolTab,
      label: t.tabPlaylist,
      icon: ListVideo,
      accentColor: 'text-purple-600',
    },
    {
      id: 'audio_download' as ToolTab,
      label: t.tabAudioDownload,
      icon: Music,
      accentColor: 'text-emerald-600',
    },
    {
      id: 'video_frame_extractor' as ToolTab,
      label: t.tabFrameExtractor,
      icon: ImageIcon,
      accentColor: 'text-sky-600',
    },
    {
      id: 'audio_cutter' as ToolTab,
      label: t.tabAudioCutter,
      icon: Scissors,
      accentColor: 'text-teal-600',
    },
    {
      id: 'logs' as ToolTab,
      label: t.tabLogs,
      icon: Terminal,
      accentColor: 'text-indigo-600',
      badge: logCount > 0 ? (logCount > 99 ? '99+' : logCount.toString()) : undefined,
    },
  ];

  return (
    <aside id="app-sidebar" className="w-full lg:w-72 neu-card p-3 sm:p-5 shrink-0 flex flex-col justify-between self-start gap-4 sm:gap-6">
      <div className="space-y-3 sm:space-y-4">
        <div className="px-2 py-1 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
          <span>{lang === 'km' ? 'ម៉ឺនុយមុខងារ' : 'MEDIA MODULES'}</span>
          <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            Active
          </span>
        </div>

        {/* Responsive grid for tabs */}
        <nav className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2 sm:gap-2.5">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTab === tool.id;

            return (
              <button
                key={tool.id}
                id={`tab-btn-${tool.id}`}
                onClick={() => onSelectTab(tool.id)}
                className={`w-full min-h-[46px] flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 rounded-2xl text-left font-semibold text-xs sm:text-sm transition-all duration-200 ${
                  isActive
                    ? 'neu-pill-inset text-slate-900 bg-[#e6edf5] font-bold shadow-inner'
                    : 'neu-btn hover:text-slate-900 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`p-1.5 rounded-xl shrink-0 transition-all ${
                      isActive
                        ? 'neu-card-sm text-emerald-600 bg-[#e6edf5]'
                        : 'neu-card-sm text-slate-500'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${tool.accentColor}`} />
                  </div>
                  <span className="truncate leading-tight">{tool.label}</span>
                </div>

                {tool.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-500 text-white rounded-full shrink-0">
                    {tool.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-300/60 hidden lg:block space-y-4">
        <button
          id="sidebar-lang-btn"
          onClick={onToggleLang}
          className="w-full neu-btn flex items-center justify-center gap-2 px-4 py-2.5 text-slate-700 hover:text-emerald-600 text-xs font-bold transition min-h-[42px]"
        >
          <Globe className="w-4 h-4 text-emerald-600" />
          <span>{t.languageButton}</span>
        </button>

        <div className="p-3.5 rounded-2xl neu-inset text-[11px] text-slate-600 space-y-1.5">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <FolderOpen className="w-3.5 h-3.5 text-emerald-600" />
            Downloads Directory
          </div>
          <p className="text-slate-500 font-mono text-[10px] truncate bg-white/40 px-2 py-1 rounded border border-slate-200">
            ~/Downloads/MediaToolsPro
          </p>
        </div>
      </div>
    </aside>
  );
};
