import React, { useState, useRef } from 'react';
import { Language, VideoInfo, GlobalDownloadState } from '../types';
import { translations } from '../translations';
import { fetchFacebookInfo, simulateDownloadWithMetrics } from '../utils/mediaDownloader';
import { logger } from '../utils/logger';
import { FacebookIcon } from './icons';
import {
  Folder,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Sparkles,
  RotateCcw,
  Clipboard,
  XCircle,
  Eye,
  Video,
  Film,
  Music,
} from 'lucide-react';

interface FacebookDownloaderProps {
  lang: Language;
  onUpdateGlobalState?: (state: Partial<GlobalDownloadState>) => void;
}

export const FacebookDownloader: React.FC<FacebookDownloaderProps> = ({
  lang,
  onUpdateGlobalState,
}) => {
  const t = translations[lang];

  const [url, setUrl] = useState<string>('https://www.facebook.com/watch/?v=1814072233111581');
  const [destination, setDestination] = useState<string>('Downloads/Facebook_Media');
  const [qualityMode, setQualityMode] = useState<'hd' | 'sd' | 'audio'>('hd');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [speed, setSpeed] = useState<string>('0.0 MB/s');
  const [eta, setEta] = useState<string>('00:00');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');

  const cancelFnRef = useRef<(() => void) | null>(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        logger.addLog('info', `Pasted Facebook URL: ${text.trim().substring(0, 45)}...`, 'Facebook');
      }
    } catch {
      // ignore
    }
  };

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setStatusType('error');
      setStatusMessage(lang === 'km' ? 'សូមបញ្ចូល Facebook URL' : 'Please enter a Facebook URL');
      return;
    }

    setIsAnalyzing(true);
    setStatusMessage(null);
    try {
      const info = await fetchFacebookInfo(url);
      setVideoInfo(info);
      setStatusType('success');
      setStatusMessage(lang === 'km' ? 'បានរកឃើញ Facebook Video ជោគជ័យ' : 'Facebook video metadata loaded!');
    } catch {
      setStatusType('error');
      setStatusMessage(lang === 'km' ? 'មិនអាចទាញយកព័ត៌មានបានទេ' : 'Failed to fetch Facebook video information.');
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
      setStatusMessage(lang === 'km' ? 'សូមបញ្ចូល Facebook URL' : 'Please enter a Facebook URL');
      return;
    }

    const title = videoInfo?.title || 'Facebook_Media_Video';
    const size = qualityMode === 'hd' ? 45.8 : qualityMode === 'sd' ? 21.4 : 5.2;

    setIsDownloading(true);
    setProgress(0);
    setStatusType('info');
    setStatusMessage(lang === 'km' ? 'កំពុងចាប់ផ្តើមទាញយក...' : 'Downloading Facebook stream...');

    onUpdateGlobalState?.({
      isDownloading: true,
      progress: 0,
      statusText: `Downloading: ${title.substring(0, 30)}...`,
      activeItem: title,
      speed: '12.0 MB/s',
      eta: '00:04',
      downloadedBytes: '0.0 MB',
      totalBytes: `${size.toFixed(1)} MB`,
    });

    const cleanup = simulateDownloadWithMetrics(
      size,
      title,
      (m) => {
        setProgress(m.percent);
        setSpeed(m.speed);
        setEta(m.eta);
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
            ? `ទាញយកវីដេអូ Facebook ជោគជ័យ! រក្សាទុកនៅ៖ ${destination}`
            : `Facebook video saved to ${destination}!`
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
    <div id="facebook-downloader-panel" className="neu-card p-5 sm:p-7 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-300/60">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl neu-card-sm text-blue-600 bg-[#e6edf5] shadow-inner">
            <FacebookIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              {t.fbTitle}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {t.fbDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="space-y-5">
        {/* Video URL Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            {t.videoUrl}
          </label>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="relative flex-1">
              <input
                id="facebook-url-input"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t.enterFacebookUrl}
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
              id="facebook-analyze-btn"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="neu-btn min-h-[44px] px-4 sm:px-5 py-2.5 text-xs font-bold text-slate-700 hover:text-blue-600 transition flex items-center justify-center gap-2 shrink-0"
            >
              {isAnalyzing ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              ) : (
                <Sparkles className="w-4 h-4 text-blue-600" />
              )}
              <span>{t.analyzeVideo}</span>
            </button>
          </div>
        </div>

        {/* Quality Mode Cards */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            {t.quality}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setQualityMode('hd')}
              className={`p-3 rounded-2xl flex items-center gap-3 text-left transition ${
                qualityMode === 'hd'
                  ? 'neu-pill-inset text-blue-700 bg-[#e6edf5] font-bold shadow-inner'
                  : 'neu-btn text-slate-700'
              }`}
            >
              <div className="p-2 rounded-xl neu-card-sm text-blue-600">
                <Video className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold">{t.fbQualityHd}</div>
                <div className="text-[10px] text-slate-500">Best 1080p MP4</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setQualityMode('sd')}
              className={`p-3 rounded-2xl flex items-center gap-3 text-left transition ${
                qualityMode === 'sd'
                  ? 'neu-pill-inset text-blue-700 bg-[#e6edf5] font-bold shadow-inner'
                  : 'neu-btn text-slate-700'
              }`}
            >
              <div className="p-2 rounded-xl neu-card-sm text-sky-600">
                <Film className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold">{t.fbQualitySd}</div>
                <div className="text-[10px] text-slate-500">Fast 720p MP4</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setQualityMode('audio')}
              className={`p-3 rounded-2xl flex items-center gap-3 text-left transition ${
                qualityMode === 'audio'
                  ? 'neu-pill-inset text-blue-700 bg-[#e6edf5] font-bold shadow-inner'
                  : 'neu-btn text-slate-700'
              }`}
            >
              <div className="p-2 rounded-xl neu-card-sm text-emerald-600">
                <Music className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold">{t.fbQualityAudio}</div>
                <div className="text-[10px] text-slate-500">MP3 320kbps Audio</div>
              </div>
            </button>
          </div>
        </div>

        {/* Destination Path Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            {t.destination}
          </label>
          <div className="flex gap-2">
            <input
              id="facebook-dest-input"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="flex-1 neu-input px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 font-mono min-h-[44px]"
            />
            <button
              id="facebook-browse-btn"
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

        {/* Video Preview Card */}
        {videoInfo && (
          <div className="p-4 rounded-2xl neu-card-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border border-slate-300/50">
            <div className="flex items-center gap-3.5 min-w-0">
              <img
                src={videoInfo.thumbnail}
                alt="thumbnail"
                className="w-24 h-16 object-cover rounded-xl neu-card-sm shrink-0 border border-slate-300"
              />
              <div className="min-w-0 space-y-1">
                <div className="font-bold text-xs sm:text-sm text-slate-800 truncate">
                  {videoInfo.title}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
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

        {/* Progress Bar */}
        {(isDownloading || progress > 0) && (
          <div className="space-y-2 p-4 rounded-2xl neu-inset">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700 flex items-center gap-2">
                <Loader2 className={`w-3.5 h-3.5 ${isDownloading ? 'animate-spin text-blue-600' : ''}`} />
                {statusMessage}
              </span>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="text-blue-700">{speed}</span>
                <span className="text-slate-700">ETA: {eta}</span>
                <span className="text-slate-800 font-bold">{progress}%</span>
              </div>
            </div>
            <div className="w-full h-3 neu-track p-0.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-200"
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
              id="facebook-cancel-btn"
              onClick={handleCancel}
              className="flex-1 py-3 px-6 neu-btn text-rose-600 hover:bg-rose-50 font-bold text-sm flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              <span>{t.cancel}</span>
            </button>
          ) : (
            <button
              id="facebook-download-submit-btn"
              onClick={handleDownload}
              className="flex-1 py-3 px-6 neu-btn-primary font-bold text-sm flex items-center justify-center gap-2 tracking-wide"
            >
              <Download className="w-4 h-4" />
              <span>{t.downloadFacebook}</span>
            </button>
          )}

          <button
            id="facebook-reset-btn"
            onClick={() => {
              setUrl('');
              setVideoInfo(null);
              setProgress(0);
              setStatusMessage(null);
            }}
            className="py-3 px-5 neu-btn text-slate-700 hover:text-blue-600 font-bold text-sm flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.reset}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
