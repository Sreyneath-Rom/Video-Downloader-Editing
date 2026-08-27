import React, { useState, useRef } from 'react';
import { Language, VideoInfo, GlobalDownloadState } from '../types';
import { translations } from '../translations';
import { fetchYouTubeInfo, simulateDownloadWithMetrics } from '../utils/mediaDownloader';
import { logger } from '../utils/logger';
import { YoutubeIcon } from './icons';
import { DownloadAssistModal } from './DownloadAssistModal';
import {
  Folder,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  User,
  Sparkles,
  RotateCcw,
  Clipboard,
  XCircle,
  Eye,
  Sliders,
  Server,
  Globe,
} from 'lucide-react';

interface YouTubeDownloaderProps {
  lang: Language;
  onUpdateGlobalState?: (state: Partial<GlobalDownloadState>) => void;
}

export const YouTubeDownloader: React.FC<YouTubeDownloaderProps> = ({
  lang,
  onUpdateGlobalState,
}) => {
  const t = translations[lang];

  const [url, setUrl] = useState<string>('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [destination, setDestination] = useState<string>('Downloads/MediaToolsPro');
  const [selectedQuality, setSelectedQuality] = useState<string>('best');
  const [optSubtitles, setOptSubtitles] = useState<boolean>(false);
  const [optThumbnail, setOptThumbnail] = useState<boolean>(true);
  const [optMetadata, setOptMetadata] = useState<boolean>(true);
  const [showAssistModal, setShowAssistModal] = useState<boolean>(false);

  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [speed, setSpeed] = useState<string>('0.0 MB/s');
  const [eta, setEta] = useState<string>('00:00');
  const [downloadedBytes, setDownloadedBytes] = useState<string>('0.0 MB');
  const [totalBytes, setTotalBytes] = useState<string>('0.0 MB');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');

  const cancelFnRef = useRef<(() => void) | null>(null);

  const qualityPresets = [
    { value: 'best', label: 'Best Video + Audio Mux (Auto 4K/1080p)' },
    { value: '1080p', label: '1080p Full HD (MP4)' },
    { value: '720p', label: '720p High Definition (MP4)' },
    { value: '480p', label: '480p Standard (MP4)' },
    { value: '360p', label: '360p Low Bandwidth (MP4)' },
    { value: 'audio_mp3', label: 'Extract Audio Only (MP3 320kbps)' },
    { value: 'audio_wav', label: 'Lossless Master Audio (WAV)' },
  ];

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        logger.addLog('info', `Pasted URL from clipboard: ${text.trim().substring(0, 45)}...`, 'Universal');
      }
    } catch {
      // ignore
    }
  };

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setStatusType('error');
      setStatusMessage(lang === 'km' ? 'សូមបញ្ចូល URL វីដេអូ' : 'Please enter a valid media URL');
      return;
    }

    setIsAnalyzing(true);
    setStatusMessage(null);
    try {
      const info = await fetchYouTubeInfo(url);
      setVideoInfo(info);
      setStatusType('success');
      setStatusMessage(lang === 'km' ? 'បានរកឃើញវីដេអូជោគជ័យ' : 'Media stream parsed successfully!');
    } catch {
      setStatusType('error');
      setStatusMessage(lang === 'km' ? 'មិនអាចទាញយកព័ត៌មានវីដេអូបានទេ' : 'Failed to fetch video information.');
      logger.addLog('error', `Failed to parse stream from: ${url}`, 'Universal');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCancel = () => {
    if (cancelFnRef.current) {
      cancelFnRef.current();
      cancelFnRef.current = null;
    }
    setIsDownloading(false);
    setStatusType('error');
    setStatusMessage(lang === 'km' ? 'ការទាញយកត្រូវបានបោះបង់' : 'Download cancelled.');
    onUpdateGlobalState?.({
      isDownloading: false,
      statusText: 'Cancelled',
      speed: '0.0 MB/s',
      eta: '--:--',
    });
  };

  const handleDownload = () => {
    if (!url.trim()) {
      setStatusType('error');
      setStatusMessage(lang === 'km' ? 'សូមបញ្ចូល URL វីដេអូ' : 'Please enter a media URL');
      return;
    }

    const title = videoInfo?.title || 'Universal_Media_Stream';
    setIsDownloading(true);
    setProgress(0);
    setStatusType('info');
    setStatusMessage(lang === 'km' ? 'កំពុងចាប់ផ្តើមទាញយក...' : 'Starting download stream...');

    onUpdateGlobalState?.({
      isDownloading: true,
      progress: 0,
      statusText: `Downloading: ${title.substring(0, 30)}...`,
      activeItem: title,
      speed: '10.5 MB/s',
      eta: '00:08',
      downloadedBytes: '0.0 MB',
      totalBytes: '85.5 MB',
    });

    const format = selectedQuality.includes('MP3')
      ? 'mp3'
      : selectedQuality.includes('WAV')
      ? 'wav'
      : 'mp4';

    const cleanup = simulateDownloadWithMetrics(
      85.5,
      title,
      format,
      (m) => {
        setProgress(m.percent);
        setSpeed(m.speed);
        setEta(m.eta);
        setDownloadedBytes(m.downloadedMB + ' MB');
        setTotalBytes(m.totalMB + ' MB');
        setStatusMessage(m.status);

        onUpdateGlobalState?.({
          progress: m.percent,
          speed: m.speed,
          eta: m.eta,
          downloadedBytes: m.downloadedMB + ' MB',
          totalBytes: m.totalMB + ' MB',
          statusText: m.status,
        });
      },
      () => {
        setIsDownloading(false);
        setStatusType('success');
        setStatusMessage(
          lang === 'km'
            ? `ទាញយកជោគជ័យ! រក្សាទុកនៅ៖ ${destination}`
            : `Stream successfully downloaded to ${destination}!`
        );
        onUpdateGlobalState?.({
          isDownloading: false,
          progress: 100,
          statusText: 'Completed',
          speed: '0.0 MB/s',
          eta: '00:00',
        });
      }
    );

    cancelFnRef.current = cleanup;
  };

  return (
    <div id="youtube-downloader-panel" className="neu-card p-5 sm:p-7 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-300/60">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl neu-card-sm text-red-500 bg-[#e6edf5] shadow-inner">
            <YoutubeIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              {t.ytTitle}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {t.ytDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Fields */}
      <div className="space-y-5">
        {/* Video URL Input with Paste & Analyze */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            {t.videoUrl}
          </label>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="relative flex-1">
              <input
                id="youtube-url-input"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t.enterYouTubeUrl}
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
              id="youtube-analyze-btn"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="neu-btn min-h-[44px] px-4 sm:px-5 py-2.5 text-xs font-bold text-slate-700 hover:text-red-500 transition flex items-center justify-center gap-2 shrink-0"
            >
              {isAnalyzing ? (
                <Loader2 className="w-4 h-4 animate-spin text-red-500" />
              ) : (
                <Sparkles className="w-4 h-4 text-red-500" />
              )}
              <span>{t.analyzeVideo}</span>
            </button>
          </div>
        </div>

        {/* Quality Preset Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              {t.quality}
            </label>
            <select
              id="youtube-quality-select"
              value={selectedQuality}
              onChange={(e) => setSelectedQuality(e.target.value)}
              className="w-full neu-input px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 min-h-[44px]"
            >
              {qualityPresets.map((qp) => (
                <option key={qp.value} value={qp.value}>
                  {qp.label}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Path Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              {t.destination}
            </label>
            <div className="flex gap-2">
              <input
                id="youtube-dest-input"
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="flex-1 neu-input px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 font-mono min-h-[44px]"
              />
              <button
                id="youtube-browse-btn"
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

        {/* Checkbox Options */}
        <div className="p-3.5 rounded-2xl neu-inset grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-semibold text-slate-700">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={optSubtitles}
              onChange={(e) => setOptSubtitles(e.target.checked)}
              className="w-4 h-4 rounded text-red-500 focus:ring-red-400 accent-red-500"
            />
            <span>{t.optSubtitles}</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={optThumbnail}
              onChange={(e) => setOptThumbnail(e.target.checked)}
              className="w-4 h-4 rounded text-red-500 focus:ring-red-400 accent-red-500"
            />
            <span>{t.optThumbnail}</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={optMetadata}
              onChange={(e) => setOptMetadata(e.target.checked)}
              className="w-4 h-4 rounded text-red-500 focus:ring-red-400 accent-red-500"
            />
            <span>{t.optMetadata}</span>
          </label>
        </div>

        {/* Video Metadata Preview Card */}
        {videoInfo && (
          <div className="p-4 rounded-2xl neu-card-sm flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border border-slate-300/50">
            <div className="flex items-center gap-3.5 min-w-0 w-full md:w-auto">
              <img
                src={videoInfo.thumbnail}
                alt="thumbnail"
                className="w-24 h-16 object-cover rounded-xl neu-card-sm shrink-0 border border-slate-300"
              />
              <div className="min-w-0 space-y-1">
                <div className="font-bold text-xs sm:text-sm text-slate-800 truncate">
                  {videoInfo.title}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-600" />
                    {videoInfo.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-600" />
                    {videoInfo.duration}
                  </span>
                  {videoInfo.views && (
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                      {videoInfo.views}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Download Live Metrics & Progress */}
        {(isDownloading || progress > 0) && (
          <div className="space-y-2.5 p-4 rounded-2xl neu-inset">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
              <span className="text-slate-700 flex items-center gap-2">
                <Loader2 className={`w-3.5 h-3.5 ${isDownloading ? 'animate-spin text-emerald-600' : ''}`} />
                {lang === 'km' ? 'ដំណើរការទាញយក:' : 'Download Progress:'}
              </span>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="text-emerald-700">{speed}</span>
                <span className="text-blue-700">ETA: {eta}</span>
                <span className="text-slate-800 font-bold">{progress}%</span>
              </div>
            </div>

            <div className="w-full h-3 neu-track p-0.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>{downloadedBytes} / {totalBytes}</span>
              <span className="truncate max-w-xs">{statusMessage}</span>
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
              id="youtube-cancel-btn"
              onClick={handleCancel}
              className="flex-1 py-3 px-6 neu-btn text-rose-600 hover:bg-rose-50 font-bold text-sm flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              <span>{t.cancel}</span>
            </button>
          ) : (
            <>
              <button
                id="youtube-download-submit-btn"
                onClick={handleDownload}
                className="flex-1 py-3 px-6 neu-btn-primary font-bold text-sm flex items-center justify-center gap-2 tracking-wide"
              >
                <Download className="w-4 h-4" />
                <span>{t.downloadVideo}</span>
              </button>

              <a
                id="youtube-direct-server-link"
                href={`/api/media/download?title=${encodeURIComponent(
                  videoInfo?.title || 'YouTube_Media'
                )}&format=${
                  selectedQuality.includes('MP3')
                    ? 'mp3'
                    : selectedQuality.includes('WAV')
                    ? 'wav'
                    : 'mp4'
                }&quality=${encodeURIComponent(selectedQuality)}`}
                download
                target="_blank"
                rel="noreferrer"
                className="py-3 px-4 neu-btn text-emerald-700 hover:text-emerald-900 font-bold text-xs flex items-center gap-1.5 shrink-0"
                title="Direct Server Download (Bypasses iframe restrictions)"
              >
                <Server className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Direct Link</span>
              </a>

              <button
                type="button"
                id="youtube-mirrors-btn"
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
            id="youtube-reset-btn"
            onClick={() => {
              setUrl('');
              setVideoInfo(null);
              setProgress(0);
              setStatusMessage(null);
            }}
            className="py-3 px-4 neu-btn text-slate-700 hover:text-red-500 font-bold text-sm flex items-center gap-2"
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
        mediaTitle={videoInfo?.title || 'YouTube_Stream'}
        format={
          selectedQuality.includes('MP3')
            ? 'mp3'
            : selectedQuality.includes('WAV')
            ? 'wav'
            : 'mp4'
        }
        quality={selectedQuality}
      />
    </div>
  );
};
