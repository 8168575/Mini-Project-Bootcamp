import PropTypes from 'prop-types';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { cmToPx } from '../../utils/coordinates';
import ResizeHandles from './ResizeHandles';
import RotateHandle from './RotateHandle';

function FurnitureItem({
  item,
  catalogItem,
  pixelsPerCm,
  selected,
  onSelect,
  onResizePointerDown,
  onRotatePointerDown,
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `placed-${item.instanceId}`,
    data: {
      type: 'placed-furniture',
      instanceId: item.instanceId,
      startX: item.x,
      startY: item.y,
      widthCm: item.widthCm,
      depthCm: item.depthCm,
      pixelsPerCm,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className="absolute overflow-visible"
      style={{
        left: `${cmToPx(item.x, pixelsPerCm)}px`,
        top: `${cmToPx(item.y, pixelsPerCm)}px`,
        width: `${cmToPx(item.widthCm, pixelsPerCm)}px`,
        height: `${cmToPx(item.depthCm, pixelsPerCm)}px`,
        zIndex: isDragging ? item.zIndex + 100 : item.zIndex,
        transform: `${CSS.Translate.toString(transform)} rotate(${item.rotationDeg}deg)`,
        transformOrigin: 'center center',
        opacity: isDragging ? 0.82 : 1,
      }}
      onPointerDown={onSelect}
    >
      <button
        type="button"
        className={`absolute inset-0 overflow-hidden rounded-[1.2rem] border bg-transparent text-left shadow-[0_16px_30px_rgba(35,29,24,0.14)] ring-1 ring-black/5 transition ${
          selected ? 'border-[#5f7669] shadow-[0_20px_38px_rgba(95,118,105,0.24)]' : 'border-white/80'
        }`}
        {...listeners}
        {...attributes}
      >
        <div className="absolute inset-0" style={{ backgroundColor: catalogItem.color }} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0.08)_100%)]" />
        <div className="absolute inset-0 rounded-[inherit] ring-1 ring-white/30" />
        <div
          className="absolute inset-2 flex items-center justify-center rounded-[0.9rem] bg-white/16"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: catalogItem.icon }}
        />
        <div className="absolute inset-x-2 bottom-2 rounded-xl bg-white/78 px-2 py-1 text-[11px] font-semibold text-slate-800 shadow-sm backdrop-blur">
          <p className="truncate">{catalogItem.name}</p>
        </div>
      </button>

      {selected ? (
        <div className="pointer-events-none absolute inset-0 rounded-[1.2rem] border-2 border-dashed border-[#5f7669]">
          <div className="pointer-events-auto">
            <ResizeHandles onPointerDown={onResizePointerDown} />
            <RotateHandle onPointerDown={onRotatePointerDown} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

FurnitureItem.propTypes = {
  item: PropTypes.shape({
    instanceId: PropTypes.string.isRequired,
    catalogId: PropTypes.string.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    widthCm: PropTypes.number.isRequired,
    depthCm: PropTypes.number.isRequired,
    rotationDeg: PropTypes.number.isRequired,
    zIndex: PropTypes.number.isRequired,
  }).isRequired,
  catalogItem: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
  }).isRequired,
  pixelsPerCm: PropTypes.number.isRequired,
  selected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onResizePointerDown: PropTypes.func.isRequired,
  onRotatePointerDown: PropTypes.func.isRequired,
};

export default FurnitureItem;
