import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { formatDimensionValue } from '../../utils/coordinates';

function DesignCard({ design, active, onOpen, onRename, onDuplicate, onDelete }) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftName, setDraftName] = useState(design.name);

  const startRename = () => {
    setDraftName(design.name);
    setIsRenaming(true);
  };

  const commitRename = () => {
    const nextName = draftName.trim();
    if (nextName) {
      onRename(nextName);
    }
    setIsRenaming(false);
  };

  return (
    <div
      className={`rounded-2xl border p-3 shadow-sm transition ${
        active ? 'border-[#5f7669] bg-white' : 'border-[#e3d8ca] bg-white/70 hover:bg-white'
      }`}
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <div className="flex items-start gap-3">
          <div
            className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f1e8] ring-1 ring-[#e3d8ca]"
            aria-hidden="true"
          >
            <RoomTypeGlyph roomType={design.roomType} />
          </div>

          <div className="min-w-0">
            {isRenaming ? (
              <input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename();
                  if (e.key === 'Escape') setIsRenaming(false);
                }}
                autoFocus
                className="w-full rounded-xl border border-[#ded4c6] bg-[#fffdf9] px-2 py-1 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:border-[#5f7669] focus:ring-2 focus:ring-[#5f7669]/20"
              />
            ) : (
              <div className="truncate text-sm font-semibold text-slate-900">{design.name}</div>
            )}

            <div className="mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              {design.roomType.replace('-', ' ')}
            </div>

            <div className="mt-2 text-xs text-slate-600">
              {formatDimensionValue(design.widthCm, 'cm')} x {formatDimensionValue(design.lengthCm, 'cm')} cm
            </div>
          </div>
        </div>

        {active ? (
          <span className="rounded-full bg-[#5f7669] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-white shadow-md shadow-[#5f7669]/20">
            Active
          </span>
        ) : (
          <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-slate-400 ring-1 ring-[#e3d8ca]">
            ↗
          </span>
        )}
      </button>

      {!isRenaming ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              startRename();
            }}
            className="rounded-xl border border-[#e3d8ca] bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#bfae96] hover:bg-[#fffdf9]"
          >
            Rename
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="rounded-xl border border-[#e3d8ca] bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#bfae96] hover:bg-[#fffdf9]"
          >
            Duplicate
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const ok = window.confirm('Delete this saved design?');
              if (ok) onDelete();
            }}
            className="rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-[#fffdf9]"
          >
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}

function RoomTypeGlyph({ roomType }) {
  // Simple flat glyphs (no photorealism).
  const glyph =
    roomType === 'bedroom'
      ? '🛏️'
      : roomType === 'living-room'
        ? '🛋️'
        : roomType === 'office'
          ? '💼'
          : roomType === 'kitchen'
            ? '🍳'
            : roomType === 'dining-room'
              ? '🍽️'
              : '📐';

  return <span className="text-lg" aria-hidden="true">{glyph}</span>;
}

DesignCard.propTypes = {
  design: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    roomType: PropTypes.string.isRequired,
    widthCm: PropTypes.number.isRequired,
    lengthCm: PropTypes.number.isRequired,
  }).isRequired,
  active: PropTypes.bool,
  onOpen: PropTypes.func.isRequired,
  onRename: PropTypes.func.isRequired,
  onDuplicate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

DesignCard.defaultProps = {
  active: false,
};

RoomTypeGlyph.propTypes = {
  roomType: PropTypes.string.isRequired,
};

export default DesignCard;

