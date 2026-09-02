import React, { useState, useRef } from 'react';
import { Language, VideoInfo, GlobalDownloadState } from '../types';
import { translations } from '../translations';
import { fetchInstagramInfo, simulateDownloadWithMetrics } from '../utils/mediaDownloader';
import { logger } from '../utils/logger';
import { InstagramIcon } from './icons';
import {
  Folder,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  RotateCcw,
  Clipboard,
  XCircle,
  Music,
  Heart,
  MessageCircle,
  Eye,
  Check,
  Video,
  Image as ImageIcon,
  Flame,
} from 'lucide-react';

interface InstagramDownloaderProps {
  lang: Language;
  onUpdateGlobalState?: (state: Partial<GlobalDownloadState>) => void;
}

export const InstagramDownloader: React.FC<InstagramDownloaderProps> = ({
  lang,
  onUpdateGlobalState,
}) => {
  const t = translations[lang];

  const [url, setUrl] = useState<string>('https://www.instagram.com/reel/C8abcde1234/');
  const [destination, setDestination] = useState<string>('Downloads/Instagram_Media');
  const [selectedFormat, setSelectedFormat] = useState<'reel_hd' | 'photo_hd' | 'audio' | 'standard'>('reel_hd');
  const [optHighBitrate, setOptHighBitrate] = useState<boolean>(true);
  const [optEmbedTags, setOptEmbedTags] = useState<boolean>(true);

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

  const sampleUrls = [
    { label: t.igSample1, url: 'https://www.instagram.com/reel/C7xyz987654/' },
    { label: t.igSample2, url: 'https://www.instagram.com/p/C9photo11223/' },
    { label: t.igSample3, url: 'https://www.instagram.com/reel/C6cinema4455/' },
  ];

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        logger.addLog('info', `Pasted Instagram URL: ${text.trim().substring(0, 45)}...`, 'Instagram');
      }
    } catch {
      // ignore
    }
  };

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setStatusType('error');
      setStatusMessage(lang === 'km' ? 'សូមបញ្ចូល URL វីដេអូ Instagram' : 'Please enter an Instagram Reel or Post URL');
      return;
    }

    setIsAnalyzing(true);
    setStatusMessage(null);
    try {
      const info = await fetchInstagramInfo(url);
      setVideoInfo(info);
      setStatusType('success');
      setStatusMessage(lang === 'km' ? 'បានរកឃើញមេឌៀ Instagram ជោគជ័យ' : 'Instagram media parsed successfully!');
    } catch {
      setStatusType('error');
      setStatusMessage(lang === 'km' ? 'មិនអាចទាញយកព័ត៌មាន Instagram បានទេ' : 'Failed to fetch Instagram media details.');
      logger.addLog('error', `Failed to parse Instagram stream from: ${url}`, 'Instagram');
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
      statusText: lang === 'km' ? 'បានបោះបង់' : 'Cancelled',
    });
    logger.addLog('warn', 'User cancelled Instagram download.', 'Instagram');
  };

  const handleStartDownload = async () => {
    if (!url.trim()) {
      setStatusType('error');
      setStatusMessage(lang === 'km' ? 'សូមបញ្ចូល URL ជាមុនសិន' : 'Please enter an Instagram URL first.');
      return;
    }

    setIsDownloading(true);
    setProgress(0);
    setStatusType('info');
    setStatusMessage(lang === 'km' ? 'កំពុងទាញយកមេឌៀ Instagram...' : 'Downloading Instagram media stream...');

    onUpdateGlobalState?.({
      isDownloading: true,
      progress: 0,
      activeItem: videoInfo?.title || 'Instagram Media',
      statusText: lang === 'km' ? 'កំពុងទាញយក...' : 'Downloading...',
    });

    const formatExt = selectedFormat === 'audio' ? 'mp3' : selectedFormat === 'photo_hd' ? 'jpg' : 'mp4';
    const filename = `${videoInfo?.author || 'instagram_media'}_${selectedFormat}_${Date.now()}.${formatExt}`;

    try {
      const cancel = simulateDownloadWithMetrics(
        selectedFormat === 'audio' ? 8.5 : selectedFormat === 'photo_hd' ? 3.2 : 45.0,
        videoInfo?.title || 'Instagram_Media',
        formatExt,
        (metrics) => {
          setProgress(metrics.percent);
          setSpeed(metrics.speed);
          setEta(metrics.eta);
          setDownloadedBytes(metrics.downloadedMB + ' MB');
          setTotalBytes(metrics.totalMB + ' MB');

          onUpdateGlobalState?.({
            progress: metrics.percent,
            speed: metrics.speed,
            eta: metrics.eta,
            downloadedBytes: metrics.downloadedMB + ' MB',
            totalBytes: metrics.totalMB + ' MB',
            statusText: `${metrics.percent}% • ${metrics.speed}`,
          });
        },
        () => {
          setIsDownloading(false);
          setStatusType('success');
          setStatusMessage(lang === 'km' ? 'ទាញយកបានជោគជ័យពេញលេញ!' : 'Instagram media downloaded successfully!');
          onUpdateGlobalState?.({
            isDownloading: false,
            progress: 100,
            statusText: lang === 'km' ? 'បានបញ្ចប់' : 'Completed',
          });
          logger.addLog('success', `Saved Instagram file to ${destination}/${filename}`, 'Instagram');
        }
      );

      cancelFnRef.current = cancel;
    } catch {
      setIsDownloading(false);
    }
  };

  const handleReset = () => {
    setUrl('');
    setVideoInfo(null);
    setProgress(0);
    setStatusMessage(null);
    setIsDownloading(false);
  };

  return (
    <div className="space-y-6" id="instagram-downloader-section">
      {/* Header Banner */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-sm">
              <InstagramIcon className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white" id="ig-title">
                  {t.igTitle}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-pink-500/10 dark:bg-pink-500/20 px-2.5 py-0.5 text-xs font-semibold text-pink-600 dark:text-pink-400 border border-pink-500/30">
                  <Flame className="w-3.5 h-3.5" />
                  Reels & Posts
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {t.igDesc}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="ig-reset-btn"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t.reset}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input and options (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* URL Input */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100" htmlFor="ig-url-input">
              {t.enterIgUrl}
            </label>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  id="ig-url-input"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.instagram.com/reel/..."
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-pink-500 dark:focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 pr-20"
                />
                <button
                  id="ig-paste-btn"
                  onClick={handlePaste}
                  title="Paste from clipboard"
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <Clipboard className="h-3.5 w-3.5" />
                  {t.paste}
                </button>
              </div>

              <button
                id="ig-analyze-btn"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !url.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white px-5 py-2.5 text-sm font-medium transition disabled:opacity-50 border border-slate-700"
              >
                {isAnalyzing ? (
                  <Loader2 className="h-4 w-4 animate-spin text-pink-400" />
                ) : (
                  <Sparkles className="h-4 w-4 text-pink-400" />
                )}
                {t.analyze}
              </button>
            </div>

            {/* Samples */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Quick Samples:</span>
              {sampleUrls.map((item, idx) => (
                <button
                  key={idx}
                  id={`ig-sample-btn-${idx}`}
                  onClick={() => {
                    setUrl(item.url);
                    setVideoInfo(null);
                  }}
                  className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-pink-950/40 hover:text-pink-600 dark:hover:text-pink-400 transition border border-transparent hover:border-pink-200 dark:hover:border-pink-800"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quality Presets */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Download className="w-4 h-4 text-pink-500" />
              {t.quality}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Full HD Reel */}
              <button
                id="ig-opt-reel-hd"
                onClick={() => setSelectedFormat('reel_hd')}
                className={`flex items-start justify-between p-3.5 rounded-lg border text-left transition ${
                  selectedFormat === 'reel_hd'
                    ? 'border-pink-500 bg-pink-50/50 dark:bg-pink-950/30 ring-1 ring-pink-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                      {t.igReelHd}
                    </span>
                    <span className="text-[10px] uppercase font-bold bg-pink-100 dark:bg-pink-900/60 text-pink-700 dark:text-pink-300 px-1.5 py-0.5 rounded">
                      1080p
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Direct high-bitrate video stream with synchronized audio
                  </p>
                </div>
                {selectedFormat === 'reel_hd' && (
                  <Check className="w-4 h-4 text-pink-600 dark:text-pink-400 mt-0.5 shrink-0" />
                )}
              </button>

              {/* Photo High-Res */}
              <button
                id="ig-opt-photo-hd"
                onClick={() => setSelectedFormat('photo_hd')}
                className={`flex items-start justify-between p-3.5 rounded-lg border text-left transition ${
                  selectedFormat === 'photo_hd'
                    ? 'border-pink-500 bg-pink-50/50 dark:bg-pink-950/30 ring-1 ring-pink-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-sm text-slate-900 dark:text-slate-100">
                    <ImageIcon className="w-3.5 h-3.5 text-pink-500" />
                    {t.igPhotoHd}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Lossless uncompressed JPEG photo or cover frame
                  </p>
                </div>
                {selectedFormat === 'photo_hd' && (
                  <Check className="w-4 h-4 text-pink-600 dark:text-pink-400 mt-0.5 shrink-0" />
                )}
              </button>

              {/* Audio Soundtrack */}
              <button
                id="ig-opt-audio"
                onClick={() => setSelectedFormat('audio')}
                className={`flex items-start justify-between p-3.5 rounded-lg border text-left transition ${
                  selectedFormat === 'audio'
                    ? 'border-pink-500 bg-pink-50/50 dark:bg-pink-950/30 ring-1 ring-pink-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-sm text-slate-900 dark:text-slate-100">
                    <Music className="w-3.5 h-3.5 text-pink-500" />
                    {t.igAudioTrack}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Extract original audio soundtrack in MP3 format
                  </p>
                </div>
                {selectedFormat === 'audio' && (
                  <Check className="w-4 h-4 text-pink-600 dark:text-pink-400 mt-0.5 shrink-0" />
                )}
              </button>

              {/* Standard 720p */}
              <button
                id="ig-opt-standard"
                onClick={() => setSelectedFormat('standard')}
                className={`flex items-start justify-between p-3.5 rounded-lg border text-left transition ${
                  selectedFormat === 'standard'
                    ? 'border-pink-500 bg-pink-50/50 dark:bg-pink-950/30 ring-1 ring-pink-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-sm text-slate-900 dark:text-slate-100">
                    <Video className="w-3.5 h-3.5 text-pink-500" />
                    Standard 720p MP4
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Compact file size for quick sharing
                  </p>
                </div>
                {selectedFormat === 'standard' && (
                  <Check className="w-4 h-4 text-pink-600 dark:text-pink-400 mt-0.5 shrink-0" />
                )}
              </button>
            </div>

            {/* Options */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={optHighBitrate}
                  onChange={(e) => setOptHighBitrate(e.target.checked)}
                  className="rounded border-slate-300 text-pink-600 focus:ring-pink-500 h-4 w-4"
                />
                Force Maximum Bitrate Encoding
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={optEmbedTags}
                  onChange={(e) => setOptEmbedTags(e.target.checked)}
                  className="rounded border-slate-300 text-pink-600 focus:ring-pink-500 h-4 w-4"
                />
                Embed Instagram ID & Caption metadata
              </label>
            </div>
          </div>

          {/* Destination & Action */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100" htmlFor="ig-destination">
              {t.destination}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Folder className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="ig-destination"
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-9 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>
              <button
                id="ig-browse-btn"
                onClick={() => {
                  setDestination('Downloads/IG_Reels_' + new Date().toISOString().slice(0, 10));
                  logger.addLog('info', 'Instagram destination directory updated.', 'Instagram');
                }}
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                {t.browse}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                id="ig-download-btn"
                onClick={handleStartDownload}
                disabled={isDownloading || !url.trim()}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white px-6 py-3 text-sm font-semibold shadow-sm transition disabled:opacity-50"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {isDownloading ? t.downloading : t.igDownloadBtn}
              </button>

              {isDownloading && (
                <button
                  id="ig-cancel-btn"
                  onClick={handleCancel}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 px-5 py-3 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 transition"
                >
                  <XCircle className="h-4 w-4" />
                  {t.cancel}
                </button>
              )}
            </div>

            {/* Telemetry Progress */}
            {isDownloading && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1 text-pink-600 dark:text-pink-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Downloading Media ({progress}%)
                  </span>
                  <span>{downloadedBytes} / {totalBytes}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>{t.speed}: {speed}</span>
                  <span>{t.eta}: {eta}</span>
                </div>
              </div>
            )}

            {/* Status Message */}
            {statusMessage && (
              <div
                className={`flex items-start gap-2.5 rounded-lg p-3 text-xs font-medium ${
                  statusType === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40'
                    : statusType === 'error'
                    ? 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900/40'
                    : 'bg-pink-50 dark:bg-pink-950/40 text-pink-800 dark:text-pink-300 border border-pink-200 dark:border-pink-900/40'
                }`}
              >
                {statusType === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                ) : statusType === 'error' ? (
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                ) : (
                  <Loader2 className="h-4 w-4 shrink-0 text-pink-600 dark:text-pink-400 animate-spin mt-0.5" />
                )}
                <span>{statusMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Preview Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <InstagramIcon className="w-4 h-4 text-pink-500" />
              Instagram Reel / Post Preview
            </h3>

            {videoInfo ? (
              <div className="space-y-4">
                {/* Thumbnail */}
                <div className="relative aspect-[9/14] max-h-[380px] w-full mx-auto overflow-hidden rounded-xl bg-slate-950 border border-slate-800 group shadow-md">
                  <img
                    src={videoInfo.thumbnail}
                    alt={videoInfo.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  
                  <div className="absolute top-3 left-3 flex items-center gap-1 bg-gradient-to-r from-purple-600 to-pink-600 px-2.5 py-1 rounded-full text-xs font-semibold text-white shadow-sm">
                    <Flame className="w-3.5 h-3.5" />
                    1080p HD
                  </div>

                  <div className="absolute bottom-3 right-3 bg-black/80 px-2 py-0.5 rounded text-[11px] font-mono text-white">
                    {videoInfo.duration}
                  </div>

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex flex-col justify-end text-white">
                    <p className="font-semibold text-sm line-clamp-2 leading-snug">
                      {videoInfo.title}
                    </p>
                    <p className="text-xs text-pink-300 font-medium mt-1">
                      {videoInfo.author}
                    </p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800/80 p-2 border border-slate-100 dark:border-slate-800">
                    <Eye className="w-3.5 h-3.5 mx-auto text-slate-400 mb-1" />
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">{videoInfo.views || '920K'}</span>
                    <span className="text-[10px] text-slate-400">Views</span>
                  </div>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800/80 p-2 border border-slate-100 dark:border-slate-800">
                    <Heart className="w-3.5 h-3.5 mx-auto text-pink-500 mb-1" />
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">{videoInfo.likes || '145K'}</span>
                    <span className="text-[10px] text-slate-400">{t.igLikes}</span>
                  </div>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800/80 p-2 border border-slate-100 dark:border-slate-800">
                    <MessageCircle className="w-3.5 h-3.5 mx-auto text-purple-500 mb-1" />
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">3,420</span>
                    <span className="text-[10px] text-slate-400">{t.igComments}</span>
                  </div>
                </div>

                {/* Soundtrack */}
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-3 text-xs border border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                  <Music className="w-4 h-4 text-pink-500 shrink-0" />
                  <div className="truncate">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Audio Track</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium truncate block">
                      {videoInfo.soundName || 'Original Audio - ' + videoInfo.author}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                  <InstagramIcon className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No Instagram Reel loaded</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[240px]">
                  Paste any Instagram reel, video, or post URL to preview and download
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
