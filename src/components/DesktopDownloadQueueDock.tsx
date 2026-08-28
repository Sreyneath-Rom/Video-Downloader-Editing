import React, { useState } from 'react';
import { Language, DownloadQueueTask } from '../types';
import {
  Download,
  CheckCircle2,
  Trash2,
  Folder,
  RotateCw,
  X,
  ChevronUp,
  ChevronDown,
  Layers,
  HardDrive,
  FileCheck,
  Film,
  Music2,
} from 'lucide-react';

interface DesktopDownloadQueueDockProps {
  lang: Language;
  tasks: DownloadQueueTask[];
  onClearTasks: () => void;
  onRemoveTask: (id: string) => void;
  onRetryTask: (id: string) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const DesktopDownloadQueueDock: React.FC<DesktopDownloadQueueDockProps> = ({
  lang,
  tasks,
  onClearTasks,
  onRemoveTask,
  onRetryTask,
  isOpen,
  onToggleOpen,
}) => {
  const activeCount = tasks.filter((t) => t.status === 'downloading' || t.status === 'queued' || t.status === 'processing').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyPath = (task: DownloadQueueTask) => {
    navigator.clipboard.writeText(`~/Downloads/MediaToolsPro/${task.title}.${task.format.toLowerCase()}`);
    setCopiedId(task.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'audio':
        return <Music2 className="w-4 h-4 text-emerald-500" />;
      case 'playlist':
        return <Layers className="w-4 h-4 text-purple-500" />;
      case 'frame':
        return <Film className="w-4 h-4 text-sky-500" />;
      default:
        return <Film className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div
      id="desktop-tasks-dock"
      className="fixed bottom-0 right-4 sm:right-8 z-40 w-[92vw] sm:w-[460px] transition-all duration-300 select-none shadow-2xl"
    >
      {/* Dock Header Tab */}
      <div
        onClick={onToggleOpen}
        className="w-full bg-[#121a29] text-white border border-slate-700/80 rounded-t-2xl p-3 px-4 flex items-center justify-between cursor-pointer hover:bg-[#162235] transition shadow-lg"
      >
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Download className="w-4 h-4 text-emerald-400" />
            {activeCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>
          <span className="text-xs font-bold tracking-tight">
            {lang === 'km' ? 'ជួរទាញយក & ភារកិច្ចផ្ទៃខាងក្រោយ' : 'Desktop Tasks & Download Queue'}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {activeCount > 0 ? `${activeCount} Active` : `${tasks.length} Items`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <span className="text-[11px] font-mono text-emerald-400 animate-pulse font-bold hidden sm:inline">
              Processing...
            </span>
          )}
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {/* Dock Expandable Body */}
      {isOpen && (
        <div className="w-full bg-[#0d1422]/95 backdrop-blur-xl border-x border-b border-slate-700/80 p-3 sm:p-4 max-h-[380px] overflow-y-auto space-y-2.5 shadow-2xl">
          {/* Header Action Controls */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {completedCount} {lang === 'km' ? 'បានបញ្ចប់' : 'Completed'} &bull;{' '}
                {activeCount} {lang === 'km' ? 'កំពុងដំណើរការ' : 'In Progress'}
              </span>
            </div>
            {tasks.length > 0 && (
              <button
                type="button"
                onClick={onClearTasks}
                className="hover:text-rose-400 text-slate-400 flex items-center gap-1 transition"
              >
                <Trash2 className="w-3 h-3" />
                <span>{lang === 'km' ? 'សម្អាត' : 'Clear All'}</span>
              </button>
            )}
          </div>

          {/* Task Items List */}
          {tasks.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs space-y-1.5 font-medium">
              <FileCheck className="w-6 h-6 mx-auto text-slate-600 opacity-60" />
              <div>{lang === 'km' ? 'គ្មានភារកិច្ចទាញយកក្នុងជួរទេ' : 'No active download tasks in queue'}</div>
              <div className="text-[10px] text-slate-600">
                Downloads initiated from YouTube, Facebook, or Audio will appear here live.
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-2.5 rounded-xl bg-[#141e30] border border-slate-700/60 text-xs space-y-2 shadow-xs"
                >
                  {/* Row 1: Title & Actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 shrink-0">
                        {getItemIcon(task.type)}
                      </div>
                      <div className="min-w-0 truncate">
                        <div className="font-semibold text-slate-200 truncate text-[12px]">
                          {task.title}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                          <span className="uppercase px-1.5 py-0.2 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                            {task.format}
                          </span>
                          <span>{task.quality}</span>
                          <span>&bull;</span>
                          <span>{task.size}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {task.status === 'completed' ? (
                        <button
                          type="button"
                          onClick={() => handleCopyPath(task)}
                          className="p-1 rounded-md hover:bg-slate-700 text-slate-300 transition"
                          title="Copy file path"
                        >
                          {copiedId === task.id ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Folder className="w-3.5 h-3.5 text-amber-400" />
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onRetryTask(task.id)}
                          className="p-1 rounded-md hover:bg-slate-700 text-slate-300 transition"
                          title="Retry"
                        >
                          <RotateCw className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onRemoveTask(task.id)}
                        className="p-1 rounded-md hover:bg-slate-700 text-rose-400 transition"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Row 2: Progress bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden border border-slate-700/50">
                      <div
                        className={`h-full transition-all duration-300 ${
                          task.status === 'completed'
                            ? 'bg-emerald-400'
                            : task.status === 'failed'
                            ? 'bg-rose-500'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        }`}
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>{task.status.toUpperCase()} ({task.progress}%)</span>
                      <div className="flex items-center gap-2">
                        {task.status === 'downloading' && <span>{task.speed}</span>}
                        {task.status === 'downloading' && <span>ETA: {task.eta}</span>}
                        {task.status === 'completed' && (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Saved
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
