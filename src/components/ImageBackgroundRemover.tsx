import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { logger } from '../utils/logger';
import {
  UploadCloud,
  Download,
  Scissors,
  Image as ImageIcon,
  RotateCcw,
  Sliders,
  Paintbrush,
  Eraser,
  Pipette,
  Layers,
  Copy,
  CheckCircle2,
  SplitSquareVertical,
  Columns,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface ImageBackgroundRemoverProps {
  lang: Language;
}

type ViewMode = 'result' | 'split' | 'side' | 'original';
type BgMode = 'transparent' | 'solid' | 'gradient' | 'custom' | 'blur';

const SAMPLE_IMAGES = [
  {
    id: 'portrait',
    name: 'Portrait Model',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&auto=format&fit=crop&q=80',
    type: 'portrait',
  },
  {
    id: 'product',
    name: 'Sneakers Product',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&auto=format&fit=crop&q=80',
    type: 'product',
  },
  {
    id: 'pet',
    name: 'Cat Pet',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1000&auto=format&fit=crop&q=80',
    type: 'pet',
  },
  {
    id: 'car',
    name: 'Sports Car',
    url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1000&auto=format&fit=crop&q=80',
    type: 'car',
  },
];

export const ImageBackgroundRemover: React.FC<ImageBackgroundRemoverProps> = ({ lang }) => {
  const t = translations[lang];

  const [imageSrc, setImageSrc] = useState<string | null>(SAMPLE_IMAGES[0].url);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [tolerance, setTolerance] = useState<number>(35);
  const [feather, setFeather] = useState<number>(3);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [splitPos, setSplitPos] = useState<number>(50);
  const [bgMode, setBgMode] = useState<BgMode>('transparent');
  const [solidColor, setSolidColor] = useState<string>('#ffffff');
  const [gradientType, setGradientType] = useState<string>('sunset');
  const [customBgSrc, setCustomBgSrc] = useState<string | null>(null);
  const [isEyedropperActive, setIsEyedropperActive] = useState<boolean>(false);
  const [keyColor, setKeyColor] = useState<{ r: number; g: number; b: number } | null>(null);
  const [brushMode, setBrushMode] = useState<'erase' | 'restore' | null>(null);
  const [brushSize, setBrushSize] = useState<number>(25);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const customBgInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingSplitRef = useRef<boolean>(false);
  const isPaintingRef = useRef<boolean>(false);

  // Process background removal using intelligent edge and color analysis
  const processImage = useCallback(() => {
    if (!imageSrc) return;

    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;

      // Setup original canvas
      let origCanvas = originalCanvasRef.current;
      if (!origCanvas) {
        origCanvas = document.createElement('canvas');
        originalCanvasRef.current = origCanvas;
      }
      origCanvas.width = w;
      origCanvas.height = h;
      const origCtx = origCanvas.getContext('2d');
      if (!origCtx) return;
      origCtx.drawImage(img, 0, 0, w, h);
      const origData = origCtx.getImageData(0, 0, w, h);
      const pixels = origData.data;

      // Setup mask canvas
      let maskCanvas = maskCanvasRef.current;
      if (!maskCanvas) {
        maskCanvas = document.createElement('canvas');
        maskCanvasRef.current = maskCanvas;
      }
      maskCanvas.width = w;
      maskCanvas.height = h;
      const maskCtx = maskCanvas.getContext('2d');
      if (!maskCtx) return;

      const maskData = maskCtx.createImageData(w, h);
      const maskPixels = maskData.data;

      // Determine background color sample from 4 corners if keyColor not explicitly set
      let targetR = 255;
      let targetG = 255;
      let targetB = 255;

      if (keyColor) {
        targetR = keyColor.r;
        targetG = keyColor.g;
        targetB = keyColor.b;
      } else {
        // Average corner samples
        const samplePoints = [
          0,
          (w - 1) * 4,
          (h - 1) * w * 4,
          ((h - 1) * w + (w - 1)) * 4,
          Math.floor(w / 2) * 4,
        ];
        let sumR = 0, sumG = 0, sumB = 0;
        samplePoints.forEach((idx) => {
          sumR += pixels[idx];
          sumG += pixels[idx + 1];
          sumB += pixels[idx + 2];
        });
        targetR = Math.round(sumR / samplePoints.length);
        targetG = Math.round(sumG / samplePoints.length);
        targetB = Math.round(sumB / samplePoints.length);
      }

      const threshold = tolerance * 2.55; // 0..255 scale
      const featherRange = Math.max(1, feather * 1.5);

      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        // Euclidean color distance
        const dr = r - targetR;
        const dg = g - targetG;
        const db = b - targetB;
        const dist = Math.sqrt(dr * dr + dg * dg + db * db);

        let alpha = 255;
        if (dist < threshold) {
          alpha = 0;
        } else if (dist < threshold + featherRange) {
          alpha = Math.round(((dist - threshold) / featherRange) * 255);
        }

        maskPixels[i] = 255;
        maskPixels[i + 1] = 255;
        maskPixels[i + 2] = 255;
        maskPixels[i + 3] = alpha;
      }

      maskCtx.putImageData(maskData, 0, 0);

      renderComposedOutput();
      setIsProcessing(false);
      logger.addLog('success', 'Background matting computation finished.', 'RemoveBG');
    };

    img.onerror = () => {
      setIsProcessing(false);
      logger.addLog('error', 'Failed to load source image for background removal.', 'RemoveBG');
    };
  }, [imageSrc, tolerance, feather, keyColor]);

  // Render composite on primary display canvas
  const renderComposedOutput = useCallback(() => {
    const canvas = canvasRef.current;
    const origCanvas = originalCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;

    if (!canvas || !origCanvas || !maskCanvas) return;

    const w = origCanvas.width;
    const h = origCanvas.height;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, w, h);

    // Draw background replacement
    if (bgMode === 'solid') {
      ctx.fillStyle = solidColor;
      ctx.fillRect(0, 0, w, h);
    } else if (bgMode === 'gradient') {
      let grad = ctx.createLinearGradient(0, 0, w, h);
      if (gradientType === 'sunset') {
        grad.addColorStop(0, '#ff7e5f');
        grad.addColorStop(1, '#feb47b');
      } else if (gradientType === 'neon') {
        grad.addColorStop(0, '#0f2027');
        grad.addColorStop(0.5, '#203a43');
        grad.addColorStop(1, '#2c5364');
      } else {
        grad.addColorStop(0, '#e0eafc');
        grad.addColorStop(1, '#cfdef3');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    } else if (bgMode === 'blur') {
      ctx.filter = 'blur(16px)';
      ctx.drawImage(origCanvas, -20, -20, w + 40, h + 40);
      ctx.filter = 'none';
    } else if (bgMode === 'custom' && customBgSrc) {
      const customImg = new Image();
      customImg.src = customBgSrc;
      if (customImg.complete) {
        ctx.drawImage(customImg, 0, 0, w, h);
      }
    }

    // Cutout layer
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Draw foreground image
    tempCtx.drawImage(origCanvas, 0, 0);
    // Apply mask using destination-in
    tempCtx.globalCompositeOperation = 'destination-in';
    tempCtx.drawImage(maskCanvas, 0, 0);

    // Composite foreground onto main canvas
    ctx.drawImage(tempCanvas, 0, 0);
  }, [bgMode, solidColor, gradientType, customBgSrc]);

  useEffect(() => {
    processImage();
  }, [processImage]);

  useEffect(() => {
    renderComposedOutput();
  }, [renderComposedOutput]);

  // Handle image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageSrc(event.target.result as string);
          setKeyColor(null);
          logger.addLog('info', `Loaded image file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`, 'RemoveBG');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomBgSrc(event.target.result as string);
          setBgMode('custom');
          logger.addLog('info', 'Custom background photo uploaded.', 'RemoveBG');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Canvas interaction (Eyedropper or Brush)
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEyedropperActive) return;
    const canvas = canvasRef.current;
    const origCanvas = originalCanvasRef.current;
    if (!canvas || !origCanvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const origCtx = origCanvas.getContext('2d');
    if (!origCtx) return;

    const pixel = origCtx.getImageData(x, y, 1, 1).data;
    setKeyColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
    setIsEyedropperActive(false);
    logger.addLog('info', `Picked color key: rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`, 'RemoveBG');
  };

  // Brush drawing on mask
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!brushMode) return;
    isPaintingRef.current = true;
    paintOnMask(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPaintingRef.current || !brushMode) return;
    paintOnMask(e);
  };

  const handleMouseUp = () => {
    isPaintingRef.current = false;
  };

  const paintOnMask = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const maskCanvas = maskCanvasRef.current;
    const canvas = canvasRef.current;
    if (!maskCanvas || !canvas || !brushMode) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;

    maskCtx.beginPath();
    maskCtx.arc(x, y, brushSize, 0, Math.PI * 2);
    if (brushMode === 'erase') {
      maskCtx.globalCompositeOperation = 'destination-out';
      maskCtx.fill();
    } else {
      maskCtx.globalCompositeOperation = 'source-over';
      maskCtx.fillStyle = '#ffffff';
      maskCtx.fill();
    }
    maskCtx.globalCompositeOperation = 'source-over';

    renderComposedOutput();
  };

  // Split slider drag handling
  const handleSplitMouseDown = () => {
    isDraggingSplitRef.current = true;
  };

  const handleSplitMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingSplitRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const pct = Math.round((x / rect.width) * 100);
    setSplitPos(pct);
  };

  const handleSplitMouseUp = () => {
    isDraggingSplitRef.current = false;
  };

  // Export functions
  const handleDownloadPng = () => {
    const origCanvas = originalCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!origCanvas || !maskCanvas) return;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = origCanvas.width;
    exportCanvas.height = origCanvas.height;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(origCanvas, 0, 0);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(maskCanvas, 0, 0);

    const link = document.createElement('a');
    link.download = `transparent_cutout_${Date.now()}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
    logger.addLog('success', 'Lossless transparent PNG downloaded.', 'RemoveBG');
  };

  const handleDownloadJpg = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `cutout_studio_${Date.now()}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
    logger.addLog('success', 'High-res composite JPEG downloaded.', 'RemoveBG');
  };

  const handleCopyClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopiedNotification(true);
          setTimeout(() => setCopiedNotification(false), 3000);
          logger.addLog('success', 'Cutout copied to system clipboard.', 'RemoveBG');
        }
      });
    } catch {
      logger.addLog('error', 'Clipboard permission denied.', 'RemoveBG');
    }
  };

  return (
    <div className="space-y-6" id="image-remove-bg-section">
      {/* Header Banner */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-600 text-white shadow-sm">
              <Scissors className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white" id="bg-remover-title">
                  {t.bgTitle}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  Smart Alpha Matting
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {t.bgDesc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="bg-reset-btn"
              onClick={() => {
                setKeyColor(null);
                setTolerance(35);
                setFeather(3);
                setBgMode('transparent');
                setBrushMode(null);
                processImage();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t.resetImage}
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Controls, Upload, and Tuning (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Upload Box */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-emerald-500" />
              Upload Image
            </h3>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl p-6 text-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-950/50 group"
            >
              <UploadCloud className="w-8 h-8 mx-auto text-slate-400 group-hover:text-emerald-500 transition mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t.dropImageHere}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                {t.supportedFormats}
              </p>
            </div>

            {/* Preloaded Samples */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-2">
                {t.sampleImages}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {SAMPLE_IMAGES.map((sample) => (
                  <button
                    key={sample.id}
                    id={`bg-sample-${sample.id}`}
                    onClick={() => {
                      setImageSrc(sample.url);
                      setKeyColor(null);
                    }}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs transition ${
                      imageSrc === sample.url
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 font-medium text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <img src={sample.url} alt={sample.name} className="w-6 h-6 rounded object-cover" />
                    <span className="truncate">{sample.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Matting Precision Tuning */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-500" />
                Matting Tuning
              </span>
              {isProcessing && <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />}
            </h3>

            {/* Tolerance Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
                <span>{t.bgThreshold}</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{tolerance}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="90"
                value={tolerance}
                onChange={(e) => setTolerance(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Feathering / Smoothness Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
                <span>{t.bgSmoothing}</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{feather}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                value={feather}
                onChange={(e) => setFeather(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Color Eyedropper Key & Tools */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <button
                id="bg-eyedropper-btn"
                onClick={() => setIsEyedropperActive(!isEyedropperActive)}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold border transition ${
                  isEyedropperActive
                    ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Pipette className="w-3.5 h-3.5" />
                {isEyedropperActive ? 'Click on canvas to pick background...' : t.colorPickerKey}
              </button>

              {keyColor && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border border-slate-300 shadow-sm"
                      style={{ backgroundColor: `rgb(${keyColor.r}, ${keyColor.g}, ${keyColor.b})` }}
                    />
                    <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      RGB({keyColor.r}, {keyColor.g}, {keyColor.b})
                    </span>
                  </div>
                  <button
                    onClick={() => setKeyColor(null)}
                    className="text-[11px] text-red-500 hover:underline"
                  >
                    Reset Key
                  </button>
                </div>
              )}
            </div>

            {/* Manual Touch-Up Brush */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 block">
                Manual Touch-Up Brush:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setBrushMode(brushMode === 'erase' ? null : 'erase')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                    brushMode === 'erase'
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Eraser className="w-3.5 h-3.5 text-red-500" />
                  {t.modeErase}
                </button>
                <button
                  onClick={() => setBrushMode(brushMode === 'restore' ? null : 'restore')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                    brushMode === 'restore'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Paintbrush className="w-3.5 h-3.5 text-emerald-500" />
                  {t.modeRestore}
                </button>
              </div>

              {brushMode && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>{t.bgBrushSize}</span>
                    <span className="font-mono">{brushSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="80"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-800 dark:accent-slate-200"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Background Replacement Studio */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-500" />
              {t.bgReplacement}
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {/* Transparent */}
              <button
                onClick={() => setBgMode('transparent')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition ${
                  bgMode === 'transparent'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="w-6 h-6 rounded border border-slate-300 bg-[linear-gradient(45deg,#ccc_25%,transparent_25%),linear-gradient(-45deg,#ccc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ccc_75%),linear-gradient(-45deg,transparent_75%,#ccc_75%)] bg-[size:8px_8px] bg-[position:0_0,0_4px,4px_-4px,-4px_0] mb-1" />
                <span className="text-[11px]">Alpha</span>
              </button>

              {/* White Solid */}
              <button
                onClick={() => {
                  setBgMode('solid');
                  setSolidColor('#ffffff');
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition ${
                  bgMode === 'solid' && solidColor === '#ffffff'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="w-6 h-6 rounded border border-slate-300 bg-white shadow-sm mb-1" />
                <span className="text-[11px]">White</span>
              </button>

              {/* Black Solid */}
              <button
                onClick={() => {
                  setBgMode('solid');
                  setSolidColor('#0f172a');
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition ${
                  bgMode === 'solid' && solidColor === '#0f172a'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="w-6 h-6 rounded border border-slate-700 bg-slate-900 shadow-sm mb-1" />
                <span className="text-[11px]">Black</span>
              </button>

              {/* Chroma Green */}
              <button
                onClick={() => {
                  setBgMode('solid');
                  setSolidColor('#00b140');
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition ${
                  bgMode === 'solid' && solidColor === '#00b140'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="w-6 h-6 rounded bg-[#00b140] shadow-sm mb-1" />
                <span className="text-[11px]">Green</span>
              </button>

              {/* Sunset Gradient */}
              <button
                onClick={() => {
                  setBgMode('gradient');
                  setGradientType('sunset');
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition ${
                  bgMode === 'gradient' && gradientType === 'sunset'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="w-6 h-6 rounded bg-gradient-to-tr from-rose-500 to-amber-400 shadow-sm mb-1" />
                <span className="text-[11px]">Sunset</span>
              </button>

              {/* Portrait Blur */}
              <button
                onClick={() => setBgMode('blur')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition ${
                  bgMode === 'blur'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="w-6 h-6 rounded border border-slate-300 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  BLUR
                </div>
                <span className="text-[11px]">Depth Blur</span>
              </button>
            </div>

            {/* Custom Photo Upload */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <input
                type="file"
                ref={customBgInputRef}
                onChange={handleCustomBgUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => customBgInputRef.current?.click()}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
                {t.bgCustomImageUpload}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Interactive Canvas Viewport & Export (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            {/* View Mode Bar & Zoom Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              {/* View Modes */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button
                  id="view-split-btn"
                  onClick={() => setViewMode('split')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
                    viewMode === 'split'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <SplitSquareVertical className="w-3.5 h-3.5 text-emerald-500" />
                  {t.viewSplit}
                </button>

                <button
                  id="view-result-btn"
                  onClick={() => setViewMode('result')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
                    viewMode === 'result'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  {t.viewResult}
                </button>

                <button
                  id="view-side-btn"
                  onClick={() => setViewMode('side')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
                    viewMode === 'side'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5 text-emerald-500" />
                  {t.viewSideBySide}
                </button>

                <button
                  id="view-orig-btn"
                  onClick={() => setViewMode('original')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
                    viewMode === 'original'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                  {t.viewOriginal}
                </button>
              </div>

              {/* Zoom Tools */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-mono text-slate-600 dark:text-slate-400 min-w-[3rem] text-center">
                  {zoomLevel}%
                </span>
                <button
                  onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Canvas Stage Viewport */}
            <div
              ref={containerRef}
              onMouseMove={handleSplitMouseMove}
              onMouseUp={handleSplitMouseUp}
              className={`relative min-h-[440px] max-h-[560px] w-full flex items-center justify-center overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 select-none ${
                bgMode === 'transparent'
                  ? 'bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] dark:bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%),linear-gradient(-45deg,#1e293b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1e293b_75%),linear-gradient(-45deg,transparent_75%,#1e293b_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0]'
                  : 'bg-slate-900'
              } ${isEyedropperActive ? 'cursor-crosshair' : brushMode ? 'cursor-cell' : 'cursor-default'}`}
            >
              {/* Split Mode Display */}
              {viewMode === 'split' && (
                <div className="relative w-full h-full flex items-center justify-center p-4">
                  {/* Original Image Layer (Left/Background) */}
                  <img
                    src={imageSrc || ''}
                    alt="Original"
                    className="max-h-[480px] max-w-full object-contain pointer-events-none"
                    style={{ transform: `scale(${zoomLevel / 100})` }}
                  />

                  {/* Cutout / Processed Layer with Clip Path (Right/Foreground) */}
                  <div
                    className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none"
                    style={{
                      clipPath: `polygon(${splitPos}% 0, 100% 0, 100% 100%, ${splitPos}% 100%)`,
                    }}
                  >
                    <canvas
                      ref={canvasRef}
                      className="max-h-[480px] max-w-full object-contain pointer-events-auto"
                      style={{ transform: `scale(${zoomLevel / 100})` }}
                      onClick={handleCanvasClick}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                    />
                  </div>

                  {/* Split Divider Bar */}
                  <div
                    onMouseDown={handleSplitMouseDown}
                    className="absolute top-0 bottom-0 w-1 bg-emerald-500 cursor-ew-resize z-20 shadow-lg"
                    style={{ left: `${splitPos}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900">
                      <SplitSquareVertical className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              )}

              {/* Result Only Mode */}
              {viewMode === 'result' && (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <canvas
                    ref={canvasRef}
                    className="max-h-[480px] max-w-full object-contain"
                    style={{ transform: `scale(${zoomLevel / 100})` }}
                    onClick={handleCanvasClick}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                  />
                </div>
              )}

              {/* Side-by-Side Mode */}
              {viewMode === 'side' && (
                <div className="grid grid-cols-2 gap-4 w-full h-full p-4 items-center">
                  <div className="text-center space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Original</span>
                    <img src={imageSrc || ''} alt="Original" className="max-h-[380px] max-w-full mx-auto object-contain rounded-lg shadow-sm border border-slate-200 dark:border-slate-800" />
                  </div>
                  <div className="text-center space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-500">Matte Result</span>
                    <canvas
                      ref={canvasRef}
                      className="max-h-[380px] max-w-full mx-auto object-contain rounded-lg shadow-sm border border-slate-200 dark:border-slate-800"
                      onClick={handleCanvasClick}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                    />
                  </div>
                </div>
              )}

              {/* Original Only */}
              {viewMode === 'original' && (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <img
                    src={imageSrc || ''}
                    alt="Original"
                    className="max-h-[480px] max-w-full object-contain"
                    style={{ transform: `scale(${zoomLevel / 100})` }}
                  />
                </div>
              )}
            </div>

            {/* Export & Actions Toolbar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  id="bg-copy-btn"
                  onClick={handleCopyClipboard}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  {copiedNotification ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copiedNotification ? t.imageCopied : t.copyImageClipboard}
                </button>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  id="bg-download-jpg-btn"
                  onClick={handleDownloadJpg}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition"
                >
                  <Download className="w-4 h-4" />
                  {t.downloadJpg}
                </button>

                <button
                  id="bg-download-png-btn"
                  onClick={handleDownloadPng}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 text-xs font-semibold shadow-sm transition"
                >
                  <Download className="w-4 h-4" />
                  {t.downloadPng}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
