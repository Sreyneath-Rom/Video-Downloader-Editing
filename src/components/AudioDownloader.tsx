import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { simulateDownload } from '../utils/mediaDownloader';
import {
  Music,
  Folder,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sliders,
  Sparkles,
  RotateCcw
} from 'lucide-react';

interface AudioDownloaderProps {
  lang: Language;
}

export const AudioDownloader: React.FC<AudioDownloaderProps> = ({ lang }) => {
  const t = translations[lang];

  const [url, setUrl] = useState<string>('https://www.youtube.com/watch?v=kJQP7kiw5Fk');
  const [downloadFolder, setDownloadFolder] = useState<string>('Downloads/Audio_Tracks');
  const [format, setFormat] = useState<'mp3' | 'wav' | 'm4a'>('mp3');
  const [bitrate, setBitrate] = useState<'320' | '192' | '128'>('192');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');

  const handleDownload = () => {
    if (!url.trim()) {
      setStatusType('error');
      setStatusMessage(lang === 'km' ? 'សូមបញ្ចូល YouTube URL' : 'Please enter a YouTube URL');
      return;
    }

    setIsDownloading(true);
    setProgress(0);
    setStatusType('info');
    setStatusMessage(
      lang === 'km'
        ? `កំពុងស្រង់សំឡេងកម្រិត ${bitrate}kbps (${format.toUpperCase()})...`
        : `Extracting audio stream with ${bitrate}kbps bitrate (${format.toUpperCase()})...`
    );

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
            ? `ទាញយកសំឡេងជោគជ័យ! រក្សាទុកនៅ៖ ${downloadFolder}`
            : `Audio downloaded successfully to ${downloadFolder}!`
        );
      }
    );
  };

  return (
    <div id="audio-downloader-panel" className="neu-card p-6 sm:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-300/60">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl neu-card-sm text-emerald-600 bg-[#e6edf5]">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
              {t.tabAudioDownload}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Extract lossless and high-bitrate MP3, WAV, or AAC audio streams directly with FFmpeg encoding.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* URL Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            {lang === 'km' ? 'វីដេអូ URL:' : 'YouTube URL:'}
          </label>
          <div className="flex gap-3">
            <input
              id="audio-url-input"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t.enterAudioUrl}
              className="flex-1 neu-input px-4 py-3 text-sm text-slate-800 placeholder-slate-400 font-mono min-h-[44px]"
            />
          </div>
        </div>

        {/* Destination folder */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            {t.destination}
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            <input
              id="audio-dest-input"
              type="text"
              value={downloadFolder}
              onChange={(e) => setDownloadFolder(e.target.value)}
              className="flex-1 neu-input px-4 py-3 text-sm text-slate-800 placeholder-slate-400 min-h-[44px]"
            />
            <button
              id="audio-browse-btn"
              onClick={() => {
                const custom = prompt(lang === 'km' ? 'បញ្ចូលទីតាំងរក្សាទុក:' : 'Enter audio download directory:', downloadFolder);
                if (custom) setDownloadFolder(custom);
              }}
              className="neu-btn min-h-[44px] px-5 py-3 text-xs font-bold text-slate-700 hover:text-emerald-600 transition flex items-center justify-center gap-2 shrink-0"
            >
              <Folder className="w-4 h-4 text-emerald-600" />
              <span>{t.browse}</span>
            </button>
          </div>
        </div>

        {/* Audio Quality & Format Config */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 rounded-2xl neu-inset">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.format}</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(['mp3', 'wav', 'm4a'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold uppercase transition ${
                    format === fmt
                      ? 'neu-pill-inset text-emerald-700 font-extrabold'
                      : 'neu-btn text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.audioBitrate}</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: '320k', val: '320' },
                { label: '192k', val: '192' },
                { label: '128k', val: '128' },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => setBitrate(item.val as '320' | '192' | '128')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition ${
                    bitrate === item.val
                      ? 'neu-pill-inset text-emerald-700 font-extrabold'
                      : 'neu-btn text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {(isDownloading || progress > 0) && (
          <div className="space-y-2 p-4 rounded-2xl neu-inset">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-600 flex items-center gap-2">
                <Loader2 className={`w-3.5 h-3.5 ${isDownloading ? 'animate-spin text-emerald-600' : ''}`} />
                {lang === 'km' ? 'ដំណើរការទាញយក:' : 'Download Progress:'}
              </span>
              <span className="text-slate-800 font-mono font-bold">{progress}%</span>
            </div>
            <div className="w-full h-3 neu-track p-0.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-200"
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
                : 'text-emerald-800'
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
            id="audio-download-submit-btn"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 py-3.5 px-6 neu-btn-primary disabled:opacity-60 font-bold text-sm flex items-center justify-center gap-2 tracking-wide"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? (lang === 'km' ? 'កំពុងទាញយក...' : 'Downloading...') : t.downloadAudio}</span>
          </button>

          <button
            id="audio-reset-btn"
            onClick={() => {
              setUrl('');
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

