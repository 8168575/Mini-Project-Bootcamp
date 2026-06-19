import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useDroppable } from '@dnd-kit/core';
import GridOverlay from './GridOverlay';
import FurnitureItem from './FurnitureItem';
import { useDesignStore } from '../../store/useDesignStore';
import { furnitureCatalog } from '../../data/furnitureCatalog';
import { cmToPx, formatDimensionValue, getScaleToFitRoom, pxToCm } from '../../utils/coordinates';
import {
  getRotationFromPointer,
  getRotationSnapStepDeg,
  resizeFurnitureFromHandle,
} from '../../utils/geometry';

const CATALOG_LOOKUP = furnitureCatalog.reduce((lookup, item) => {
  lookup[item.id] = item;
  return lookup;
}, {});

function RoomCanvas({ activeDragType }) {
  const activeDesign = useDesignStore((state) => state.activeDesign);
  const ui = useDesignStore((state) => state.ui);
  const setSelectedFurniture = useDesignStore((state) => state.setSelectedFurniture);
  const updatePlacedFurniture = useDesignStore((state) => state.updatePlacedFurniture);
  const viewportRef = useRef(null);
  const roomSurfaceRef = useRef(null);
  const viewportSize = useElementSize(viewportRef);
  const [interaction, setInteraction] = useState(null);
  const { isOver, setNodeRef } = useDroppable({
    id: 'room-canvas-dropzone',
    data: {
      type: 'room-canvas',
    },
  });

  const metrics = useMemo(() => {
    const paddingPx = 56;
    const pixelsPerCm = getScaleToFitRoom(
      activeDesign.widthCm,
      activeDesign.lengthCm,
      viewportSize.width,
      viewportSize.height,
      paddingPx
    );

    const roomWidthPx = Math.max(1, Math.round(activeDesign.widthCm * pixelsPerCm));
    const roomLengthPx = Math.max(1, Math.round(activeDesign.lengthCm * pixelsPerCm));

    return {
      pixelsPerCm,
      roomWidthPx,
      roomLengthPx,
      scaleLabel: pixelsPerCm > 0 ? `1 cm = ${pixelsPerCm.toFixed(2)} px` : 'Measuring canvas...',
    };
  }, [activeDesign.lengthCm, activeDesign.widthCm, viewportSize.height, viewportSize.width]);

  const isReady = viewportSize.width > 0 && viewportSize.height > 0 && metrics.pixelsPerCm > 0;
  const sortedFurniture = useMemo(
    () => [...activeDesign.furniture].sort((a, b) => a.zIndex - b.zIndex),
    [activeDesign.furniture]
  );
  const selectedItem = activeDesign.furniture.find(
    (item) => item.instanceId === ui.selectedFurnitureId
  );
  const previewItem =
    interaction && interaction.previewItem && interaction.instanceId === ui.selectedFurnitureId
      ? interaction.previewItem
      : selectedItem;

  useEffect(() => {
    if (!interaction) {
      return undefined;
    }

    const handlePointerMove = (event) => {
      if (!roomSurfaceRef.current || !metrics.pixelsPerCm) {
        return;
      }

      const pointer = getPointerInRoomCm(event, roomSurfaceRef.current, metrics.pixelsPerCm);

      if (interaction.type === 'resize') {
        const nextItem = resizeFurnitureFromHandle({
          item: interaction.startItem,
          handle: interaction.handle,
          pointer,
          preserveAspectRatio: event.shiftKey,
          roomWidthCm: activeDesign.widthCm,
          roomLengthCm: activeDesign.lengthCm,
        });

        setInteraction((current) =>
          current
            ? {
                ...current,
                previewItem: nextItem,
              }
            : current
        );
      }

      if (interaction.type === 'rotate') {
        const nextRotationDeg = getRotationFromPointer({
          item: interaction.startItem,
          pointer,
          snapStepDeg: getRotationSnapStepDeg({
            isShiftPressed: event.shiftKey,
            isAltPressed: event.altKey,
          }),
        });

        setInteraction((current) =>
          current
            ? {
                ...current,
                previewItem: {
                  ...interaction.startItem,
                  rotationDeg: nextRotationDeg,
                },
              }
            : current
        );
      }
    };

    const finishInteraction = () => {
      if (interaction.previewItem) {
        updatePlacedFurniture(interaction.instanceId, {
          x: interaction.previewItem.x,
          y: interaction.previewItem.y,
          widthCm: interaction.previewItem.widthCm,
          depthCm: interaction.previewItem.depthCm,
          rotationDeg: interaction.previewItem.rotationDeg,
        });
      }

      setInteraction(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', finishInteraction);
    window.addEventListener('pointercancel', finishInteraction);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', finishInteraction);
      window.removeEventListener('pointercancel', finishInteraction);
    };
  }, [
    activeDesign.lengthCm,
    activeDesign.widthCm,
    interaction,
    metrics.pixelsPerCm,
    updatePlacedFurniture,
  ]);

  const setRoomNode = (node) => {
    roomSurfaceRef.current = node;
    setNodeRef(node);
  };

  const handleCanvasPointerDown = (event) => {
    if (event.target === event.currentTarget) {
      setSelectedFurniture(null);
    }
  };

  const startResizeInteraction = (item, handle, event) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedFurniture(item.instanceId);
    setInteraction({
      type: 'resize',
      instanceId: item.instanceId,
      handle,
      startItem: item,
      previewItem: item,
    });
  };

  const startRotateInteraction = (item, event) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedFurniture(item.instanceId);
    setInteraction({
      type: 'rotate',
      instanceId: item.instanceId,
      startItem: item,
      previewItem: item,
    });
  };

  return (
    <section className="relative flex min-h-[620px] flex-1 flex-col overflow-hidden rounded-[2.25rem] border border-white/70 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.88)_0%,rgba(247,241,232,0.92)_46%,rgba(240,231,219,0.96)_100%)] shadow-[0_30px_80px_rgba(102,84,60,0.12)]">
      <div className="flex flex-col gap-3 border-b border-white/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-[#5f7669]">
            Floor plan canvas
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Scale-correct paper room
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {formatDimensionValue(activeDesign.widthCm, 'cm')} wide by{' '}
            {formatDimensionValue(activeDesign.lengthCm, 'cm')} long.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <CanvasBadge label="Scale" value={metrics.scaleLabel} />
          <CanvasBadge label="Grid" value={ui.showGrid ? 'Visible' : 'Hidden'} />
          <CanvasBadge label="Snap" value={ui.snapToGrid ? 'On' : 'Off'} />
          <CanvasBadge label="Mode" value={interaction?.type ?? activeDragType ?? 'idle'} />
        </div>
      </div>

      <div
        ref={viewportRef}
        className="relative flex flex-1 items-center justify-center overflow-hidden px-5 py-8 sm:px-8"
      >
        {isReady ? (
          <div
            ref={setRoomNode}
            className="relative"
            style={{
              width: `${metrics.roomWidthPx}px`,
              height: `${metrics.roomLengthPx}px`,
            }}
          >
            <div
              className={`absolute inset-0 rounded-[2rem] bg-[#fffdf8] shadow-[0_22px_50px_rgba(102,84,60,0.16)] ring-1 transition ${
                isOver ? 'ring-[#5f7669] shadow-[0_28px_65px_rgba(95,118,105,0.22)]' : 'ring-[#d8cbbd]'
              }`}
            >
              <GridOverlay
                visible={ui.showGrid}
                gridSizeCm={ui.gridSizeCm}
                pixelsPerCm={metrics.pixelsPerCm}
              />
            </div>

            <div
              className="absolute inset-0 overflow-hidden rounded-[2rem]"
              onPointerDown={handleCanvasPointerDown}
            >
              {sortedFurniture.map((item) => {
                const catalogItem = CATALOG_LOOKUP[item.catalogId];

                if (!catalogItem) {
                  return null;
                }

                const renderedItem =
                  interaction?.instanceId === item.instanceId && interaction.previewItem
                    ? interaction.previewItem
                    : item;

                return (
                  <FurnitureItem
                    key={item.instanceId}
                    item={renderedItem}
                    catalogItem={catalogItem}
                    pixelsPerCm={metrics.pixelsPerCm}
                    selected={ui.selectedFurnitureId === item.instanceId}
                    onSelect={() => setSelectedFurniture(item.instanceId)}
                    onResizePointerDown={(handle, event) =>
                      startResizeInteraction(renderedItem, handle, event)
                    }
                    onRotatePointerDown={(event) => startRotateInteraction(renderedItem, event)}
                  />
                );
              })}

              {previewItem ? <SelectionReadout item={previewItem} pixelsPerCm={metrics.pixelsPerCm} interactionType={interaction?.type} /> : null}

              {activeDesign.furniture.length === 0 ? (
                <div className="flex h-full items-center justify-center px-8 text-center">
                  <div className="max-w-md space-y-4">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-[#5f7669]">
                      Empty floor plan
                    </p>
                    <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
                      Drag catalog pieces into the room.
                    </h3>
                    <p className="text-sm leading-6 text-slate-600">
                      The drop point is converted from screen pixels back into room centimeters,
                      then clamped inside the room bounds.
                    </p>
                    <div className="rounded-2xl bg-[#f6efe6] px-4 py-3 text-xs font-medium uppercase tracking-[0.28em] text-slate-500 shadow-inner shadow-white/70">
                      Origin: top-left corner of the room
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="pointer-events-none absolute inset-[10px] rounded-[1.75rem] border border-dashed border-[#d7c8b7]" />
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-[#cfbda9] bg-white/75 px-6 py-5 text-sm text-slate-500 shadow-sm">
            Measuring canvas...
          </div>
        )}
      </div>
    </section>
  );
}

function SelectionReadout({ item, pixelsPerCm, interactionType }) {
  return (
    <div
      className="pointer-events-none absolute rounded-2xl bg-[#24322d] px-3 py-2 text-xs font-semibold text-white shadow-[0_18px_30px_rgba(26,34,31,0.22)]"
      style={{
        left: `${cmToPx(item.x + item.widthCm / 2, pixelsPerCm)}px`,
        top: `${Math.max(0, cmToPx(item.y, pixelsPerCm) - 46)}px`,
        transform: 'translateX(-50%)',
      }}
    >
      {interactionType === 'rotate'
        ? `${Math.round(item.rotationDeg)} deg`
        : `${Math.round(item.widthCm)} x ${Math.round(item.depthCm)} cm`}
    </div>
  );
}

function CanvasBadge({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#f7f1e8] px-4 py-3 shadow-inner shadow-white/60 ring-1 ring-[#e3d8ca]">
      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.35em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

CanvasBadge.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

SelectionReadout.propTypes = {
  item: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    widthCm: PropTypes.number.isRequired,
    depthCm: PropTypes.number.isRequired,
    rotationDeg: PropTypes.number.isRequired,
  }).isRequired,
  pixelsPerCm: PropTypes.number.isRequired,
  interactionType: PropTypes.string,
};

SelectionReadout.defaultProps = {
  interactionType: null,
};

function getPointerInRoomCm(event, roomElement, pixelsPerCm) {
  const rect = roomElement.getBoundingClientRect();

  return {
    x: pxToCm(event.clientX - rect.left, pixelsPerCm),
    y: pxToCm(event.clientY - rect.top, pixelsPerCm),
  };
}

function useElementSize(ref) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return undefined;
    }

    const measure = () => {
      const nextWidth = element.clientWidth;
      const nextHeight = element.clientHeight;

      setSize((current) =>
        current.width === nextWidth && current.height === nextHeight
          ? current
          : { width: nextWidth, height: nextHeight }
      );
    };

    measure();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => {
        measure();
      });

      observer.observe(element);

      return () => observer.disconnect();
    }

    window.addEventListener('resize', measure);

    return () => {
      window.removeEventListener('resize', measure);
    };
  }, [ref]);

  return size;
}

RoomCanvas.propTypes = {
  activeDragType: PropTypes.string,
};

RoomCanvas.defaultProps = {
  activeDragType: null,
};

export default RoomCanvas;
