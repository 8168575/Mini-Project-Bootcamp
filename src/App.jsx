import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import RoomCanvas from './components/canvas/RoomCanvas';
import ResponsiveSidebar from './components/layout/ResponsiveSidebar';

import SectionCard from './components/ui/SectionCard';
import Toolbar from './components/layout/Toolbar';
import { furnitureCatalog } from './data/furnitureCatalog';
import { ROOM_TYPE_OPTIONS, useDesignStore } from './store/useDesignStore';
import { clampPositionToRoom, cmToPx, formatDimensionValue, pxToCm, snapPointToGrid } from './utils/coordinates';
import { createSnapToGridModifier } from './utils/dndModifiers';

const CATALOG_LOOKUP = furnitureCatalog.reduce((lookup, item) => {
  lookup[item.id] = item;
  return lookup;
}, {});

function App() {
  const activeDesign = useDesignStore((state) => state.activeDesign);
  const ui = useDesignStore((state) => state.ui);
  const addPlacedFurniture = useDesignStore((state) => state.addPlacedFurniture);
  const updatePlacedFurniture = useDesignStore((state) => state.updatePlacedFurniture);
  const setSelectedFurniture = useDesignStore((state) => state.setSelectedFurniture);
  const bringFurnitureToFront = useDesignStore((state) => state.bringFurnitureToFront);
  const sendFurnitureToBack = useDesignStore((state) => state.sendFurnitureToBack);
  const [activeDrag, setActiveDrag] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const measurementUnit = ui.measurementUnit;

  const roomTypeLabel =
    ROOM_TYPE_OPTIONS.find((option) => option.value === activeDesign.roomType)?.label ??
    'Custom';
  const activeCatalogItem =
    activeDrag?.type === 'catalog-furniture' ? CATALOG_LOOKUP[activeDrag.catalogId] : null;
  const placedCount = activeDesign.furniture.length;
  const selectedItem = activeDesign.furniture.find(
    (item) => item.instanceId === ui.selectedFurnitureId
  );

  const collisionDetection = useMemo(
    () => (args) => {
      const pointerHits = pointerWithin(args);

      return pointerHits.length > 0 ? pointerHits : rectIntersection(args);
    },
    []
  );

  const modifiers = useMemo(() => {
    if (activeDrag?.type === 'catalog-furniture') {
      return [snapCenterToCursor];
    }

    if (activeDrag?.type === 'placed-furniture') {
      const gridSizePx = cmToPx(ui.gridSizeCm, activeDrag.pixelsPerCm);
      const snapModifier = createSnapToGridModifier(gridSizePx, ui.snapToGrid);

      return snapModifier ? [snapModifier] : [];
    }

    return [];
  }, [activeDrag, ui.gridSizeCm, ui.snapToGrid]);

  const handleDragStart = (event) => {
    const currentData = event.active.data.current;

    if (currentData?.type === 'catalog-furniture' && typeof currentData.catalogId === 'string') {
      setActiveDrag({
        type: 'catalog-furniture',
        catalogId: currentData.catalogId,
      });
      return;
    }

    if (
      currentData?.type === 'placed-furniture' &&
      typeof currentData.instanceId === 'string' &&
      Number.isFinite(currentData.pixelsPerCm)
    ) {
      setSelectedFurniture(currentData.instanceId);
      setActiveDrag({
        type: 'placed-furniture',
        instanceId: currentData.instanceId,
        startX: currentData.startX,
        startY: currentData.startY,
        widthCm: currentData.widthCm,
        depthCm: currentData.depthCm,
        pixelsPerCm: currentData.pixelsPerCm,
      });
    }
  };

  const handleDragCancel = () => {
    setActiveDrag(null);
  };

  const handleDragEnd = (event) => {
    const { active, over, delta } = event;

    if (activeDrag?.type === 'catalog-furniture') {
      const catalogId = active.data.current?.catalogId;

      if (over?.id === 'room-canvas-dropzone' && typeof catalogId === 'string') {
        const catalogItem = CATALOG_LOOKUP[catalogId];
        const translatedRect = active.rect.current.translated ?? active.rect.current.initial;
        const roomRect = over.rect;

        if (catalogItem && translatedRect && roomRect && activeDesign.widthCm > 0) {
          const pixelsPerCm = roomRect.width / activeDesign.widthCm;
          const dropCenterX = translatedRect.left + translatedRect.width / 2;
          const dropCenterY = translatedRect.top + translatedRect.height / 2;
          const rawXcm =
            pxToCm(dropCenterX - roomRect.left, pixelsPerCm) - catalogItem.defaultWidthCm / 2;
          const rawYcm =
            pxToCm(dropCenterY - roomRect.top, pixelsPerCm) - catalogItem.defaultDepthCm / 2;
          const snappedPoint = snapPointToGrid(rawXcm, rawYcm, ui.gridSizeCm, ui.snapToGrid);
          const clampedPoint = clampPositionToRoom(
            snappedPoint.x,
            snappedPoint.y,
            catalogItem.defaultWidthCm,
            catalogItem.defaultDepthCm,
            activeDesign.widthCm,
            activeDesign.lengthCm
          );

          addPlacedFurniture({
            catalogId,
            xCm: clampedPoint.x,
            yCm: clampedPoint.y,
          });
        }
      }

      setActiveDrag(null);
      return;
    }

    if (activeDrag?.type === 'placed-furniture') {
      const rawXcm = activeDrag.startX + pxToCm(delta.x, activeDrag.pixelsPerCm);
      const rawYcm = activeDrag.startY + pxToCm(delta.y, activeDrag.pixelsPerCm);
      const snappedPoint = snapPointToGrid(rawXcm, rawYcm, ui.gridSizeCm, ui.snapToGrid);
      const clampedPoint = clampPositionToRoom(
        snappedPoint.x,
        snappedPoint.y,
        activeDrag.widthCm,
        activeDrag.depthCm,
        activeDesign.widthCm,
        activeDesign.lengthCm
      );

      updatePlacedFurniture(activeDrag.instanceId, {
        x: clampedPoint.x,
        y: clampedPoint.y,
      });
      setSelectedFurniture(activeDrag.instanceId);
    }

    setActiveDrag(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      modifiers={modifiers}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-[linear-gradient(180deg,#f7f0e7_0%,#efe4d7_100%)] text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/60 px-5 py-5 shadow-[0_24px_60px_rgba(102,84,60,0.10)] backdrop-blur md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-[#5f7669]">
                Home Interior Layout Planner
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                Draft the room before you move a single piece.
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
                Step 3 adds direct manipulation. Placed items can now be selected, moved, resized,
                rotated, and reordered without leaving the canvas.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-[#f6efe6] px-4 py-3 shadow-inner shadow-white/60">
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-500">
                  Active room
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{roomTypeLabel}</p>
              </div>
              <div className="rounded-2xl bg-[#f6efe6] px-4 py-3 shadow-inner shadow-white/60">
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-500">Size</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {formatDimensionValue(activeDesign.widthCm, measurementUnit)} x{' '}
                  {formatDimensionValue(activeDesign.lengthCm, measurementUnit)}
                </p>
              </div>
              <div className="rounded-2xl bg-[#f6efe6] px-4 py-3 shadow-inner shadow-white/60">
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-500">
                  Placed pieces
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{placedCount}</p>
              </div>
              <div className="rounded-2xl bg-[#f6efe6] px-4 py-3 shadow-inner shadow-white/60">
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-500">
                  Selected
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {selectedItem ? CATALOG_LOOKUP[selectedItem.catalogId]?.name ?? '1 item' : 'None'}
                </p>
              </div>
            </div>
          </header>

          <Toolbar />

          <main className="grid flex-1 gap-5 xl:grid-cols-[340px_minmax(0,1fr)_320px]">
            <ResponsiveSidebar />
            <RoomCanvas activeDragType={activeDrag?.type ?? null} />


            <aside className="space-y-5">

              <SectionCard
                eyebrow="Step 3"
                title="Direct manipulation"
                description="Move uses DnD Kit. Resize and rotate use pointer math on the same centimeter-based geometry."
              >
                <div className="space-y-3 text-sm leading-6 text-slate-600">
                  <p>• Dragging a placed item snaps to the room grid through a custom modifier.</p>
                  <p>• Corner handles resize with live dimension readouts.</p>
                  <p>• The rotate handle snaps to 15 degrees unless Shift or Alt is held.</p>
                </div>
              </SectionCard>

              <SectionCard
                eyebrow="Selection"
                title={selectedItem ? CATALOG_LOOKUP[selectedItem.catalogId]?.name ?? 'Selected item' : 'No item selected'}
                description={
                  selectedItem
                    ? `${Math.round(selectedItem.widthCm)} x ${Math.round(selectedItem.depthCm)} cm at ${Math.round(selectedItem.rotationDeg)} deg`
                    : 'Click a furniture piece on the canvas to edit it.'
                }
              >
                {selectedItem ? (
                  <div className="space-y-3 text-sm leading-6 text-slate-600">
                    <button
                      type="button"
                      onClick={() => bringFurnitureToFront(selectedItem.instanceId)}
                      className="w-full rounded-2xl bg-[#5f7669] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_26px_rgba(95,118,105,0.22)] transition hover:bg-[#53695d]"
                    >
                      Bring to front
                    </button>
                    <button
                      type="button"
                      onClick={() => sendFurnitureToBack(selectedItem.instanceId)}
                      className="w-full rounded-2xl border border-[#d7c8b7] bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#bca88f]"
                    >
                      Send to back
                    </button>
                  </div>
                ) : (
                  <p className="text-sm leading-6 text-slate-500">
                    Selection also controls which item gets resize handles and rotate controls.
                  </p>
                )}
              </SectionCard>
            </aside>
          </main>
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeCatalogItem ? <CatalogDragPreview item={activeCatalogItem} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function CatalogDragPreview({ item }) {
  return (
    <div className="flex w-[280px] items-start gap-4 rounded-[1.5rem] border border-[#d9cdbc] bg-white/96 p-4 shadow-[0_24px_60px_rgba(37,31,26,0.18)]">
      <div
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#f7f1e8] ring-1 ring-[#e0d4c5]"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: item.icon }}
      />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{item.name}</p>
        <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.25em] text-slate-400">
          {item.category}
        </p>
        <p className="mt-3 text-xs text-slate-500">
          {formatDimensionValue(item.defaultWidthCm, 'cm')} x{' '}
          {formatDimensionValue(item.defaultDepthCm, 'cm')}
        </p>
      </div>
    </div>
  );
}

CatalogDragPreview.propTypes = {
  item: PropTypes.shape({
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    defaultWidthCm: PropTypes.number.isRequired,
    defaultDepthCm: PropTypes.number.isRequired,
  }).isRequired,
};

export default App;
