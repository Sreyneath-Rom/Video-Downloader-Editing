import React, { useState, useRef } from 'react';
import { Language, ExtractedFrame } from '../types';
import { translations } from '../translations';
import { captureVideoFrame, downloadDataUrl } from '../utils/videoProcessing';
import { parseTimeToSeconds, formatSecondsToTime, formatSecondsWithMs } from '../utils/time';
import {
  Image as ImageIcon,
  Upload,
  Download,
  Clock,
  Film,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Trash2,
  RotateCcw
} from 'lucide-react';

interface VideoFrameExtractorProps {
  lang: Language;
}

export const VideoFrameExtractor: React.FC<VideoFrameExtractorProps> = ({ lang }) => {
  const t = translations[lang];
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [timestampInput, setTimestampInput] = useState<string>('00:00:01');
  const [frames, setFrames] = useState<ExtractedFrame[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');

  const handleVideoUpload = (file: File) => {
    if (file) {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setFrames([]);
      setStatusType('success');
      setStatusMessage(`Loaded video: ${file.name}`);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleVideoUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setFrames([]);
      setStatusType('success');
      setStatusMessage(`Loaded video: ${file.name}`);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const curr = videoRef.current.currentTime;
      setCurrentTime(curr);
      setTimestampInput(formatSecondsToTime(curr));
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const seekRelative = (delta: number) => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + delta));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    setTimestampInput(formatSecondsToTime(newTime));
  };

  const handleExtractFromInputOrCurrent = async () => {
    if (!videoRef.current) {
      setStatusType('error');
      setStatusMessage('Please select and load a video file first.');
      return;
    }

    const targetSec = parseTimeToSeconds(timestampInput);
    if (targetSec > duration) {
      setStatusType('error');
      setStatusMessage(`Timestamp ${timestampInput} exceeds video duration (${formatSecondsToTime(duration)})`);
      return;
    }

    setIsExtracting(true);
    setStatusMessage(null);

    try {
      const dataUrl = await captureVideoFrame(videoRef.current, targetSec);
      const newFrame: ExtractedFrame = {
        id: Math.random().toString(36).substring(7),
        timestamp: formatSecondsWithMs(targetSec),
        dataUrl,
        timeInSeconds: targetSec
      };

      setFrames((prev) => [newFrame, ...prev]);
      setStatusType('success');
      setStatusMessage(`Frame extracted at ${formatSecondsWithMs(targetSec)}`);
    } catch {
      setStatusType('error');
      setStatusMessage('Failed to extract frame.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDownloadAll = () => {
    frames.forEach((frame, idx) => {
      setTimeout(() => {
        downloadDataUrl(frame.dataUrl, `frame_${frame.timestamp.replace(/:/g, '-')}.png`);
      }, idx * 250);
    });
  };

  return (
    <div id="video-frame-extractor-panel" className="neu-card p-6 sm:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-300/60">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl neu-card-sm text-sky-600 bg-[#e6edf5]">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
              {t.tabFrameExtractor}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Extract lossless high-resolution stills from MP4, AVI, MKV, and WebM videos at exact timestamps.
            </p>
          </div>
        </div>
      </div>

      {/* Video Dropzone / Preview */}
      {!videoUrl ? (
        <div
          id="frame-extractor-dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => document.getElementById('video-file-input')?.click()}
          className="border-2 border-dashed border-slate-300/80 hover:border-sky-500 neu-inset rounded-2xl p-8 sm:p-12 text-center transition cursor-pointer group bg-[#e6edf5]/50"
        >
          <input
            id="video-file-input"
            type="file"
            accept="video/*"
            onChange={handleFileInput}
            className="hidden"
          />
          <div className="w-16 h-16 rounded-2xl neu-card-sm text-sky-600 mx-auto flex items-center justify-center mb-4 group-hover:scale-105 transition bg-[#e6edf5]">
            <Film className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            {t.dropVideoHere}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            Supports MP4, WebM, MKV, AVI, and MOV video formats with frame-by-frame seeking.
          </p>
          <button
            type="button"
            className="mt-4 px-5 py-2.5 neu-btn text-sky-700 font-bold rounded-xl text-xs inline-flex items-center gap-1.5 transition"
          >
            <Upload className="w-4 h-4" />
            {t.browseVideo}
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Active Video Player & Controls */}
          <div className="relative rounded-2xl overflow-hidden neu-inset p-3 bg-[#e6edf5]">
            <video
              ref={videoRef}
              src={videoUrl}
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              className="w-full max-h-[380px] object-contain mx-auto rounded-xl neu-card-sm bg-black"
            />

            {/* Video Overlaid Timeline Control Bar */}
            <div className="mt-3 p-3 rounded-xl neu-card-sm flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 bg-[#e6edf5]">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 justify-center sm:justify-start">
                <button
                  onClick={togglePlay}
                  className="p-2.5 rounded-xl neu-btn text-sky-600 hover:text-sky-800 transition min-h-[40px] min-w-[40px] flex items-center justify-center"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => seekRelative(-1)}
                  className="px-2.5 sm:px-3 py-2 neu-btn text-slate-700 rounded-xl text-xs font-semibold min-h-[40px]"
                >
                  {t.stepBackward}
                </button>
                <button
                  onClick={() => seekRelative(-0.1)}
                  className="px-2 sm:px-3 py-2 neu-btn text-slate-700 rounded-xl text-[11px] sm:text-xs font-mono font-semibold min-h-[40px]"
                >
                  {t.stepFrameBackward}
                </button>
                <button
                  onClick={() => seekRelative(0.1)}
                  className="px-2 sm:px-3 py-2 neu-btn text-slate-700 rounded-xl text-[11px] sm:text-xs font-mono font-semibold min-h-[40px]"
                >
                  {t.stepFrameForward}
                </button>
                <button
                  onClick={() => seekRelative(1)}
                  className="px-2.5 sm:px-3 py-2 neu-btn text-slate-700 rounded-xl text-xs font-semibold min-h-[40px]"
                >
                  {t.stepForward}
                </button>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-700 neu-pill-inset px-3 py-2">
                  <Clock className="w-3.5 h-3.5 text-sky-600" />
                  <span>{formatSecondsToTime(currentTime)}</span>
                  <span className="text-slate-400">/</span>
                  <span className="text-slate-500">{formatSecondsToTime(duration)}</span>
                </div>

                <button
                  onClick={() => {
                    if (videoUrl) URL.revokeObjectURL(videoUrl);
                    setVideoUrl(null);
                    setFrames([]);
                  }}
                  className="px-3 py-2 neu-btn text-slate-600 hover:text-red-500 rounded-xl text-xs font-bold transition flex items-center gap-1.5 min-h-[40px]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Change Video</span>
                </button>
              </div>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                {t.timestamp}
              </label>
              <input
                id="frame-timestamp-input"
                type="text"
                value={timestampInput}
                onChange={(e) => setTimestampInput(e.target.value)}
                placeholder="00:00:05"
                className="w-full neu-input px-4 py-3 text-sm text-slate-800 font-mono"
              />
            </div>

            <div className="flex items-end">
              <button
                id="frame-extract-btn"
                onClick={handleExtractFromInputOrCurrent}
                disabled={isExtracting}
                className="w-full py-3.5 px-6 neu-btn-primary disabled:opacity-60 font-bold text-sm flex items-center justify-center gap-2 tracking-wide"
              >
                <ImageIcon className="w-4 h-4" />
                <span>{t.extractImage}</span>
              </button>
            </div>
          </div>

          {/* Status Alert */}
          {statusMessage && (
            <div
              className={`p-4 rounded-2xl text-xs font-medium flex items-center gap-3 neu-inset ${
                statusType === 'success'
                  ? 'text-emerald-800'
                  : 'text-red-700'
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

          {/* Extracted Frames Gallery */}
          {frames.length > 0 && (
            <div className="p-5 rounded-2xl neu-inset space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-300/60">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {t.capturedFrames} ({frames.length})
                </h4>
                <button
                  id="frame-download-all-btn"
                  onClick={handleDownloadAll}
                  className="px-3.5 py-1.5 neu-btn text-sky-700 hover:text-sky-900 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  {t.downloadAllFrames}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 max-h-80 overflow-y-auto pr-1">
                {frames.map((frame) => (
                  <div
                    key={frame.id}
                    className="group relative neu-card-sm rounded-xl overflow-hidden transition"
                  >
                    <img
                      src={frame.dataUrl}
                      alt="frame"
                      className="w-full h-28 object-cover group-hover:scale-105 transition"
                    />
                    <div className="p-2.5 bg-[#e6edf5] flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-700 font-bold">{frame.timestamp}</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => downloadDataUrl(frame.dataUrl, `frame_${frame.timestamp.replace(/:/g, '-')}.png`)}
                          className="p-1.5 neu-btn text-slate-600 hover:text-emerald-600 rounded-lg transition"
                          title="Save Image"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setFrames((prev) => prev.filter((f) => f.id !== frame.id))}
                          className="p-1.5 neu-btn text-slate-600 hover:text-red-500 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

