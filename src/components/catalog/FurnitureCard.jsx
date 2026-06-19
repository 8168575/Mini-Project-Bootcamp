import PropTypes from 'prop-types';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { formatDimensionValue } from '../../utils/coordinates';

function FurnitureCard({ item }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `catalog-${item.id}`,
    data: {
      type: 'catalog-furniture',
      catalogId: item.id,
    },
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...listeners}
      {...attributes}
      className={`group flex w-full items-start gap-4 rounded-[1.5rem] border border-[#e2d7c8] bg-white/92 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#c7b59e] hover:shadow-md ${
        isDragging ? 'opacity-40' : ''
      }`}
      style={{
        transform: CSS.Translate.toString(transform),
      }}
    >
      <div
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#f7f1e8] ring-1 ring-[#e0d4c5]"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: item.icon }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">{item.name}</p>
            <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.25em] text-slate-400">
              {item.category}
            </p>
          </div>
          <span
            className="mt-1 h-3 w-3 rounded-full ring-2 ring-white"
            style={{ backgroundColor: item.color }}
          />
        </div>

        <p className="mt-3 text-xs text-slate-500">
          {formatDimensionValue(item.defaultWidthCm, 'cm')} x{' '}
          {formatDimensionValue(item.defaultDepthCm, 'cm')}
        </p>
      </div>
    </button>
  );
}

FurnitureCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    defaultWidthCm: PropTypes.number.isRequired,
    defaultDepthCm: PropTypes.number.isRequired,
    icon: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
  }).isRequired,
};

export default FurnitureCard;
