import React, { useState, useRef } from 'react';
import { Language, GlobalDownloadState } from '../types';
import { translations } from '../translations';
import { simulateDownloadWithMetrics } from '../utils/mediaDownloader';
import { logger } from '../utils/logger';
import {
  Music,
  Folder,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sliders,
  RotateCcw,
  Clipboard,
  XCircle,
} from 'lucide-react';

interface AudioDownloaderProps {
  lang: Language;
  onUpdateGlobalState?: (state: Partial<GlobalDownloadState>) => void;
}

export const AudioDownloader: React.FC<AudioDownloaderProps> = ({
  lang,
  onUpdateGlobalState,
}) => {
  const t = translations[lang];

  const [url, setUrl] = useState<string>('https://www.youtube.com/watch?v=kJQP7kiw5Fk');
  const [downloadFolder, setDownloadFolder] = useState<string>('Downloads/Audio_Tracks');
  const [format, setFormat] = useState<'mp3' | 'wav' | 'm4a' | 'flac' | 'opus'>('mp3');
  const [bitrate, setBitrate] = useState<'320' | '256' | '192' | '128'>('320');
  const [embedCover, setEmbedCover] = useState<boolean>(true);
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
        logger.addLog('info', `Pasted URL for audio extraction: ${text.trim().substring(0, 45)}...`, 'Audio');
      }
    } catch {
      // ignore
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
      setStatusMessage(lang === 'km' ? 'សូមបញ្ចូល YouTube URL' : 'Please enter a YouTube URL');
      return;
    }

    const title = `Audio_${format.toUpperCase()}_${bitrate}kbps_Track`;
    setIsDownloading(true);
    setProgress(0);
    setStatusType('info');
    setStatusMessage(
      lang === 'km'
        ? `កំពុងស្រង់សំឡេងកម្រិត ${bitrate}kbps (${format.toUpperCase()})...`
        : `Extracting audio stream with ${bitrate}kbps bitrate (${format.toUpperCase()})...`
    );

    onUpdateGlobalState?.({
      isDownloading: true,
      progress: 0,
      statusText: `Extracting: ${title}`,
      activeItem: `${title}.${format}`,
      speed: '9.4 MB/s',
      eta: '00:02',
      downloadedBytes: '0.0 MB',
      totalBytes: '9.8 MB',
    });

    const cleanup = simulateDownloadWithMetrics(
      9.8,
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
            ? `ទាញយកសំឡេង ${format.toUpperCase()} ជោគជ័យ! រក្សាទុកនៅ៖ ${downloadFolder}`
            : `Audio (${format.toUpperCase()} @ ${bitrate}k) downloaded successfully to ${downloadFolder}!`
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
    <div id="audio-downloader-panel" className="neu-card p-5 sm:p-7 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-300/60">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl neu-card-sm text-emerald-600 bg-[#e6edf5] shadow-inner">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              {t.audTitle}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {t.audDesc}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* URL Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            {t.videoUrl}
          </label>
          <div className="relative">
            <input
              id="audio-url-input"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t.enterAudioUrl}
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
        </div>

        {/* Formats Grid */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            {t.audioFormat}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {(['mp3', 'm4a', 'wav', 'flac', 'opus'] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setFormat(fmt)}
                className={`py-2.5 px-3 rounded-2xl flex flex-col items-center justify-center gap-1 text-xs font-bold transition min-h-[50px] ${
                  format === fmt
                    ? 'neu-pill-inset text-emerald-700 bg-[#e6edf5] font-extrabold shadow-inner'
                    : 'neu-btn text-slate-700'
                }`}
              >
                <span className="uppercase">{fmt}</span>
                <span className="text-[10px] font-normal text-slate-500">
                  {fmt === 'wav' || fmt === 'flac' ? 'Lossless' : 'Compressed'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bitrate Selector & Destination */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              {t.audioBitrate}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['320', '256', '192', '128'] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBitrate(b)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition min-h-[42px] ${
                    bitrate === b
                      ? 'neu-pill-inset text-emerald-700 bg-[#e6edf5] shadow-inner font-extrabold'
                      : 'neu-btn text-slate-700'
                  }`}
                >
                  {b}k
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              {t.destination}
            </label>
            <div className="flex gap-2">
              <input
                id="audio-dest-input"
                type="text"
                value={downloadFolder}
                onChange={(e) => setDownloadFolder(e.target.value)}
                className="flex-1 neu-input px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 font-mono min-h-[42px]"
              />
              <button
                id="audio-browse-btn"
                onClick={() => {
                  const custom = prompt(
                    lang === 'km' ? 'បញ្ចូលទីតាំងរក្សាទុក:' : 'Enter custom download directory:',
                    downloadFolder
                  );
                  if (custom) setDownloadFolder(custom);
                }}
                className="neu-btn min-h-[42px] px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-emerald-600 transition flex items-center justify-center gap-1.5 shrink-0"
              >
                <Folder className="w-4 h-4 text-emerald-600" />
                <span>{t.browse}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="p-3.5 rounded-2xl neu-inset text-xs font-semibold text-slate-700">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={embedCover}
              onChange={(e) => setEmbedCover(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-400 accent-emerald-600"
            />
            <span>{t.optThumbnail} & ID3 Audio Tags</span>
          </label>
        </div>

        {/* Progress Bar */}
        {(isDownloading || progress > 0) && (
          <div className="space-y-2 p-4 rounded-2xl neu-inset">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700 flex items-center gap-2">
                <Loader2 className={`w-3.5 h-3.5 ${isDownloading ? 'animate-spin text-emerald-600' : ''}`} />
                {statusMessage}
              </span>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="text-emerald-700">{speed}</span>
                <span className="text-slate-700">ETA: {eta}</span>
                <span className="text-slate-800 font-bold">{progress}%</span>
              </div>
            </div>
            <div className="w-full h-3 neu-track p-0.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-200"
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
              id="audio-cancel-btn"
              onClick={handleCancel}
              className="flex-1 py-3 px-6 neu-btn text-rose-600 hover:bg-rose-50 font-bold text-sm flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              <span>{t.cancel}</span>
            </button>
          ) : (
            <button
              id="audio-download-submit-btn"
              onClick={handleDownload}
              className="flex-1 py-3 px-6 neu-btn-primary font-bold text-sm flex items-center justify-center gap-2 tracking-wide"
            >
              <Download className="w-4 h-4" />
              <span>{t.downloadAudio}</span>
            </button>
          )}

          <button
            id="audio-reset-btn"
            onClick={() => {
              setUrl('');
              setProgress(0);
              setStatusMessage(null);
            }}
            className="py-3 px-5 neu-btn text-slate-700 hover:text-emerald-600 font-bold text-sm flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.reset}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
