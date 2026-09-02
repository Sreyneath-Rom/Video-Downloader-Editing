import React, { useState } from 'react';
import { Language, ToolTab } from '../types';
import { translations } from '../translations';
import {
  Sparkles,
  Globe,
  Terminal,
  Moon,
  Sun,
  Zap,
  Music,
  Scissors,
  Image as ImageIcon,
  ListVideo,
  Menu,
  X,
  AudioWaveform,
} from 'lucide-react';
import { TikTokIcon, InstagramIcon, FacebookIcon, YoutubeIcon } from './icons';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  activeTab: ToolTab;
  onSelectTab?: (tab: ToolTab) => void;
  onOpenLogs?: () => void;
  logCount?: number;
  isDark?: boolean;
  onToggleTheme?: () => void;
  onOpenCommandPalette?: () => void;
  onToggleQueue?: () => void;
  activeQueueCount?: number;
  downloadState?: unknown;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  activeTab,
  onSelectTab,
  isDark = false,
  onToggleTheme,
}) => {
  const t = translations[lang];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // List of all tools as icon-only buttons
  const toolIcons: {
    id: ToolTab;
    label: string;
    icon: React.ReactNode;
    color: string;
    activeBg: string;
  }[] = [
    {
      id: 'youtube',
      label: t.tabYouTube,
      icon: <YoutubeIcon className="w-4 h-4" />,
      color: 'text-red-500',
      activeBg: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
    },
    {
      id: 'tiktok',
      label: t.tabTikTok,
      icon: <TikTokIcon className="w-4 h-4" />,
      color: 'text-cyan-400',
      activeBg: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
    },
    {
      id: 'instagram',
      label: t.tabInstagram,
      icon: <InstagramIcon className="w-4 h-4" />,
      color: 'text-pink-500',
      activeBg: 'bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/30',
    },
    {
      id: 'facebook',
      label: t.tabFacebook,
      icon: <FacebookIcon className="w-4 h-4" />,
      color: 'text-blue-500',
      activeBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
    },
    {
      id: 'playlist_youtube',
      label: t.tabPlaylist,
      icon: <ListVideo className="w-4 h-4" />,
      color: 'text-purple-500',
      activeBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
    },
    {
      id: 'audio_download',
      label: t.tabAudioDownload,
      icon: <Music className="w-4 h-4" />,
      color: 'text-amber-500',
      activeBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    },
    {
      id: 'remove_bg',
      label: t.tabRemoveBg,
      icon: <Scissors className="w-4 h-4" />,
      color: 'text-emerald-500',
      activeBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'video_frame_extractor',
      label: t.tabFrameExtractor,
      icon: <ImageIcon className="w-4 h-4" />,
      color: 'text-sky-500',
      activeBg: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
    },
    {
      id: 'audio_cutter',
      label: t.tabAudioCutter,
      icon: <AudioWaveform className="w-4 h-4" />,
      color: 'text-indigo-500',
      activeBg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    },
    {
      id: 'logs',
      label: t.tabLogs,
      icon: <Terminal className="w-4 h-4" />,
      color: 'text-slate-400',
      activeBg: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
    },
  ];

  const getActiveTabTitle = () => {
    const activeTool = toolIcons.find((t) => t.id === activeTab);
    return activeTool ? activeTool.label : 'Media Studio';
  };

  return (
    <header
      id="app-header"
      className="sticky top-0 z-50 bg-white/90 dark:bg-[#0b0f17]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-colors duration-200"
    >
      <div className="max-w-[1780px] mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left Section: Brand Logo & Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Mobile Menu Toggle */}
          <button
            id="header-mobile-toggle-btn"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Toggle Tools Navigation"
            title="Toggle Tools"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {/* Logo Badge */}
          <div
            className="relative flex items-center justify-center group cursor-pointer"
            onClick={() => onSelectTab?.('youtube')}
            title="Media Studio PRO"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-[1.5px] shadow-xs group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-emerald-400">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              </div>
            </div>
            {/* Realtime Engine Activity Dot */}
            <span
              className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5"
              title="Multimedia Engine Online"
            >
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-white dark:border-[#0b0f17]"></span>
            </span>
          </div>

          {/* Brand Name */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1">
                <span>Media Studio</span>
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  PRO
                </span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-500/10 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                <Zap className="w-2.5 h-2.5" />
                v3.0
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                {getActiveTabTitle()}
              </span>
            </div>
          </div>
        </div>

        {/* Center Section: Tools Icon-Only Bar (Desktop & Tablet) */}
        {onSelectTab && (
          <div className="hidden md:flex items-center justify-center gap-1 px-2 py-1 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
            {toolIcons.map((tool) => {
              const isActive = activeTab === tool.id;
              return (
                <button
                  key={tool.id}
                  id={`header-tool-btn-${tool.id}`}
                  onClick={() => onSelectTab(tool.id)}
                  title={tool.label}
                  aria-label={tool.label}
                  className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer ${
                    isActive
                      ? `${tool.activeBg} border shadow-xs scale-105 font-bold`
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <span className={isActive ? '' : tool.color}>
                    {tool.icon}
                  </span>
                  {isActive && (
                    <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Right Section: Theme Toggle & Language Selector */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Theme Switcher Toggle */}
          {onToggleTheme && (
            <button
              id="header-theme-btn"
              onClick={onToggleTheme}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-100/90 dark:bg-slate-900/90 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-emerald-500 transition cursor-pointer"
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Studio'}
              aria-label="Toggle Color Theme"
            >
              {isDark ? (
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
              ) : (
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 dark:text-slate-300 transition-transform rotate-0 hover:-rotate-12" />
              )}
            </button>
          )}

          {/* Language Switcher Button */}
          <button
            id="header-lang-btn"
            onClick={onToggleLang}
            className="h-8 sm:h-9 px-2 sm:px-2.5 rounded-lg bg-slate-100/90 dark:bg-slate-900/90 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 active:scale-95 transition cursor-pointer"
            aria-label="Switch Language (English / ភាសាខ្មែរ)"
            title={lang === 'en' ? 'ប្តូរទៅភាសាខ្មែរ (Khmer)' : 'Switch to English'}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-bold text-[11px] sm:text-xs">{lang === 'en' ? 'ខ្មែរ' : 'EN'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Only on small screens when hamburger is clicked) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0e1420]/95 px-3 py-3 shadow-lg transition-all animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {lang === 'km' ? 'ឧបករណ៍ទាំងអស់' : 'All Media Tools'}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {getActiveTabTitle()}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2 py-1">
            {toolIcons.map((tool) => {
              const isActive = activeTab === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => {
                    onSelectTab?.(tool.id);
                    setMobileMenuOpen(false);
                  }}
                  title={tool.label}
                  aria-label={tool.label}
                  className={`h-11 rounded-lg flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                    isActive
                      ? `${tool.activeBg} border font-bold shadow-xs`
                      : 'bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className={isActive ? '' : tool.color}>{tool.icon}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
