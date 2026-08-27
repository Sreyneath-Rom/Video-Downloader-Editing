import React from 'react';
import { Language } from '../types';
import { getMirrorDownloadLinks, triggerFileDownload } from '../utils/mediaDownloader';
import {
  Download,
  ExternalLink,
  HelpCircle,
  X,
  Sparkles,
  Server,
  FileCheck,
  Globe,
  Radio,
} from 'lucide-react';

interface DownloadAssistModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  mediaUrl: string;
  mediaTitle: string;
  format?: string;
  quality?: string;
}

export const DownloadAssistModal: React.FC<DownloadAssistModalProps> = ({
  isOpen,
  onClose,
  lang,
  mediaUrl,
  mediaTitle,
  format = 'mp4',
  quality = '1080p',
}) => {
  if (!isOpen) return null;

  const mirrorLinks = getMirrorDownloadLinks(mediaUrl || 'https://youtube.com');
  const serverDownloadUrl = `/api/media/download?title=${encodeURIComponent(
    mediaTitle || 'Media_File'
  )}&format=${format}&quality=${quality}`;

  const handleInstantClientDownload = () => {
    const filename = `${(mediaTitle || 'Media_File').replace(/[^a-zA-Z0-9_\-\u1780-\u17FF]/g, '_')}.${format}`;
    triggerFileDownload(filename, undefined, format);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="download-assist-modal"
        className="w-full max-w-2xl neu-card p-6 sm:p-7 space-y-6 bg-[#e6edf5] max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-300 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl neu-card-sm text-emerald-600 bg-[#e6edf5]">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {lang === 'km' ? 'ជម្រើសទាញយក និងជំនួយការទាញយក' : 'Download Options & Fast Stream Mirrors'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {lang === 'km'
                  ? 'ជ្រើសរើសវិធីសាស្ត្រទាញយកដែលសមស្របបំផុតសម្រាប់ឧបករណ៍របស់អ្នក'
                  : 'Choose the most reliable download method for your browser'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl neu-btn text-slate-500 hover:text-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Download Methods */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            {lang === 'km' ? 'វិធីសាស្ត្រទាញយកដោយផ្ទាល់' : 'Direct Download Methods'}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Server Endpoint Download */}
            <a
              href={serverDownloadUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="p-4 rounded-2xl neu-btn text-left flex items-start gap-3.5 border border-emerald-500/30 hover:border-emerald-600 transition group"
            >
              <div className="p-2.5 rounded-xl neu-card-sm text-emerald-600 group-hover:scale-110 transition shrink-0">
                <Server className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>{lang === 'km' ? 'ទាញយកតាម Server Direct' : 'Direct Server Stream'}</span>
                  <span className="px-1.5 py-0.5 text-[9px] bg-emerald-100 text-emerald-700 rounded-md font-extrabold">
                    Recommended
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                  {lang === 'km'
                    ? 'បញ្ជូនឯកសារផ្ទាល់តាមរយៈ HTTP Attachment គ្មានបញ្ហា Iframe'
                    : 'Downloads directly with HTTP attachment header (Bypasses iframe sandboxes)'}
                </div>
              </div>
            </a>

            {/* Instant Browser Media Generator */}
            <button
              type="button"
              onClick={handleInstantClientDownload}
              className="p-4 rounded-2xl neu-btn text-left flex items-start gap-3.5 border border-blue-500/30 hover:border-blue-600 transition group"
            >
              <div className="p-2.5 rounded-xl neu-card-sm text-blue-600 group-hover:scale-110 transition shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>{lang === 'km' ? 'ទាញយកភ្លាមៗតាម Browser' : 'Instant Browser Save'}</span>
                  <span className="px-1.5 py-0.5 text-[9px] bg-blue-100 text-blue-700 rounded-md font-bold">
                    Fast Blob
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                  {lang === 'km'
                    ? 'បង្កើត និងរក្សាទុកឯកសារ Media ដោយផ្ទាល់លើ Browser'
                    : 'Generates and saves playable media file directly via Web APIs'}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Online High-Speed Mirror Portals */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-purple-600" />
            {lang === 'km' ? 'ម៉ាស៊ីនទាញយកអនឡាញបន្ថែម (Mirrors)' : 'Online Web Extractors & Mirrors'}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {mirrorLinks.map((mirror, idx) => (
              <a
                key={idx}
                href={mirror.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl neu-btn flex items-center justify-between gap-3 text-left hover:text-purple-700 transition"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span className="truncate">{mirror.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">{mirror.description}</div>
                </div>
                <div className="flex items-center gap-1 text-slate-400 shrink-0">
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
                    {mirror.badge}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Troubleshooting Notice */}
        <div className="p-3.5 rounded-2xl neu-inset text-xs space-y-1.5 border border-slate-300/50">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>{lang === 'km' ? 'ចំណាំសម្រាប់ការទាញយកក្នុង Preview:' : 'Browser / Preview Download Note:'}</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {lang === 'km'
              ? 'ប្រសិនបើកម្មវិធីកំពុងដំណើរការក្នុង Iframe Preview ហើយ Browser រារាំងការទាញយក សូមចុចលើ "Direct Server Stream" ឬបើក App ក្នុងផ្ទាំងថ្មី (Open in New Tab) ដើម្បីទាញយកដោយរលូន 100%។'
              : 'If running inside an AI Studio preview iframe, browser sandboxes may intercept automatic downloads. Click "Direct Server Stream" above or open the app in a new tab for uninhibited full-speed downloads.'}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 neu-btn text-xs font-bold text-slate-700 hover:text-slate-900"
          >
            {lang === 'km' ? 'បិទ' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
