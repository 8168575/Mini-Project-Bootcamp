import React from 'react';
import PropTypes from 'prop-types';

/**
 * Simple Tailwind-based sheet for mobile sidebar.
 * Keeps DOM stable while toggling visibility (no dnd-kit rerenders).
 */
function MobileSidebarSheet({ open, onClose, children }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/20 transition-opacity ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <aside
        className={`fixed left-0 top-0 z-[70] h-full w-[320px] max-w-[86vw] transform border-r border-white/70 bg-white/70 backdrop-blur transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Sidebar"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-white/70 px-4 py-4">
            <div className="text-sm font-semibold text-slate-900">Planner</div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-[#ded4c6] bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-[#fffdf9]"
            >
              Close
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>
        </div>
      </aside>
    </>
  );
}

MobileSidebarSheet.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default MobileSidebarSheet;

