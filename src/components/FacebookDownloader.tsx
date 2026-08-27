import React, { useState } from 'react';
import { Language, VideoInfo } from '../types';
import { translations } from '../translations';
import { fetchFacebookInfo, simulateDownload } from '../utils/mediaDownloader';
import { FacebookIcon } from './icons';
import {
  Folder,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Sparkles,
  RotateCcw
} from 'lucide-react';

interface FacebookDownloaderProps {
  lang: Language;
}

export const FacebookDownloader: React.FC<FacebookDownloaderProps> = ({ lang }) => {
  const t = translations[lang];

  const [url, setUrl] = useState<string>('https://www.facebook.com/watch?v=101582845625478');
  const [destination, setDestination] = useState<string>('Downloads/Facebook_Media');
  const [selectedFormat, setSelectedFormat] = useState<string>('HD 1080p (High Definition)');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');

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

  const handleDownload = () => {
    if (!url.trim()) {
      setStatusType('error');
      setStatusMessage(lang === 'km' ? 'សូមបញ្ចូល Facebook URL' : 'Please enter a Facebook URL');
      return;
    }

    setIsDownloading(true);
    setProgress(0);
    setStatusType('info');
    setStatusMessage(lang === 'km' ? 'កំពុងចាប់ផ្តើមទាញយក...' : 'Downloading Facebook video clip...');

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
            ? `ទាញយកវីដេអូ Facebook ជោគជ័យ! រក្សាទុកនៅ៖ ${destination}`
            : `Facebook video saved to ${destination}!`
        );
      }
    );
  };

  return (
    <div id="facebook-downloader-panel" className="neu-card p-6 sm:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-300/60">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl neu-card-sm text-blue-600 bg-[#e6edf5]">
            <FacebookIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
              {t.tabFacebook}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Download Facebook videos, public clips, Watch episodes, and Reels in HD/SD.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* URL Field */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            {t.videoUrl}
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            <input
              id="facebook-url-input"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t.enterFacebookUrl}
              className="flex-1 neu-input px-4 py-3 text-sm text-slate-800 placeholder-slate-400 font-mono min-h-[44px]"
            />
            <button
              id="facebook-analyze-btn"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="neu-btn min-h-[44px] px-5 py-3 text-xs font-bold text-slate-700 hover:text-blue-600 transition flex items-center justify-center gap-2 shrink-0"
            >
              {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : <Sparkles className="w-4 h-4 text-blue-600" />}
              <span>{t.analyzeVideo}</span>
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
              id="facebook-dest-input"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="flex-1 neu-input px-4 py-3 text-sm text-slate-800 placeholder-slate-400 min-h-[44px]"
            />
            <button
              id="facebook-browse-btn"
              onClick={() => {
                const custom = prompt(lang === 'km' ? 'បញ្ចូលទីតាំងរក្សាទុក:' : 'Enter Facebook download directory:', destination);
                if (custom) setDestination(custom);
              }}
              className="neu-btn min-h-[44px] px-5 py-3 text-xs font-bold text-slate-700 hover:text-emerald-600 transition flex items-center justify-center gap-2 shrink-0"
            >
              <Folder className="w-4 h-4 text-emerald-600" />
              <span>{t.browse}</span>
            </button>
          </div>
        </div>

        {/* Video Preview Card */}
        {videoInfo && (
          <div className="p-4 rounded-2xl neu-inset flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-3.5 min-w-0 w-full md:w-auto">
              <img
                src={videoInfo.thumbnail}
                alt="thumbnail"
                className="w-20 h-14 sm:w-24 sm:h-16 object-cover rounded-xl neu-card-sm shrink-0"
              />
              <div className="min-w-0 space-y-1">
                <div className="font-bold text-xs sm:text-sm text-slate-800 truncate max-w-[200px] sm:max-w-xs md:max-w-sm">
                  {videoInfo.title}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-600" />
                    {videoInfo.duration}
                  </span>
                  <span className="text-blue-600 font-semibold">Public Video</span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto flex flex-wrap gap-2">
              {videoInfo.formats.map((fmt) => (
                <button
                  key={fmt.quality}
                  onClick={() => setSelectedFormat(fmt.quality)}
                  className={`flex-1 sm:flex-none px-3 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition min-h-[38px] ${
                    selectedFormat === fmt.quality
                      ? 'neu-pill-inset text-blue-700 font-extrabold'
                      : 'neu-btn text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {fmt.quality} ({fmt.size})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {(isDownloading || progress > 0) && (
          <div className="space-y-2 p-4 rounded-2xl neu-inset">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-600 flex items-center gap-2">
                <Loader2 className={`w-3.5 h-3.5 ${isDownloading ? 'animate-spin text-blue-600' : ''}`} />
                {lang === 'km' ? 'ដំណើរការទាញយក:' : 'Download Progress:'}
              </span>
              <span className="text-slate-800 font-mono font-bold">{progress}%</span>
            </div>
            <div className="w-full h-3 neu-track p-0.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-200"
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
                : 'text-blue-800'
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
            id="facebook-download-submit-btn"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 py-3.5 px-6 neu-btn-primary disabled:opacity-60 font-bold text-sm flex items-center justify-center gap-2 tracking-wide"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? (lang === 'km' ? 'កំពុងទាញយក...' : 'Downloading...') : t.download}</span>
          </button>

          <button
            id="facebook-reset-btn"
            onClick={() => {
              setUrl('');
              setVideoInfo(null);
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

