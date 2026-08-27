import React, { useState } from 'react';
import { Language, PlaylistItem } from '../types';
import { translations } from '../translations';
import { fetchPlaylistInfo, simulateDownload } from '../utils/mediaDownloader';
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
  RotateCcw
} from 'lucide-react';

interface PlaylistDownloaderProps {
  lang: Language;
}

export const PlaylistDownloader: React.FC<PlaylistDownloaderProps> = ({ lang }) => {
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

  const toggleSelectAll = () => {
    const allSelected = items.every((i) => i.selected);
    setItems((prev) => prev.map((item) => ({ ...item, selected: !allSelected })));
  };

  const handleDownload = () => {
    const selectedCount = items.filter((i) => i.selected).length;
    if (selectedCount === 0) {
      setStatusType('error');
      setStatusMessage(lang === 'km' ? 'សូមជ្រើសរើសវីដេអូយ៉ាងហោចណាស់មួយ' : 'Please select at least one item to download.');
      return;
    }

    setIsDownloading(true);
    setProgress(0);
    setStatusType('info');
    setStatusMessage(lang === 'km' ? `កំពុងទាញយក ${selectedCount} វីដេអូជាបន្តបន្ទាប់...` : `Downloading ${selectedCount} items batch...`);

    simulateDownload(
      (pct, status) => {
        setProgress(pct);
        setStatusMessage(status);
      },
      () => {
        setIsDownloading(false);
        setStatusType('success');
        setStatusMessage(
          lang === 'km'
            ? `ទាញយក Playlist ចំនួន ${selectedCount} ឯកសារជោគជ័យ! រក្សាទុកនៅ៖ ${destination}`
            : `All ${selectedCount} playlist items downloaded successfully to ${destination}!`
        );
      }
    );
  };

  return (
    <div id="playlist-downloader-panel" className="neu-card p-6 sm:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-300/60">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl neu-card-sm text-purple-600 bg-[#e6edf5] shrink-0">
            <ListVideo className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
              {t.tabPlaylist}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Batch download full YouTube playlists, music albums, and channel feeds automatically.
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="neu-pill-inset p-1.5 flex gap-1.5 w-full sm:w-auto justify-center">
          <button
            id="mode-video-btn"
            onClick={() => setDownloadMode('video')}
            className={`flex-1 sm:flex-none px-3.5 py-2 sm:py-1.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition min-h-[38px] ${
              downloadMode === 'video' ? 'neu-card-sm text-purple-700 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            Video (MP4)
          </button>
          <button
            id="mode-audio-btn"
            onClick={() => setDownloadMode('audio')}
            className={`flex-1 sm:flex-none px-3.5 py-2 sm:py-1.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition min-h-[38px] ${
              downloadMode === 'audio' ? 'neu-card-sm text-purple-700 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            Audio (MP3)
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {/* Playlist URL Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            {t.videoUrl}
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            <input
              id="playlist-url-input"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t.enterPlaylistUrl}
              className="flex-1 neu-input px-4 py-3 text-sm text-slate-800 placeholder-slate-400 font-mono min-h-[44px]"
            />
            <button
              id="playlist-fetch-btn"
              onClick={handleFetchPlaylist}
              disabled={isFetching}
              className="neu-btn min-h-[44px] px-5 py-3 text-xs font-bold text-slate-700 hover:text-purple-600 transition flex items-center justify-center gap-2 shrink-0"
            >
              {isFetching ? <Loader2 className="w-4 h-4 animate-spin text-purple-600" /> : <Sparkles className="w-4 h-4 text-purple-600" />}
              <span>{t.fetchPlaylist}</span>
            </button>
          </div>
        </div>

        {/* Destination Path */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            {t.destination}
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            <input
              id="playlist-dest-input"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="flex-1 neu-input px-4 py-3 text-sm text-slate-800 placeholder-slate-400 min-h-[44px]"
            />
            <button
              id="playlist-browse-btn"
              onClick={() => {
                const custom = prompt(lang === 'km' ? 'បញ្ចូលទីតាំងរក្សាទុក:' : 'Enter playlist download directory:', destination);
                if (custom) setDestination(custom);
              }}
              className="neu-btn min-h-[44px] px-5 py-3 text-xs font-bold text-slate-700 hover:text-emerald-600 transition flex items-center justify-center gap-2 shrink-0"
            >
              <Folder className="w-4 h-4 text-emerald-600" />
              <span>{t.browse}</span>
            </button>
          </div>
        </div>

        {/* Playlist Items List */}
        {items.length > 0 && (
          <div className="p-4 rounded-2xl neu-inset space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-300/60 font-semibold">
              <button
                id="playlist-select-all-btn"
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-slate-700 hover:text-purple-600 font-bold"
              >
                {items.every((i) => i.selected) ? (
                  <CheckSquare className="w-4 h-4 text-purple-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>Select / Deselect All</span>
              </button>
              <span className="text-slate-500 font-mono">
                {items.filter((i) => i.selected).length} / {items.length} {t.itemsFound}
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleSelect(item.id)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition ${
                    item.selected
                      ? 'neu-card-sm text-slate-800'
                      : 'neu-inset text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-0 focus:ring-offset-0 bg-[#e6edf5] border-slate-400"
                    />
                    <img
                      src={item.thumbnail}
                      alt="item"
                      className="w-12 h-8 rounded-lg object-cover neu-card-sm shrink-0"
                    />
                    <span className="text-xs font-bold truncate max-w-xs sm:max-w-md">{item.title}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500 ml-2 shrink-0 font-medium">{item.duration}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {(isDownloading || progress > 0) && (
          <div className="space-y-2 p-4 rounded-2xl neu-inset">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-600 flex items-center gap-2">
                <Loader2 className={`w-3.5 h-3.5 ${isDownloading ? 'animate-spin text-purple-600' : ''}`} />
                {lang === 'km' ? 'ដំណើរការទាញយក:' : 'Download Progress:'}
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
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl text-xs font-medium flex items-center gap-3 neu-inset ${
              statusType === 'success'
                ? 'text-emerald-800'
                : statusType === 'error'
                ? 'text-red-700'
                : 'text-purple-800'
            }`}
          >
            {statusType === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            )}
            <span className="font-semibold">{statusMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3.5 pt-2">
          <button
            id="playlist-download-submit-btn"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 py-3.5 px-6 neu-btn-primary disabled:opacity-60 font-bold text-sm flex items-center justify-center gap-2 tracking-wide"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? (lang === 'km' ? 'កំពុងទាញយក...' : 'Downloading...') : t.download}</span>
          </button>

          <button
            id="playlist-reset-btn"
            onClick={() => {
              setUrl('');
              setItems([]);
              setProgress(0);
              setStatusMessage(null);
            }}
            className="py-3.5 px-6 neu-btn text-slate-700 hover:text-red-500 font-bold text-sm flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.exit}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

