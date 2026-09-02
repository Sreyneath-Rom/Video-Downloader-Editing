import React, { useState, useRef } from 'react';
import { Language, VideoInfo, GlobalDownloadState } from '../types';
import { translations } from '../translations';
import { fetchTikTokInfo, simulateDownloadWithMetrics } from '../utils/mediaDownloader';
import { logger } from '../utils/logger';
import { TikTokIcon } from './icons';
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
  Eye,
  Share2,
  ShieldCheck,
  Image as ImageIcon,
  Check,
} from 'lucide-react';

interface TikTokDownloaderProps {
  lang: Language;
  onUpdateGlobalState?: (state: Partial<GlobalDownloadState>) => void;
}

export const TikTokDownloader: React.FC<TikTokDownloaderProps> = ({
  lang,
  onUpdateGlobalState,
}) => {
  const t = translations[lang];

  const [url, setUrl] = useState<string>('https://www.tiktok.com/@tiktok/video/7100000000000000000');
  const [destination, setDestination] = useState<string>('Downloads/TikTok_Videos');
  const [selectedFormat, setSelectedFormat] = useState<'no_watermark' | 'standard' | 'audio' | 'cover'>('no_watermark');
  const [optIncludeAudio, setOptIncludeAudio] = useState<boolean>(true);
  const [optMetadata, setOptMetadata] = useState<boolean>(true);

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
    { label: t.tiktokSample1, url: 'https://www.tiktok.com/@charlidamelio/video/7234567890123456789' },
    { label: t.tiktokSample2, url: 'https://www.tiktok.com/@gordonramsayofficial/video/7198765432109876543' },
    { label: t.tiktokSample3, url: 'https://www.tiktok.com/@khaby.lame/video/7212345678901234567' },
  ];

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        logger.addLog('info', `Pasted TikTok URL: ${text.trim().substring(0, 45)}...`, 'TikTok');
      }
    } catch {
      // ignore
    }
  };

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setStatusType('error');
      setStatusMessage(lang === 'km' ? 'សូមបញ្ចូល URL វីដេអូ TikTok' : 'Please enter a TikTok video URL');
      return;
    }

    setIsAnalyzing(true);
    setStatusMessage(null);
    try {
      const info = await fetchTikTokInfo(url);
      setVideoInfo(info);
      setStatusType('success');
      setStatusMessage(lang === 'km' ? 'បានរកឃើញវីដេអូ TikTok គ្មាន Watermark' : 'Found clean TikTok video without watermark!');
    } catch {
      setStatusType('error');
      setStatusMessage(lang === 'km' ? 'មិនអាចទាញយកព័ត៌មាន TikTok បានទេ' : 'Failed to fetch TikTok information.');
      logger.addLog('error', `Failed to parse TikTok stream from: ${url}`, 'TikTok');
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
    logger.addLog('warn', 'User aborted TikTok download operation.', 'TikTok');
  };

  const handleStartDownload = async () => {
    if (!url.trim()) {
      setStatusType('error');
      setStatusMessage(lang === 'km' ? 'សូមបញ្ចូល URL ជាមុនសិន' : 'Please enter a TikTok video URL first.');
      return;
    }

    setIsDownloading(true);
    setProgress(0);
    setStatusType('info');
    setStatusMessage(lang === 'km' ? 'កំពុងទាញយកវីដេអូ TikTok HD គ្មាន Watermark...' : 'Downloading clean HD TikTok video...');

    onUpdateGlobalState?.({
      isDownloading: true,
      progress: 0,
      activeItem: videoInfo?.title || 'TikTok Clean HD Video',
      statusText: lang === 'km' ? 'កំពុងទាញយក...' : 'Downloading...',
    });

    const formatExt = selectedFormat === 'audio' ? 'mp3' : selectedFormat === 'cover' ? 'jpg' : 'mp4';
    const filename = `${videoInfo?.author || 'tiktok_video'}_${selectedFormat}_${Date.now()}.${formatExt}`;

    try {
      const cancel = simulateDownloadWithMetrics(
        selectedFormat === 'audio' ? 6.8 : selectedFormat === 'cover' ? 1.5 : 32.0,
        videoInfo?.title || 'TikTok_HD_Clean',
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
          setStatusMessage(lang === 'km' ? 'ទាញយកបានជោគជ័យពេញលេញ!' : 'TikTok media downloaded successfully!');
          onUpdateGlobalState?.({
            isDownloading: false,
            progress: 100,
            statusText: lang === 'km' ? 'បានបញ្ចប់' : 'Completed',
          });
          logger.addLog('success', `Saved clean TikTok stream to ${destination}/${filename}`, 'TikTok');
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
    <div className="space-y-6" id="tiktok-downloader-section">
      {/* Header Banner */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-800 text-white shadow-sm border border-slate-700">
              <TikTokIcon className="h-7 w-7 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white" id="tiktok-title">
                  {t.tiktokTitle}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 px-2.5 py-0.5 text-xs font-semibold text-cyan-700 dark:text-cyan-400 border border-cyan-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  No Watermark HD
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {t.tiktokDesc}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="tiktok-reset-btn"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t.reset}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Input and Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: URL & Options (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* URL Input Box */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100" htmlFor="tiktok-url-input">
              {t.enterTikTokUrl}
            </label>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  id="tiktok-url-input"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.tiktok.com/@username/video/..."
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-cyan-500 dark:focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 pr-20"
                />
                <button
                  id="tiktok-paste-btn"
                  onClick={handlePaste}
                  title="Paste from clipboard"
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <Clipboard className="h-3.5 w-3.5" />
                  {t.paste}
                </button>
              </div>

              <button
                id="tiktok-analyze-btn"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !url.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white px-5 py-2.5 text-sm font-medium transition disabled:opacity-50 border border-slate-700"
              >
                {isAnalyzing ? (
                  <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                ) : (
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                )}
                {t.analyze}
              </button>
            </div>

            {/* Quick Test Samples */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Quick Samples:</span>
              {sampleUrls.map((item, idx) => (
                <button
                  key={idx}
                  id={`tiktok-sample-btn-${idx}`}
                  onClick={() => {
                    setUrl(item.url);
                    setVideoInfo(null);
                  }}
                  className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 hover:text-cyan-600 dark:hover:text-cyan-400 transition border border-transparent hover:border-cyan-200 dark:hover:border-cyan-800"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Download Quality Options */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Download className="w-4 h-4 text-cyan-500" />
              {t.quality}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* No Watermark */}
              <button
                id="tiktok-opt-no-watermark"
                onClick={() => setSelectedFormat('no_watermark')}
                className={`flex items-start justify-between p-3.5 rounded-lg border text-left transition ${
                  selectedFormat === 'no_watermark'
                    ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30 ring-1 ring-cyan-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                      {t.tiktokNoWatermark}
                    </span>
                    <span className="text-[10px] uppercase font-bold bg-cyan-100 dark:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 px-1.5 py-0.5 rounded">
                      Fast
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Lossless 1080p MP4 without TikTok watermark logo
                  </p>
                </div>
                {selectedFormat === 'no_watermark' && (
                  <Check className="w-4 h-4 text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0" />
                )}
              </button>

              {/* Standard */}
              <button
                id="tiktok-opt-standard"
                onClick={() => setSelectedFormat('standard')}
                className={`flex items-start justify-between p-3.5 rounded-lg border text-left transition ${
                  selectedFormat === 'standard'
                    ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30 ring-1 ring-cyan-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    {t.tiktokStandard}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Standard compressed MP4 video (720p)
                  </p>
                </div>
                {selectedFormat === 'standard' && (
                  <Check className="w-4 h-4 text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0" />
                )}
              </button>

              {/* Audio MP3 */}
              <button
                id="tiktok-opt-audio"
                onClick={() => setSelectedFormat('audio')}
                className={`flex items-start justify-between p-3.5 rounded-lg border text-left transition ${
                  selectedFormat === 'audio'
                    ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30 ring-1 ring-cyan-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-sm text-slate-900 dark:text-slate-100">
                    <Music className="w-3.5 h-3.5 text-cyan-500" />
                    {t.tiktokAudio}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Extract original background music / sound track in MP3
                  </p>
                </div>
                {selectedFormat === 'audio' && (
                  <Check className="w-4 h-4 text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0" />
                )}
              </button>

              {/* HD Cover */}
              <button
                id="tiktok-opt-cover"
                onClick={() => setSelectedFormat('cover')}
                className={`flex items-start justify-between p-3.5 rounded-lg border text-left transition ${
                  selectedFormat === 'cover'
                    ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30 ring-1 ring-cyan-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-sm text-slate-900 dark:text-slate-100">
                    <ImageIcon className="w-3.5 h-3.5 text-cyan-500" />
                    {t.tiktokCover}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Download full resolution cover thumbnail image
                  </p>
                </div>
                {selectedFormat === 'cover' && (
                  <Check className="w-4 h-4 text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0" />
                )}
              </button>
            </div>

            {/* Additional settings */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={optIncludeAudio}
                  onChange={(e) => setOptIncludeAudio(e.target.checked)}
                  className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 h-4 w-4"
                />
                Include high-fidelity audio stream
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={optMetadata}
                  onChange={(e) => setOptMetadata(e.target.checked)}
                  className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 h-4 w-4"
                />
                Embed author ID3 tags & metadata
              </label>
            </div>
          </div>

          {/* Destination Directory & Actions */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100" htmlFor="tiktok-destination">
              {t.destination}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Folder className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="tiktok-destination"
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-9 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <button
                id="tiktok-browse-btn"
                onClick={() => {
                  setDestination('Downloads/TikTok_Archive_' + new Date().toISOString().slice(0, 10));
                  logger.addLog('info', 'Destination directory switched.', 'TikTok');
                }}
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                {t.browse}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                id="tiktok-download-btn"
                onClick={handleStartDownload}
                disabled={isDownloading || !url.trim()}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 px-6 py-3 text-sm font-semibold shadow-sm transition disabled:opacity-50"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {isDownloading ? t.downloading : t.tiktokDownloadBtn}
              </button>

              {isDownloading && (
                <button
                  id="tiktok-cancel-btn"
                  onClick={handleCancel}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 px-5 py-3 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 transition"
                >
                  <XCircle className="h-4 w-4" />
                  {t.cancel}
                </button>
              )}
            </div>

            {/* Progress Bar & Telemetry */}
            {isDownloading && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Downloading Stream ({progress}%)
                  </span>
                  <span>{downloadedBytes} / {totalBytes}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-300 rounded-full"
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
                    : 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-900/40'
                }`}
              >
                {statusType === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                ) : statusType === 'error' ? (
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                ) : (
                  <Loader2 className="h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400 animate-spin mt-0.5" />
                )}
                <span>{statusMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Stream Preview Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TikTokIcon className="w-4 h-4 text-cyan-400" />
              TikTok Video Preview
            </h3>

            {videoInfo ? (
              <div className="space-y-4">
                {/* Thumbnail with overlay badge */}
                <div className="relative aspect-[9/14] max-h-[380px] w-full mx-auto overflow-hidden rounded-xl bg-slate-950 border border-slate-800 group shadow-md">
                  <img
                    src={videoInfo.thumbnail}
                    alt={videoInfo.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  
                  {/* Clean No-Watermark Indicator */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-cyan-400 border border-cyan-500/40 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    Clean HD
                  </div>

                  <div className="absolute bottom-3 right-3 bg-black/80 px-2 py-0.5 rounded text-[11px] font-mono text-white">
                    {videoInfo.duration}
                  </div>

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex flex-col justify-end text-white">
                    <p className="font-semibold text-sm line-clamp-2 leading-snug">
                      {videoInfo.title}
                    </p>
                    <p className="text-xs text-cyan-300 font-medium mt-1">
                      {videoInfo.author}
                    </p>
                  </div>
                </div>

                {/* Metrics Badges */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800/80 p-2 border border-slate-100 dark:border-slate-800">
                    <Eye className="w-3.5 h-3.5 mx-auto text-slate-400 mb-1" />
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">{videoInfo.views || '4.2M'}</span>
                    <span className="text-[10px] text-slate-400">{t.tiktokPlays}</span>
                  </div>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800/80 p-2 border border-slate-100 dark:border-slate-800">
                    <Heart className="w-3.5 h-3.5 mx-auto text-red-500 mb-1" />
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">{videoInfo.likes || '682K'}</span>
                    <span className="text-[10px] text-slate-400">{t.tiktokLikes}</span>
                  </div>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800/80 p-2 border border-slate-100 dark:border-slate-800">
                    <Share2 className="w-3.5 h-3.5 mx-auto text-cyan-500 mb-1" />
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">45.2K</span>
                    <span className="text-[10px] text-slate-400">{t.tiktokShares}</span>
                  </div>
                </div>

                {/* Sound Track info */}
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-3 text-xs border border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                  <Music className="w-4 h-4 text-cyan-500 shrink-0" />
                  <div className="truncate">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.tiktokSound}</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium truncate block">
                      {videoInfo.soundName || 'Original Sound - ' + videoInfo.author}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                  <TikTokIcon className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No TikTok parsed yet</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[240px]">
                  Paste any TikTok video or reel URL and click Analyze to preview
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
