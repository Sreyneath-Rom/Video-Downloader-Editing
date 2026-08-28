import React, { useState } from 'react';
import { Language, ToolTab } from '../types';
import {
  Sliders,
  Cpu,
  HardDrive,
  CheckCircle2,
  FolderOpen,
  Sparkles,
  Zap,
  ChevronRight,
  ChevronLeft,
  Volume2,
  Video,
  FileCode,
} from 'lucide-react';

interface DesktopMediaInspectorProps {
  lang: Language;
  activeTab: ToolTab;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenAssistModal?: () => void;
}

export const DesktopMediaInspector: React.FC<DesktopMediaInspectorProps> = ({
  lang,
  activeTab,
  isCollapsed,
  onToggleCollapse,
  onOpenAssistModal,
}) => {
  const [hwAcceleration, setHwAcceleration] = useState(true);
  const [embedMeta, setEmbedMeta] = useState(true);
  const [copiedFolder, setCopiedFolder] = useState(false);

  const handleCopyFolder = () => {
    navigator.clipboard.writeText('~/Downloads/MediaToolsPro');
    setCopiedFolder(true);
    setTimeout(() => setCopiedFolder(false), 2000);
  };

  if (isCollapsed) {
    return (
      <div className="hidden 2xl:flex flex-col items-center py-4 px-1.5 neu-card self-start rounded-2xl gap-3 text-slate-500">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1.5 rounded-xl neu-btn text-slate-700 hover:text-emerald-600 transition"
          title="Expand Desktop Inspector"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-[10px] font-mono [writing-mode:vertical-rl] rotate-180 uppercase tracking-widest font-bold text-slate-400 py-2">
          Studio Inspector
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>
    );
  }

  return (
    <aside
      id="desktop-media-inspector"
      className="hidden 2xl:flex flex-col w-72 neu-card p-4 shrink-0 self-start gap-4 text-xs select-none"
    >
      {/* Inspector Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-300/70">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <Sliders className="w-4 h-4 text-emerald-600" />
          <span className="uppercase tracking-wider text-[11px]">
            {lang === 'km' ? 'ផ្ទាំងត្រួតពិនិត្យស្ទូឌីយោ' : 'Studio Inspector'}
          </span>
        </div>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition"
          title="Collapse Inspector"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Active Pipeline Profile */}
      <div className="p-2.5 rounded-xl neu-card-sm space-y-1 bg-emerald-500/10 border border-emerald-500/20">
        <div className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">
          Active Pipeline
        </div>
        <div className="text-xs font-bold capitalize text-slate-800 truncate">
          {activeTab.replace('_', ' ')}
        </div>
        <div className="text-[10px] text-slate-500 font-mono">
          Direct Stream Socket &bull; Zero Buffer Loss
        </div>
      </div>

      {/* Hardware Telemetry Section */}
      <div className="space-y-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
          <span>Engine Telemetry</span>
          <span className="text-emerald-600 font-mono text-[9px]">ONLINE</span>
        </div>

        <div className="p-2.5 rounded-xl neu-inset space-y-2 text-[11px] font-mono">
          <div className="flex items-center justify-between text-slate-700">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Cpu className="w-3.5 h-3.5 text-blue-500" />
              Mux Engine
            </span>
            <span className="font-semibold text-emerald-600">HTML5 + WASM</span>
          </div>

          <div className="flex items-center justify-between text-slate-700">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Volume2 className="w-3.5 h-3.5 text-purple-500" />
              Audio Core
            </span>
            <span className="font-semibold text-slate-700">48kHz / 32-bit</span>
          </div>

          <div className="flex items-center justify-between text-slate-700">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Video className="w-3.5 h-3.5 text-rose-500" />
              Canvas HW
            </span>
            <span className="font-semibold text-slate-700">WebGL 2.0</span>
          </div>

          <div className="flex items-center justify-between text-slate-700">
            <span className="flex items-center gap-1.5 text-slate-500">
              <HardDrive className="w-3.5 h-3.5 text-emerald-500" />
              Disk Cache
            </span>
            <span className="font-semibold text-slate-700">Direct Stream</span>
          </div>
        </div>
      </div>

      {/* Storage Disk Space */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Local Storage Space
        </div>
        <div className="p-2.5 rounded-xl neu-inset space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-700">
            <span>Free Space:</span>
            <span className="font-mono font-bold text-emerald-700">184.2 GB / 512 GB</span>
          </div>
          <div className="w-full bg-slate-300 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '64%' }} />
          </div>
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleCopyFolder}
              className="text-[10px] text-slate-600 hover:text-emerald-700 font-mono flex items-center gap-1 truncate"
            >
              <FolderOpen className="w-3 h-3 text-amber-500 shrink-0" />
              <span className="truncate">~/Downloads/MediaToolsPro</span>
            </button>
            {copiedFolder && <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />}
          </div>
        </div>
      </div>

      {/* Hardware Settings Toggles */}
      <div className="space-y-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Pro Encoding Flags
        </div>

        <div className="space-y-2">
          <label className="flex items-center justify-between p-2 rounded-xl neu-card-sm cursor-pointer text-slate-700">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-medium">Hardware Boost</span>
            </div>
            <input
              type="checkbox"
              checked={hwAcceleration}
              onChange={(e) => setHwAcceleration(e.target.checked)}
              className="accent-emerald-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl neu-card-sm cursor-pointer text-slate-700">
            <div className="flex items-center gap-2">
              <FileCode className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-medium">Embed ID3 Tags</span>
            </div>
            <input
              type="checkbox"
              checked={embedMeta}
              onChange={(e) => setEmbedMeta(e.target.checked)}
              className="accent-emerald-600 rounded"
            />
          </label>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="pt-2 border-t border-slate-300/70 space-y-2">
        {onOpenAssistModal && (
          <button
            type="button"
            onClick={onOpenAssistModal}
            className="w-full neu-btn-primary py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Download Hub</span>
          </button>
        )}
      </div>
    </aside>
  );
};
