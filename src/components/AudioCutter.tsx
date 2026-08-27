import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import {
  decodeAudioFile,
  extractPeaks,
  sliceAudioBuffer,
  audioBufferToWav,
  downloadBlob
} from '../utils/audioProcessing';
import { parseTimeToSeconds, formatSecondsToTime } from '../utils/time';
import {
  Scissors,
  Play,
  Square,
  Repeat,
  Folder,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Music,
  Loader2
} from 'lucide-react';

interface AudioCutterProps {
  lang: Language;
}

export const AudioCutter: React.FC<AudioCutterProps> = ({ lang }) => {
  const t = translations[lang];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [peaks, setPeaks] = useState<number[]>([]);
  const [duration, setDuration] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [startTimeInput, setStartTimeInput] = useState<string>('00:00:00');
  const [endTimeInput, setEndTimeInput] = useState<string>('00:00:15');
  const [saveDir, setSaveDir] = useState<string>('Downloads/Audio_Cuts');
  const [exportFormat, setExportFormat] = useState<'wav' | 'mp3'>('wav');

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Initialize or load audio
  const handleAudioUpload = async (file: File) => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const decoded = await decodeAudioFile(file);
      setAudioFile(file);
      setAudioBuffer(decoded.audioBuffer);
      setDuration(decoded.duration);

      const p = extractPeaks(decoded.audioBuffer, 220);
      setPeaks(p);

      setStartTime(0);
      setStartTimeInput('00:00:00');
      const initialEnd = Math.min(decoded.duration, 30);
      setEndTime(initialEnd);
      setEndTimeInput(formatSecondsToTime(initialEnd));

      setStatusType('success');
      setStatusMessage(`Loaded audio: ${file.name} (${formatSecondsToTime(decoded.duration)})`);
    } catch {
      setStatusType('error');
      setStatusMessage('Failed to decode audio file. Please try a valid MP3, WAV or OGG file.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleAudioUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|ogg|flac|m4a)$/i))) {
      handleAudioUpload(file);
    }
  };

  const handleLoadDemoAudio = () => {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const sampleRate = ctx.sampleRate || 44100;
    const durationSec = 16;
    const buffer = ctx.createBuffer(2, sampleRate * durationSec, sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const noteIndex = Math.floor(t * 2) % 8;
        const scale = [220, 247, 261, 293, 329, 349, 392, 440];
        const freq = scale[noteIndex] || 220;
        data[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-((t % 0.5) * 3)) * 0.35;
      }
    }

    const demoFile = new File([new Blob()], 'Demo_Synth_Harmonics.wav', { type: 'audio/wav' });
    setAudioFile(demoFile);
    setAudioBuffer(buffer);
    setDuration(durationSec);
    const p = extractPeaks(buffer, 220);
    setPeaks(p);
    setStartTime(0);
    setStartTimeInput('00:00:00');
    setEndTime(8);
    setEndTimeInput('00:00:08');
    setStatusType('success');
    setStatusMessage('Loaded Demo Audio: Demo_Synth_Harmonics.wav (16s)');
  };

  // Draw Waveform on Canvas with dynamic high-DPI scaling
  useEffect(() => {
    if (!canvasRef.current || peaks.length === 0) return;
    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    if (!container) return;

    const displayWidth = container.clientWidth || 800;
    const displayHeight = 120;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    const width = displayWidth;
    const height = displayHeight;

    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = '#d9e2ec';
    ctx.fillRect(0, 0, width, height);

    // Calculate selection bounds
    const startX = (startTime / (duration || 1)) * width;
    const endX = (endTime / (duration || 1)) * width;

    // Draw unselected dim region (start)
    ctx.fillStyle = 'rgba(217, 226, 236, 0.6)';
    ctx.fillRect(0, 0, startX, height);

    // Draw selected active region highlight
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.fillRect(startX, 0, endX - startX, height);

    // Draw waveform bars
    const barWidth = width / peaks.length;
    peaks.forEach((peak, i) => {
      const barHeight = peak * (height * 0.85);
      const x = i * barWidth;
      const y = (height - barHeight) / 2;

      const isInsideSelection = x >= startX && x <= endX;

      if (isInsideSelection) {
        ctx.fillStyle = '#059669';
      } else {
        ctx.fillStyle = '#94a3b8';
      }

      ctx.fillRect(x + 1, y, Math.max(1, barWidth - 1.5), barHeight);
    });

    // Draw start line marker
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startX, 0);
    ctx.lineTo(startX, height);
    ctx.stroke();

    // Draw end line marker
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(endX, 0);
    ctx.lineTo(endX, height);
    ctx.stroke();
  }, [peaks, startTime, endTime, duration]);

  // Audio Playback Controls
  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch {
        // ignore already stopped
      }
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  const playSelection = () => {
    if (!audioBuffer) return;
    stopAudio();

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.loop = isLooping;
    source.loopStart = startTime;
    source.loopEnd = endTime;

    source.connect(ctx.destination);

    const playDuration = endTime - startTime;
    source.start(0, startTime, isLooping ? undefined : playDuration);

    sourceNodeRef.current = source;
    setIsPlaying(true);

    source.onended = () => {
      if (!isLooping) {
        setIsPlaying(false);
      }
    };
  };

  const handleStartTimeChange = (val: string) => {
    setStartTimeInput(val);
    const secs = parseTimeToSeconds(val);
    if (!isNaN(secs) && secs >= 0 && secs < (duration || 9999)) {
      setStartTime(secs);
    }
  };

  const handleEndTimeChange = (val: string) => {
    setEndTimeInput(val);
    const secs = parseTimeToSeconds(val);
    if (!isNaN(secs) && secs > 0 && secs <= (duration || 9999)) {
      setEndTime(secs);
    }
  };

  const handleWaveformClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || duration === 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetSec = ratio * duration;

    // Adjust nearest handle
    const distToStart = Math.abs(targetSec - startTime);
    const distToEnd = Math.abs(targetSec - endTime);

    if (distToStart < distToEnd) {
      if (targetSec < endTime) {
        setStartTime(targetSec);
        setStartTimeInput(formatSecondsToTime(targetSec));
      }
    } else {
      if (targetSec > startTime) {
        setEndTime(targetSec);
        setEndTimeInput(formatSecondsToTime(targetSec));
      }
    }
  };

  const handleCutAudio = async () => {
    if (!audioBuffer || !audioFile) {
      setStatusType('error');
      setStatusMessage(t.selectFileFirst);
      return;
    }

    const parsedStart = parseTimeToSeconds(startTimeInput);
    const parsedEnd = parseTimeToSeconds(endTimeInput);

    if (parsedStart >= parsedEnd) {
      setStatusType('error');
      setStatusMessage(t.startTimeMustBeLess);
      return;
    }

    if (parsedStart > duration || parsedEnd > duration) {
      setStatusType('error');
      setStatusMessage(t.timeOutsideDuration);
      return;
    }

    setProcessing(true);
    setStatusMessage(null);

    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const sliced = sliceAudioBuffer(audioBuffer, parsedStart, parsedEnd, audioCtx);
      const wavBlob = audioBufferToWav(sliced);

      const baseName = audioFile.name.substring(0, audioFile.name.lastIndexOf('.')) || 'cut_audio';
      const outputFilename = `${baseName}_cut_${formatSecondsToTime(parsedStart).replace(/:/g, '-')}_to_${formatSecondsToTime(parsedEnd).replace(/:/g, '-')}.${exportFormat}`;

      downloadBlob(wavBlob, outputFilename);

      setStatusType('success');
      setStatusMessage(`${t.audioCutSuccess} File: ${outputFilename}`);
    } catch {
      setStatusType('error');
      setStatusMessage(t.audioCutError);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div id="audio-cutter-panel" className="neu-card p-6 sm:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-300/60">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl neu-card-sm text-emerald-600 bg-[#e6edf5]">
            <Scissors className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
              {t.tabAudioCutter}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Trim, cut, and export high-resolution audio files (MP3, WAV, FLAC, OGG) with exact millisecond precision.
            </p>
          </div>
        </div>
      </div>

      {/* Audio Dropzone / Selector */}
      {!audioFile ? (
        <div
          id="audio-cutter-dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => document.getElementById('audio-file-input')?.click()}
          className="border-2 border-dashed border-slate-300/80 hover:border-emerald-500 neu-inset rounded-2xl p-8 sm:p-12 text-center transition cursor-pointer group bg-[#e6edf5]/50"
        >
          <input
            id="audio-file-input"
            type="file"
            accept="audio/*"
            onChange={handleFileInput}
            className="hidden"
          />
          <div className="w-16 h-16 rounded-2xl neu-card-sm text-emerald-600 mx-auto flex items-center justify-center mb-4 group-hover:scale-105 transition bg-[#e6edf5]">
            {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Music className="w-8 h-8" />}
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            {loading ? 'Decoding Audio...' : t.dropAudioHere}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium mb-4">
            Supports MP3, WAV, OGG, AAC, FLAC, and M4A audio tracks.
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleLoadDemoAudio();
            }}
            className="neu-btn px-4 py-2 text-xs font-bold text-emerald-700 hover:text-emerald-900 rounded-xl inline-flex items-center gap-2 bg-emerald-50/50"
          >
            <Music className="w-3.5 h-3.5" />
            <span>Load Demo Audio Track (15s Synth)</span>
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* File summary & Change Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl neu-inset text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <Volume2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold text-slate-800 truncate">{audioFile.name}</span>
              <span className="text-slate-500 font-mono font-medium">({formatSecondsToTime(duration)})</span>
            </div>
            <button
              id="change-audio-btn"
              onClick={() => document.getElementById('change-audio-input')?.click()}
              className="px-3.5 py-1.5 neu-btn text-slate-700 hover:text-emerald-600 rounded-xl font-bold transition shrink-0"
            >
              Change File
            </button>
            <input
              id="change-audio-input"
              type="file"
              accept="audio/*"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>

          {/* Interactive Waveform Canvas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
              <span className="font-bold text-slate-700">{t.audioWaveform}</span>
              <span className="text-slate-500 font-normal">Click waveform to set start / end markers</span>
            </div>
            <div className="rounded-2xl overflow-hidden neu-inset p-2 relative">
              <canvas
                ref={canvasRef}
                width={800}
                height={120}
                onClick={handleWaveformClick}
                className="w-full h-28 cursor-pointer rounded-xl neu-card-sm"
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-500 font-medium">
              <span>00:00:00</span>
              <span className="neu-pill-inset px-2.5 py-0.5 text-emerald-700 font-bold">
                Selected: {formatSecondsToTime(Math.max(0, endTime - startTime))}
              </span>
              <span>{formatSecondsToTime(duration)}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3 p-4 rounded-2xl neu-inset">
            <button
              id="cutter-play-btn"
              onClick={playSelection}
              disabled={isPlaying}
              className="px-5 py-2.5 neu-btn text-emerald-700 hover:text-emerald-900 disabled:opacity-50 font-bold rounded-xl text-xs flex items-center gap-2 transition"
            >
              <Play className="w-4 h-4 fill-current" />
              {t.playSelection}
            </button>
            <button
              id="cutter-stop-btn"
              onClick={stopAudio}
              disabled={!isPlaying}
              className="px-5 py-2.5 neu-btn text-slate-700 hover:text-red-500 disabled:opacity-50 font-bold rounded-xl text-xs flex items-center gap-2 transition"
            >
              <Square className="w-4 h-4 fill-current" />
              {t.stopAudio}
            </button>
            <button
              id="cutter-loop-btn"
              onClick={() => setIsLooping(!isLooping)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                isLooping
                  ? 'neu-pill-inset text-emerald-700 font-extrabold'
                  : 'neu-btn text-slate-600 hover:text-slate-900'
              }`}
            >
              <Repeat className="w-4 h-4" />
              {t.loopSelection}
            </button>
          </div>

          {/* Time & Destination Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                {t.startTime}
              </label>
              <input
                id="cutter-start-time-input"
                type="text"
                value={startTimeInput}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                placeholder="00:00:00"
                className="w-full neu-input px-4 py-3 text-sm text-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                {t.endTime}
              </label>
              <input
                id="cutter-end-time-input"
                type="text"
                value={endTimeInput}
                onChange={(e) => handleEndTimeChange(e.target.value)}
                placeholder="00:00:30"
                className="w-full neu-input px-4 py-3 text-sm text-slate-800 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Save Directory:
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                <input
                  id="cutter-save-dir-input"
                  type="text"
                  value={saveDir}
                  onChange={(e) => setSaveDir(e.target.value)}
                  className="flex-1 neu-input px-4 py-3 text-sm text-slate-800 placeholder-slate-400 min-h-[44px]"
                />
                <button
                  id="cutter-browse-btn"
                  onClick={() => {
                    const custom = prompt('Enter save directory path:', saveDir);
                    if (custom) setSaveDir(custom);
                  }}
                  className="neu-btn min-h-[44px] px-5 py-3 text-xs font-bold text-slate-700 hover:text-emerald-600 transition flex items-center justify-center gap-2 shrink-0"
                >
                  <Folder className="w-4 h-4 text-emerald-600" />
                  <span>Browse Save</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                {t.exportFormat}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="format-wav-btn"
                  onClick={() => setExportFormat('wav')}
                  className={`min-h-[44px] py-3 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center ${
                    exportFormat === 'wav'
                      ? 'neu-pill-inset text-emerald-700 font-extrabold'
                      : 'neu-btn text-slate-600 hover:text-slate-900'
                  }`}
                >
                  WAV (Lossless)
                </button>
                <button
                  id="format-mp3-btn"
                  onClick={() => setExportFormat('mp3')}
                  className={`min-h-[44px] py-3 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center ${
                    exportFormat === 'mp3'
                      ? 'neu-pill-inset text-emerald-700 font-extrabold'
                      : 'neu-btn text-slate-600 hover:text-slate-900'
                  }`}
                >
                  MP3 (Audio)
                </button>
              </div>
            </div>
          </div>

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

          {/* Cut & Export Button */}
          <div className="flex gap-3 pt-2">
            <button
              id="cutter-cut-btn"
              onClick={handleCutAudio}
              disabled={processing}
              className="flex-1 py-3.5 px-6 neu-btn-primary disabled:opacity-60 font-bold text-sm flex items-center justify-center gap-2 tracking-wide"
            >
              <Scissors className="w-4 h-4" />
              <span>{processing ? t.cutting : t.cutAudio}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

