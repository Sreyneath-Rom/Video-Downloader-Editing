import React, { useState, useRef } from 'react';
import { Language, PlaylistItem, GlobalDownloadState } from '../types';
import { translations } from '../translations';
import { fetchPlaylistInfo, triggerFileDownload } from '../utils/mediaDownloader';
import { logger } from '../utils/logger';
import { DownloadAssistModal } from './DownloadAssistModal';
import {
  ListVideo,
  Folder,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  CheckSquare,
  Square,
  Film,
  Music,
  RotateCcw,
  Clipboard,
  XCircle,
  Check,
  Server,
  Globe,
} from 'lucide-react';

interface PlaylistDownloaderProps {
  lang: Language;
  onUpdateGlobalState?: (state: Partial<GlobalDownloadState>) => void;
}

export const PlaylistDownloader: React.FC<PlaylistDownloaderProps> = ({
  lang,
  onUpdateGlobalState,
}) => {
  const t = translations[lang];

  const [url, setUrl] = useState<string>('https://www.youtube.com/playlist?list=PLrEnWoR732-BHrPp_AK4e50iPtMDJlE2e');
  const [destination, setDestination] = useState<string>('Downloads/YouTube_Playlists');
  const [items, setItems] = useState<PlaylistItem[]>([]);
  const [downloadMode, setDownloadMode] = useState<'video' | 'audio'>('video');
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');
  const [showAssistModal, setShowAssistModal] = useState<boolean>(false);

  const cancelFlagRef = useRef<boolean>(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        logger.addLog('info', `Pasted Playlist URL: ${text.trim().substring(0, 45)}...`, 'Playlist');
      }
    } catch {
      // ignore
    }
  };

  const handleFetchPlaylist = async () => {
    if (!url.trim()) {
      setStatusType('error');
      setStatusMessage(lang === 'km' ? 'សូមបញ្ចូល YouTube Playlist URL' : 'Please enter a YouTube Playlist URL');
      return;
    }

    setIsFetching(true);
    setStatusMessage(null);
    try {
      const list = await fetchPlaylistInfo(url);
      setItems(list);
      setStatusType('success');
      setStatusMessage(
        lang === 'km'
          ? `បានរកឃើញ ${list.length} វីដេអូក្នុងបញ្ជី Playlist!`
          : `Loaded ${list.length} tracks from playlist successfully!`
      );
    } catch {
      setStatusType('error');
      setStatusMessage(lang === 'km' ? 'មិនអាចទាញយកបញ្ជី Playlist បានទេ' : 'Failed to fetch playlist items.');
    } finally {
      setIsFetching(false);
    }
  };

  const toggleSelect = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const selectAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, selected: true })));
  };

  const deselectAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, selected: false })));
  };

  const handleCancel = () => {
    cancelFlagRef.current = true;
    setIsDownloading(false);
    setStatusType('error');
    setStatusMessage(lang === 'km' ? 'ការទាញយកត្រូវបានបោះបង់' : 'Batch download cancelled.');
    onUpdateGlobalState?.({
      isDownloading: false,
      statusText: 'Cancelled',
      speed: '0.0 MB/s',
      eta: '--:--',
    });
  };

  const handleDownload = async () => {
    const selectedItems = items.filter((i) => i.selected);
    if (selectedItems.length === 0) {
      setStatusType('error');
      setStatusMessage(
        lang === 'km'
          ? 'សូមជ្រើសរើសវីដេអូយ៉ាងហោចណាស់មួយ'
          : 'Please select at least one item to download.'
      );
      return;
    }

    setIsDownloading(true);
    setProgress(0);
    setStatusType('info');
    cancelFlagRef.current = false;

    logger.addLog('info', `Initiating batch queue for ${selectedItems.length} items...`, 'Playlist');

    for (let i = 0; i < selectedItems.length; i++) {
      if (cancelFlagRef.current) break;

      const item = selectedItems[i];
      // Mark active
      setItems((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, status: 'downloading' } : p))
      );

      const itemPctStart = Math.round((i / selectedItems.length) * 100);
      const itemPctEnd = Math.round(((i + 1) / selectedItems.length) * 100);

      setStatusMessage(`Downloading [${i + 1}/${selectedItems.length}]: ${item.title}`);
      onUpdateGlobalState?.({
        isDownloading: true,
        progress: itemPctStart,
        statusText: `[${i + 1}/${selectedItems.length}] ${item.title.substring(0, 25)}...`,
        activeItem: item.title,
        speed: '11.8 MB/s',
        eta: `00:${(selectedItems.length - i) * 2}`,
      });

      // Simulate item downloading step
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (cancelFlagRef.current) break;

      setItems((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, status: 'completed' } : p))
      );
      setProgress(itemPctEnd);
    }

    if (!cancelFlagRef.current) {
      setIsDownloading(false);
      setProgress(100);
      setStatusType('success');
      setStatusMessage(
        lang === 'km'
          ? `ទាញយក Playlist ចំនួន ${selectedItems.length} ឯកសារជោគជ័យ!`
          : `All ${selectedItems.length} playlist items downloaded successfully!`
      );
      triggerFileDownload(`playlist_${selectedItems.length}_tracks_archive.zip`, 'Playlist Batch Media Archive');
      onUpdateGlobalState?.({
        isDownloading: false,
        progress: 100,
        statusText: 'Completed',
        speed: '0.0 MB/s',
        eta: '00:00',
      });
    }
  };

  const selectedCount = items.filter((i) => i.selected).length;

  return (
    <div id="playlist-downloader-panel" className="neu-card p-5 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-300/60">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl neu-card-sm text-purple-600 bg-[#e6edf5] shadow-inner">
            <ListVideo className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              {t.plTitle}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {t.plDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="space-y-5">
        {/* Playlist URL Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            {t.enterPlaylistUrl}
          </label>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="relative flex-1">
              <input
                id="playlist-url-input"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t.enterPlaylistUrl}
                className="w-full neu-input pl-4 pr-12 py-3 text-sm text-slate-800 placeholder-slate-400 font-mono min-h-[44px]"
              />
              <button
                type="button"
                onClick={handlePaste}
                title="Paste from clipboard"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
              >
                <Clipboard className="w-4 h-4" />
              </button>
            </div>

            <button
              id="playlist-fetch-btn"
              onClick={handleFetchPlaylist}
              disabled={isFetching}
              className="neu-btn min-h-[44px] px-4 sm:px-5 py-2.5 text-xs font-bold text-slate-700 hover:text-purple-600 transition flex items-center justify-center gap-2 shrink-0"
            >
              {isFetching ? (
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              ) : (
                <Sparkles className="w-4 h-4 text-purple-600" />
              )}
              <span>{t.fetchPlaylist}</span>
            </button>
          </div>
        </div>

        {/* Format Selector & Directory */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              {t.format}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDownloadMode('video')}
                className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition min-h-[44px] ${
                  downloadMode === 'video'
                    ? 'neu-pill-inset text-purple-700 bg-[#e6edf5] shadow-inner'
                    : 'neu-btn text-slate-700'
                }`}
              >
                <Film className="w-4 h-4 text-purple-600" />
                <span>Video MP4</span>
              </button>

              <button
                type="button"
                onClick={() => setDownloadMode('audio')}
                className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition min-h-[44px] ${
                  downloadMode === 'audio'
                    ? 'neu-pill-inset text-purple-700 bg-[#e6edf5] shadow-inner'
                    : 'neu-btn text-slate-700'
                }`}
              >
                <Music className="w-4 h-4 text-emerald-600" />
                <span>Audio MP3</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              {t.destination}
            </label>
            <div className="flex gap-2">
              <input
                id="playlist-dest-input"
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="flex-1 neu-input px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 font-mono min-h-[44px]"
              />
              <button
                id="playlist-browse-btn"
                onClick={() => {
                  const custom = prompt(
                    lang === 'km' ? 'បញ្ចូលទីតាំងរក្សាទុក:' : 'Enter custom download directory:',
                    destination
                  );
                  if (custom) setDestination(custom);
                }}
                className="neu-btn min-h-[44px] px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:text-emerald-600 transition flex items-center justify-center gap-1.5 shrink-0"
              >
                <Folder className="w-4 h-4 text-emerald-600" />
                <span>{t.browse}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Playlist Checklist / Treeview */}
        {items.length > 0 && (
          <div className="space-y-3 p-4 rounded-2xl neu-inset">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-300">
              <span className="text-xs font-bold text-slate-700">
                {items.length} {t.itemsFound} ({selectedCount} selected)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="px-2.5 py-1 text-xs font-semibold neu-btn text-slate-700 hover:text-purple-600"
                >
                  {t.selectAll}
                </button>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="px-2.5 py-1 text-xs font-semibold neu-btn text-slate-700 hover:text-rose-600"
                >
                  {t.deselectAll}
                </button>
              </div>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => toggleSelect(item.id)}
                  className={`p-2.5 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition select-none ${
                    item.selected
                      ? 'bg-white/60 shadow-sm border border-purple-200'
                      : 'hover:bg-slate-200/40 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="text-purple-600 shrink-0">
                      {item.selected ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400 w-5">
                      {idx + 1}.
                    </span>
                    <img
                      src={item.thumbnail}
                      alt="thumb"
                      className="w-12 h-8 rounded object-cover shrink-0"
                    />
                    <div className="font-semibold text-xs text-slate-800 truncate">
                      {item.title}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-slate-500">
                      {item.duration}
                    </span>
                    {item.status === 'downloading' && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full flex items-center gap-1">
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        Downloading
                      </span>
                    )}
                    {item.status === 'completed' && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" />
                        Done
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {(isDownloading || progress > 0) && (
          <div className="space-y-2 p-4 rounded-2xl neu-inset">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700 flex items-center gap-2">
                <Loader2 className={`w-3.5 h-3.5 ${isDownloading ? 'animate-spin text-purple-600' : ''}`} />
                {statusMessage}
              </span>
              <span className="text-slate-800 font-mono font-bold">{progress}%</span>
            </div>
            <div className="w-full h-3 neu-track p-0.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Status Message */}
        {statusMessage && !isDownloading && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-medium flex items-center gap-3 neu-inset ${
              statusType === 'success'
                ? 'text-emerald-800'
                : statusType === 'error'
                ? 'text-rose-700'
                : 'text-amber-800'
            }`}
          >
            {statusType === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <span className="font-semibold">{statusMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          {isDownloading ? (
            <button
              id="playlist-cancel-btn"
              onClick={handleCancel}
              className="flex-1 py-3 px-6 neu-btn text-rose-600 hover:bg-rose-50 font-bold text-sm flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              <span>{t.cancel}</span>
            </button>
          ) : (
            <>
              <button
                id="playlist-download-submit-btn"
                onClick={handleDownload}
                className="flex-1 py-3 px-6 neu-btn-primary font-bold text-sm flex items-center justify-center gap-2 tracking-wide"
              >
                <Download className="w-4 h-4" />
                <span>
                  {selectedCount > 0
                    ? `${t.downloadAll} (${selectedCount})`
                    : t.downloadAll}
                </span>
              </button>

              <a
                id="playlist-direct-server-link"
                href={`/api/media/download?title=${encodeURIComponent(
                  `Playlist_Archive_${selectedCount || 1}_Tracks`
                )}&format=zip&quality=FullBatch`}
                download
                target="_blank"
                rel="noreferrer"
                className="py-3 px-4 neu-btn text-emerald-700 hover:text-emerald-900 font-bold text-xs flex items-center gap-1.5 shrink-0"
                title="Direct Server ZIP Download (Bypasses iframe restrictions)"
              >
                <Server className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Direct ZIP</span>
              </a>

              <button
                type="button"
                id="playlist-mirrors-btn"
                onClick={() => setShowAssistModal(true)}
                className="py-3 px-4 neu-btn text-purple-700 hover:text-purple-900 font-bold text-xs flex items-center gap-1.5 shrink-0"
                title="Open Fast Mirrors & Download Options"
              >
                <Globe className="w-4 h-4 text-purple-600" />
                <span className="hidden sm:inline">Options</span>
              </button>
            </>
          )}

          <button
            id="playlist-reset-btn"
            onClick={() => {
              setUrl('');
              setItems([]);
              setProgress(0);
              setStatusMessage(null);
            }}
            className="py-3 px-4 neu-btn text-slate-700 hover:text-purple-600 font-bold text-sm flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.reset}</span>
          </button>
        </div>
      </div>

      {/* Download Assist & Mirror Options Modal */}
      <DownloadAssistModal
        isOpen={showAssistModal}
        onClose={() => setShowAssistModal(false)}
        lang={lang}
        mediaUrl={url}
        mediaTitle={`Playlist_Archive_${selectedCount || 1}_Tracks`}
        format="zip"
        quality="Batch"
      />
    </div>
  );
};
