import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import MobileSidebarSheet from './MobileSidebarSheet';

function ResponsiveSidebar() {
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    // Jest/jsdom may not implement matchMedia.
    const mqFactory = () => {
      if (typeof window === 'undefined') return null;
      if (typeof window.matchMedia !== 'function') return null;
      return window.matchMedia('(max-width: 1023px)');
    };

    const mq = mqFactory();

    if (!mq) {
      // Fallback: assume desktop for non-browser environments.
      setIsNarrow(false);
      return undefined;
    }

    const apply = () => setIsNarrow(mq.matches);
    apply();

    mq.addEventListener?.('change', apply);

    // Safari fallback
    if (!mq.addEventListener && mq.addListener) mq.addListener(apply);

    return () => {
      mq.removeEventListener?.('change', apply);
      if (!mq.removeEventListener && mq.removeListener) mq.removeListener(apply);
    };
  }, []);


  const [open, setOpen] = useState(false);

  // When switching from mobile->desktop, close sheet to avoid overlay lingering.
  useEffect(() => {
    if (!isNarrow) setOpen(false);
  }, [isNarrow]);

  // Desktop: render inline Sidebar.
  if (!isNarrow) {
    return (
      <aside className="min-h-0">
        <Sidebar />
      </aside>
    );
  }

  // Mobile: render a compact trigger + sheet.
  return (
    <>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-2xl border border-[#ded4c6] bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:bg-white"
          aria-label="Open catalog and designs"
        >
          ☰
        </button>
      </div>

      <MobileSidebarSheet open={open} onClose={() => setOpen(false)}>
        <Sidebar />
      </MobileSidebarSheet>
    </>
  );
}

export default ResponsiveSidebar;

