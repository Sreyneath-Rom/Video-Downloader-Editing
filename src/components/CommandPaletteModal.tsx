import React, { useState, useEffect } from 'react';
import { Language, ToolTab, DesktopTheme } from '../types';
import {
  Search,
  Zap,
  Play,
  Film,
  Music2,
  Radio,
  Scissors,
  Terminal,
  Sun,
  Moon,
  Sparkles,
  Layers,
  Check,
  X,
  ExternalLink,
  Cpu,
  Monitor,
} from 'lucide-react';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSelectTab: (tab: ToolTab) => void;
  onSelectSample: (url: string) => void;
  onToggleTheme: (theme: DesktopTheme) => void;
  currentTheme: DesktopTheme;
  onToggleLang: () => void;
  onOpenAssistModal: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSelectTab,
  onSelectSample,
  onToggleTheme,
  currentTheme,
  onToggleLang,
  onOpenAssistModal,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items = [
    // Tools
    {
      id: 'tool-yt',
      title: lang === 'km' ? 'YouTube & គេហទំព័រ 4K (Universal Ingest)' : 'YouTube 4K & Universal Stream Ingest',
      category: 'MEDIA MODULES',
      icon: Play,
      color: 'text-red-500',
      action: () => {
        onSelectTab('youtube');
        onClose();
      },
    },
    {
      id: 'tool-fb',
      title: lang === 'km' ? 'Facebook, Reels & Instagram HD' : 'Facebook & Social Reels HD Downloader',
      category: 'MEDIA MODULES',
      icon: Film,
      color: 'text-blue-500',
      action: () => {
        onSelectTab('facebook');
        onClose();
      },
    },
    {
      id: 'tool-pl',
      title: lang === 'km' ? 'YouTube Batch Playlist Downloader' : 'Batch YouTube Playlist Queue Muxer',
      category: 'MEDIA MODULES',
      icon: Radio,
      color: 'text-purple-500',
      action: () => {
        onSelectTab('playlist_youtube');
        onClose();
      },
    },
    {
      id: 'tool-aud',
      title: lang === 'km' ? 'ទាញយកសម្លេងសុទ្ធ (MP3 320k / WAV / FLAC)' : 'High-Res Audio Extractor (320kbps MP3/WAV)',
      category: 'MEDIA MODULES',
      icon: Music2,
      color: 'text-emerald-500',
      action: () => {
        onSelectTab('audio_download');
        onClose();
      },
    },
    {
      id: 'tool-frame',
      title: lang === 'km' ? 'ដកស្រង់រូបភាពវីដេអូ (Lossless Frame Snapshot)' : 'Lossless Video Frame Extractor & Canvas',
      category: 'STUDIO UTILITIES',
      icon: Layers,
      color: 'text-sky-500',
      action: () => {
        onSelectTab('video_frame_extractor');
        onClose();
      },
    },
    {
      id: 'tool-cutter',
      title: lang === 'km' ? 'កាត់តសម្លេងស្ទូឌីយោ (Audio Waveform Trimmer)' : 'Audio Waveform Trimmer & DSP Studio',
      category: 'STUDIO UTILITIES',
      icon: Scissors,
      color: 'text-teal-500',
      action: () => {
        onSelectTab('audio_cutter');
        onClose();
      },
    },
    {
      id: 'tool-logs',
      title: lang === 'km' ? 'ស្ថានីយ៍កំណត់ត្រា & Hardware Diagnostics' : 'Activity Logs & Hardware Diagnostic Terminal',
      category: 'SYSTEM & LOGS',
      icon: Terminal,
      color: 'text-indigo-500',
      action: () => {
        onSelectTab('logs');
        onClose();
      },
    },
    // Quick Demo Presets
    {
      id: 'sample-yt4k',
      title: 'Load Demo: 4K Synthwave Stream (YouTube)',
      category: 'PRESETS & SAMPLES',
      icon: Zap,
      color: 'text-amber-500',
      action: () => {
        onSelectSample('https://www.youtube.com/watch?v=4xDzrJKXOOY');
        onSelectTab('youtube');
        onClose();
      },
    },
    {
      id: 'sample-fbreel',
      title: 'Load Demo: Viral Facebook HD Reel',
      category: 'PRESETS & SAMPLES',
      icon: Zap,
      color: 'text-amber-500',
      action: () => {
        onSelectSample('https://www.facebook.com/reel/1049283749283749');
        onSelectTab('facebook');
        onClose();
      },
    },
    {
      id: 'sample-lofi',
      title: 'Load Demo: Lo-Fi Chill Beats Track (Pure Audio)',
      category: 'PRESETS & SAMPLES',
      icon: Music2,
      color: 'text-teal-500',
      action: () => {
        onSelectSample('https://www.youtube.com/watch?v=jfKfPfyJRdk');
        onSelectTab('audio_download');
        onClose();
      },
    },
    // Actions
    {
      id: 'action-mirrors',
      title: 'Open Download Options & Fast Stream Mirrors Hub',
      category: 'ACTIONS',
      icon: ExternalLink,
      color: 'text-purple-500',
      action: () => {
        onOpenAssistModal();
        onClose();
      },
    },
    {
      id: 'theme-dark',
      title: 'Switch Theme: Pro Dark Studio (Onyx & Cyan)',
      category: 'THEME & APPEARANCE',
      icon: Moon,
      color: 'text-indigo-400',
      action: () => {
        onToggleTheme('dark_studio');
        onClose();
      },
    },
    {
      id: 'theme-sequoia',
      title: 'Switch Theme: macOS Sequoia Slate Glass',
      category: 'THEME & APPEARANCE',
      icon: Monitor,
      color: 'text-blue-400',
      action: () => {
        onToggleTheme('sequoia_slate');
        onClose();
      },
    },
    {
      id: 'theme-light',
      title: 'Switch Theme: Classic Neumorphic Studio Light',
      category: 'THEME & APPEARANCE',
      icon: Sun,
      color: 'text-amber-500',
      action: () => {
        onToggleTheme('light_neumorphic');
        onClose();
      },
    },
    {
      id: 'lang-toggle',
      title: lang === 'km' ? 'ប្តូរភាសាទៅ English' : 'Switch Language to ភាសាខ្មែរ (Khmer)',
      category: 'THEME & APPEARANCE',
      icon: Sparkles,
      color: 'text-emerald-500',
      action: () => {
        onToggleLang();
        onClose();
      },
    },
  ];

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      id="command-palette-backdrop"
      className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 pt-16 sm:pt-24 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="command-palette-window"
        className="w-full max-w-2xl bg-[#0f172a] text-slate-100 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center gap-3 bg-[#131d31]">
          <Search className="w-5 h-5 text-emerald-400 shrink-0 animate-pulse" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={
              lang === 'km'
                ? 'វាយពាក្យស្វែងរកមុខងារ, តំណភ្ជាប់, ស្បែក ឬផ្លូវកាត់...'
                : 'Type a command, tool, sample, or theme... (ESC to exit)'
            }
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none font-medium"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            ESC
          </span>
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-800/40">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm font-medium">
              No matching tools or commands found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-2.5 sm:px-3.5 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-emerald-500/20 text-white border border-emerald-500/30'
                      : 'hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg bg-slate-800/90 border border-slate-700 shrink-0 ${item.color}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs sm:text-sm font-semibold truncate text-white">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                        {item.category}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {item.id.startsWith('theme-') &&
                      currentTheme === item.id.replace('theme-', '') && (
                        <Check className="w-4 h-4 text-emerald-400" />
                      )}
                    <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                      Jump &rarr;
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-2.5 px-4 bg-[#0a0f1d] border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                &uarr;&darr;
              </kbd>{' '}
              Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                ENTER
              </kbd>{' '}
              Select
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Cpu className="w-3.5 h-3.5" />
            <span>Studio Engine Pro</span>
          </div>
        </div>
      </div>
    </div>
  );
};
