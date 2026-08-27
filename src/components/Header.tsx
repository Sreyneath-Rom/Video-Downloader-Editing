import React from 'react';
import { Language, ToolTab } from '../types';
import { translations } from '../translations';
import { Sparkles, Globe, Cpu } from 'lucide-react';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  activeTab: ToolTab;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
}) => {
  const t = translations[lang];

  return (
    <header id="app-header" className="sticky top-0 z-50 bg-[#e6edf5]/95 backdrop-blur-md border-b border-[#d4deea]/80 shadow-[0_4px_16px_rgba(202,211,223,0.45)]">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 min-h-16 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl neu-card-sm flex items-center justify-center text-emerald-600 shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-sm sm:text-lg font-bold tracking-tight text-slate-800 truncate">
                {t.appTitle}
              </h1>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full neu-pill text-emerald-600 bg-[#e6edf5] shrink-0">
                PRO
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block font-medium truncate">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full neu-card-sm text-xs text-slate-600 font-medium">
            <Cpu className="w-3.5 h-3.5 text-emerald-500" />
            <span>WebAudio & WebAssembly Engine</span>
          </div>

          <button
            id="header-lang-btn"
            onClick={onToggleLang}
            className="neu-btn min-h-[40px] px-3 sm:px-4 py-2 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-emerald-600 active:scale-95 transition"
            aria-label="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
            <span className="font-bold">{t.languageButton}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

