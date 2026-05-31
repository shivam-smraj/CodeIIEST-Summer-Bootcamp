'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { ArrowLeft, Download, ExternalLink, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function PDFViewerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const file = searchParams.get('file');
  const title = searchParams.get('title') ?? 'Document Viewer';

  const [existState, setExistState] = useState<'loading' | 'exists' | 'missing'>('loading');

  useEffect(() => {
    if (!file) {
      setExistState('missing');
      return;
    }

    setExistState('loading');
    
    // Perform a HEAD request to check if the file is physically present in the public folder
    fetch(file, { method: 'HEAD' })
      .then((res) => {
        if (res.ok) {
          setExistState('exists');
        } else {
          setExistState('missing');
        }
      })
      .catch(() => {
        // Fallback to GET check in case server blocks HEAD requests
        fetch(file)
          .then((res) => {
            if (res.ok) {
              setExistState('exists');
            } else {
              setExistState('missing');
            }
          })
          .catch(() => {
            setExistState('missing');
          });
      });
  }, [file]);

  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#070b14] text-white p-4">
        <AlertCircle size={48} className="text-red-500 mb-4 animate-bounce" />
        <h2 className="text-xl font-bold mb-2">No Document Specified</h2>
        <p className="text-slate-400 text-sm mb-6 text-center max-w-sm">
          Please select a valid session resource to view from the sessions portal.
        </p>
        <button
          onClick={() => router.push('/sessions')}
          className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 active:scale-95 text-sm font-semibold rounded-xl transition-all flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Back to Sessions
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-[#060814] text-white overflow-hidden font-sans">
      {/* Premium Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 h-16 border-b border-white/5 bg-[#090e1d]/90 backdrop-blur-md z-20 shadow-md">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => router.push('/sessions')}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-slate-300 hover:text-white"
            title="Back to Sessions"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-[150px] sm:max-w-md md:max-w-lg" title={title}>
              {title}
            </h1>
            <p className="text-[9px] text-violet-400 font-bold tracking-wider uppercase">
              Bootcamp Study Hub
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {existState === 'exists' && (
            <>
              {/* External Link */}
              <a
                href={file}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
              >
                <ExternalLink size={14} />
                <span className="hidden sm:inline">Open in New Tab</span>
              </a>

              {/* Download Action */}
              <a
                href={file}
                download
                className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-md shadow-violet-900/20"
              >
                <Download size={14} />
                <span className="hidden sm:inline">Download</span>
              </a>
            </>
          )}
        </div>
      </header>

      {/* Main Viewport Container */}
      <main className="flex-1 w-full h-[calc(100vh-64px)] relative bg-[#070913] flex justify-center overflow-hidden">
        {existState === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070913]">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-violet-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 animate-spin" />
            </div>
            <p className="text-slate-400 text-xs mt-4 animate-pulse">Loading study resource...</p>
          </div>
        )}

        {existState === 'missing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#070913]">
            <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-5 animate-pulse">
              <Clock size={32} />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mb-2 tracking-tight">Coming Soon!</h2>
            <p className="text-slate-400 text-sm max-w-md mb-6 leading-relaxed">
              Our mentors are currently fine-tuning this resource. It will be posted here dynamically shortly before the session starts.
            </p>
            <button
              onClick={() => router.push('/sessions')}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
            >
              Back to Sessions
            </button>
          </div>
        )}

        {existState === 'exists' && (
          <iframe
            src={`${file}#toolbar=1&navpanes=0`}
            className="w-full h-full border-0 absolute inset-0"
            title={title}
          />
        )}
      </main>
    </div>
  );
}

export default function PDFViewerPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#060814] text-white">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-4 border-violet-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 animate-spin" />
        </div>
      </div>
    }>
      <PDFViewerContent />
    </Suspense>
  );
}
