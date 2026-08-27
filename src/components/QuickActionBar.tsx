import React from 'react';
import { Language, ToolTab } from '../types';
import {
  Zap,
  Play,
  Film,
  Music2,
  Radio,
} from 'lucide-react';

interface QuickActionBarProps {
  lang: Language;
  activeTab: ToolTab;
  onSelectSample?: (url: string) => void;
}

export const QuickActionBar: React.FC<QuickActionBarProps> = ({
  lang,
  activeTab,
  onSelectSample,
}) => {
  // Samples depending on active tab
  const samples = [
    {
      label: '4K Synthwave Clip',
      icon: Play,
      tab: 'youtube',
      url: 'https://www.youtube.com/watch?v=4xDzrJKXOOY',
      color: 'text-red-500',
    },
    {
      label: '1080p Nature Reel',
      icon: Film,
      tab: 'youtube',
      url: 'https://www.youtube.com/watch?v=Bey4XXJAqS8',
      color: 'text-emerald-500',
    },
    {
      label: 'Viral Facebook Reel',
      icon: Film,
      tab: 'facebook',
      url: 'https://www.facebook.com/reel/1049283749283749',
      color: 'text-blue-500',
    },
    {
      label: 'Facebook HD Video',
      icon: Play,
      tab: 'facebook',
      url: 'https://www.facebook.com/watch/?v=987654321012345',
      color: 'text-sky-500',
    },
    {
      label: 'Top 10 Playlist Batch',
      icon: Radio,
      tab: 'playlist_youtube',
      url: 'https://www.youtube.com/playlist?list=PLrAl54X5vJ5F8sK4M34pA_F_GZ7N_demo',
      color: 'text-purple-500',
    },
    {
      label: 'Lo-Fi Chill Beat Track',
      icon: Music2,
      tab: 'audio_download',
      url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
      color: 'text-teal-500',
    },
  ];

  const relevantSamples = samples.filter(
    (s) => s.tab === activeTab || (activeTab !== 'youtube' && activeTab !== 'facebook' && activeTab !== 'playlist_youtube' && activeTab !== 'audio_download' && s.tab === 'youtube')
  );

  if (relevantSamples.length === 0) return null;

  return (
    <div
      id="web-quick-action-ribbon"
      className="neu-card-sm p-3 sm:px-4 bg-[#e6edf5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs border border-white/70"
    >
      <div className="flex items-center gap-2 text-slate-700 font-bold">
        <Zap className="w-4 h-4 text-amber-500 shrink-0" />
        <span>{lang === 'km' ? 'គំរូតំណភ្ជាប់សាកល្បងរហ័ស:' : 'Quick Demo Samples:'}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {relevantSamples.map((s, idx) => {
          const Icon = s.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectSample && onSelectSample(s.url)}
              className="px-2.5 py-1 rounded-xl neu-btn text-[11px] font-semibold text-slate-700 hover:text-emerald-700 flex items-center gap-1.5 transition active:scale-95 bg-white/40"
              title={`Click to load demo URL: ${s.url}`}
            >
              <Icon className={`w-3 h-3 ${s.color}`} />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
