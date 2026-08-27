import React, { useState, useEffect, useRef } from 'react';
import { Language, LogEntry } from '../types';
import { translations } from '../translations';
import { logger } from '../utils/logger';
import { Terminal, Trash2, Copy, Check, Filter, ArrowDown } from 'lucide-react';

interface ActivityLogsProps {
  lang: Language;
}

export const ActivityLogs: React.FC<ActivityLogsProps> = ({ lang }) => {
  const t = translations[lang];
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'info' | 'success' | 'warn' | 'error'>('all');
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = logger.subscribe((newLogs) => {
      setLogs(newLogs);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    return log.level === filter;
  });

  const handleCopyLogs = () => {
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.source || 'Sys'}]: ${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearLogs = () => {
    logger.clearLogs();
  };

  const getLevelBadge = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return <span className="text-emerald-400 font-bold">[SUCCESS]</span>;
      case 'warn':
        return <span className="text-amber-400 font-bold">[WARN]</span>;
      case 'error':
        return <span className="text-rose-400 font-bold">[ERROR]</span>;
      case 'info':
      default:
        return <span className="text-cyan-400 font-bold">[INFO]</span>;
    }
  };

  return (
    <div id="activity-logs-container" className="space-y-4">
      {/* Header card */}
      <div className="neu-card p-4 sm:p-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl neu-card-sm flex items-center justify-center text-indigo-600 shrink-0">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                {t.logsTitle}
              </h2>
              <p className="text-xs text-slate-500 font-medium">{t.logsDesc}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              id="copy-logs-btn"
              onClick={handleCopyLogs}
              className="neu-btn px-3 py-1.5 text-xs font-semibold text-slate-700 flex items-center gap-1.5 hover:text-indigo-600 transition"
              title={t.copyLogs}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : t.copyLogs}</span>
            </button>
            <button
              id="clear-logs-btn"
              onClick={handleClearLogs}
              className="neu-btn px-3 py-1.5 text-xs font-semibold text-rose-600 flex items-center gap-1.5 hover:bg-rose-50 transition"
              title={t.clearLogs}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.clearLogs}</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Filter:</span>
            {(['all', 'info', 'success', 'warn', 'error'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilter(lvl)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  filter === lvl
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-200/70 text-slate-600 hover:bg-slate-300'
                }`}
              >
                {lvl === 'all' ? t.filterAll : lvl.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`text-xs font-medium flex items-center gap-1 px-2 py-1 rounded ${
              autoScroll ? 'text-indigo-600 bg-indigo-50 font-bold' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ArrowDown className="w-3 h-3" />
            <span>Auto-scroll: {autoScroll ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Terminal window */}
      <div className="bg-[#0f172a] rounded-2xl p-4 sm:p-5 shadow-2xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5 min-h-[380px] max-h-[540px] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800/80 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></div>
            <span className="ml-2 text-slate-400 font-sans font-medium">Stream Activity Console</span>
          </div>
          <span>Total Entries: {logs.length}</span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-slate-500 italic py-8 text-center">No log messages found for current filter.</div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="leading-relaxed hover:bg-slate-800/40 px-1 py-0.5 rounded transition">
              <span className="text-slate-500">[{log.timestamp}]</span>{' '}
              {getLevelBadge(log.level)}{' '}
              {log.source && <span className="text-slate-400 font-semibold">[{log.source}]</span>}{' '}
              <span
                className={
                  log.level === 'error'
                    ? 'text-rose-300'
                    : log.level === 'warn'
                    ? 'text-amber-200'
                    : log.level === 'success'
                    ? 'text-emerald-300'
                    : 'text-slate-200'
                }
              >
                {log.message}
              </span>
            </div>
          ))
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
