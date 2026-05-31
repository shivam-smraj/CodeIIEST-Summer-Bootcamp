'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { ArrowLeft, Download, ExternalLink } from 'lucide-react';
import Link from 'next/link';

function PDFViewerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const file = searchParams.get('file');
  const title = searchParams.get('title') ?? 'Document Viewer';

  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#090d16] text-white p-4">
        <h2 className="text-xl font-bold mb-4">No PDF file specified</h2>
        <button
          onClick={() => router.push('/sessions')}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Back to Sessions
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-[#090d16] text-white overflow-hidden">
      {/* Premium Header */}
      <header className="flex items-center justify-between px-6 h-16 border-b border-white/5 bg-[#0b1329]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => router.push('/sessions')}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-slate-300 hover:text-white"
            title="Back to Sessions"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md md:max-w-lg">
              {title}
            </h1>
            <p className="text-[10px] text-violet-400 font-semibold tracking-wider uppercase">
              Bootcamp Study Hub
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
        </div>
      </header>

      {/* Embedded Viewport */}
      <main className="flex-1 w-full h-full relative bg-[#060813]">
        <iframe
          src={`${file}#toolbar=1&navpanes=0`}
          className="w-full h-full border-0 absolute inset-0"
          title={title}
        />
      </main>
    </div>
  );
}

export default function PDFViewerPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#090d16] text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
      </div>
    }>
      <PDFViewerContent />
    </Suspense>
  );
}
