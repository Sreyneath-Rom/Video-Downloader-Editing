import React from 'react';
import { GlobalDownloadState, Language } from '../types';
import { translations } from '../translations';
import { Download, Gauge, Clock, HardDrive, CheckCircle } from 'lucide-react';

interface GlobalStatusBarProps {
  state: GlobalDownloadState;
  lang: Language;
}

export const GlobalStatusBar: React.FC<GlobalStatusBarProps> = ({ state, lang }) => {
  const t = translations[lang];

  return (
    <div
      id="global-status-bar"
      className="bg-[#e6edf5] border-t border-slate-300/80 px-3 sm:px-6 py-2.5 shadow-[0_-4px_12px_rgba(202,211,223,0.35)]"
    >
      <div className="max-w-[1650px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left State & Task info */}
        <div className="flex items-center gap-3 w-full md:w-auto min-w-0">
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
              state.isDownloading
                ? 'neu-card-sm text-emerald-600 bg-emerald-50'
                : 'neu-card-sm text-slate-500'
            }`}
          >
            {state.isDownloading ? (
              <Download className="w-3.5 h-3.5 animate-bounce text-emerald-600" />
            ) : (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 truncate">
                {state.statusText || t.ready}
              </span>
              {state.activeItem && (
                <span className="text-[11px] text-slate-500 font-mono truncate hidden sm:inline">
                  &bull; {state.activeItem}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Middle / Right: Live Progress & Speed/ETA meters */}
        <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-6 w-full md:w-auto text-xs font-medium text-slate-600">
          {/* Progress Bar */}
          <div className="flex-1 md:w-48 flex items-center gap-2">
            <div className="flex-1 h-2.5 rounded-full neu-inset overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-200"
                style={{ width: `${state.progress}%` }}
              ></div>
            </div>
            <span className="font-bold text-[11px] text-slate-700 w-8 text-right font-mono">
              {Math.round(state.progress)}%
            </span>
          </div>

          {/* Speed */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Gauge className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-mono text-[11px] font-bold text-slate-700">
              {state.isDownloading ? state.speed : '0.0 MB/s'}
            </span>
          </div>

          {/* ETA */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-mono text-[11px] font-bold text-slate-700">
              {state.isDownloading ? state.eta : '--:--'}
            </span>
          </div>

          {/* Size */}
          <div className="hidden lg:flex items-center gap-1.5 shrink-0">
            <HardDrive className="w-3.5 h-3.5 text-purple-600" />
            <span className="font-mono text-[11px] text-slate-600">
              {state.isDownloading ? `${state.downloadedBytes} / ${state.totalBytes}` : 'Ready'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
