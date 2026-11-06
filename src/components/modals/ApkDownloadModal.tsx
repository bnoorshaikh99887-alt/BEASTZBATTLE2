import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Smartphone, Download, CheckCircle2, ShieldCheck, Zap, Sparkles } from 'lucide-react';

export const ApkDownloadModal: React.FC = () => {
  const { isApkModalOpen, setIsApkModalOpen, addToast } = useApp();
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  if (!isApkModalOpen) return null;

  const handleStartDownload = () => {
    setDownloading(true);
    setDownloadProgress(30);

    // Direct link to the real BEASTz-BATTLE.apk copied from repo
    const link = document.createElement('a');
    link.href = '/BEASTz-BATTLE.apk';
    link.download = 'BEASTz-BATTLE.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloadProgress(75);
    }, 400);

    setTimeout(() => {
      setDownloadProgress(100);
      setDownloading(false);
      addToast(
        'APK Download Started!',
        'BEASTz-BATTLE.apk (4.3 MB) is downloading. Tap the notification to install!',
        'success'
      );
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Download Android APK
              </h3>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                v2.4.0 • Lag-Free High Performance
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsApkModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="my-4 space-y-3.5">
          {/* Performance Features */}
          <div className="bg-slate-50 dark:bg-slate-900/80 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <span><strong>Zero-Lag 60FPS UI:</strong> Smooth animations with no frame drop</span>
            </div>
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
              <span><strong>Instant Room Code Alerts:</strong> Push alerts 15m before start</span>
            </div>
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span><strong>Google Play Protect Verified:</strong> 100% Safe & Secure</span>
            </div>
          </div>

          {/* Progress bar if downloading */}
          {downloading && (
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
                <span>Downloading BeastzBattle.apk...</span>
                <span>{downloadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Quick installation steps */}
          <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">How to Install:</span>
            <p>1. Tap the button below to download the official APK (18.4 MB).</p>
            <p>2. In your browser downloads, tap <strong>Install</strong> when prompted.</p>
            <p>3. If asked, toggle &quot;Allow installation from unknown sources&quot;.</p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleStartDownload}
          disabled={downloading}
          className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? `Downloading (${downloadProgress}%)...` : 'Download APK Now (4.3 MB)'}</span>
        </button>
      </div>
    </div>
  );
};
