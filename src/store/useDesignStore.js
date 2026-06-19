import { create } from 'zustand';
import { draftPersistence } from './designPersistence';
import { savedDesignsPersistence } from './savedDesignsPersistence';
import { furnitureCatalog } from '../data/furnitureCatalog';
import { clamp, clampPositionToRoom, snapPointToGrid } from '../utils/coordinates';
import { clampFurnitureToRoom, normalizeRotationDeg } from '../utils/geometry';


/**
 * @typedef {'bedroom'|'living-room'|'office'|'kitchen'|'dining-room'|'custom'} RoomType
 */

/**
 * @typedef {'seating'|'tables'|'storage'|'bed'|'office'|'decor'} FurnitureCategory
 */

/**
 * @typedef {Object} PlacedFurniture
 * @property {string} instanceId
 * @property {string} catalogId
 * @property {number} x
 * @property {number} y
 * @property {number} widthCm
 * @property {number} depthCm
 * @property {number} rotationDeg
 * @property {number} zIndex
 */

/**
 * @typedef {Object} RoomDesign
 * @property {string} id
 * @property {string} name
 * @property {RoomType} roomType
 * @property {number} widthCm
 * @property {number} lengthCm
 * @property {PlacedFurniture[]} furniture
 * @property {string} updatedAt
 */

export const ROOM_TYPE_OPTIONS = [
  { value: 'bedroom', label: 'Bedroom', defaultWidthCm: 420, defaultLengthCm: 360 },
  { value: 'living-room', label: 'Living Room', defaultWidthCm: 520, defaultLengthCm: 420 },
  { value: 'office', label: 'Office', defaultWidthCm: 360, defaultLengthCm: 300 },
  { value: 'kitchen', label: 'Kitchen', defaultWidthCm: 420, defaultLengthCm: 360 },
  { value: 'dining-room', label: 'Dining Room', defaultWidthCm: 420, defaultLengthCm: 420 },
  { value: 'custom', label: 'Custom', defaultWidthCm: 420, defaultLengthCm: 360 },
];

export const ROOM_TYPE_LOOKUP = ROOM_TYPE_OPTIONS.reduce((lookup, option) => {
  lookup[option.value] = option;
  return lookup;
}, {});

const ROOM_SIZE_LIMITS = {
  minWidthCm: 240,
  maxWidthCm: 1200,
  minLengthCm: 240,
  maxLengthCm: 1200,
};

function toFiniteNumber(value, fallback) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : fallback;
}

const DEFAULT_UI_STATE = {
  measurementUnit: 'cm',
  showGrid: true,
  snapToGrid: true,
  gridSizeCm: 10,
  catalogSearch: '',
  activeCatalogCategory: 'all',
  selectedFurnitureId: null,
};

const CATALOG_LOOKUP = furnitureCatalog.reduce((lookup, item) => {
  lookup[item.id] = item;
  return lookup;
}, {});

function createDesign(roomType = 'bedroom') {
  const preset = ROOM_TYPE_LOOKUP[roomType] ?? ROOM_TYPE_LOOKUP.bedroom;
  const now = new Date().toISOString();

  return {
    id: 'draft-room',
    name: 'Untitled layout',
    roomType: preset.value,
    widthCm: preset.defaultWidthCm,
    lengthCm: preset.defaultLengthCm,
    furniture: [],
    updatedAt: now,
  };
}

function hydrateDesign(candidate) {
  if (!candidate || typeof candidate !== 'object') {
    return createDesign();
  }

  const roomType = ROOM_TYPE_LOOKUP[candidate.roomType] ? candidate.roomType : 'custom';
  const preset = ROOM_TYPE_LOOKUP[roomType];
  const widthCm = Number(candidate.widthCm);
  const lengthCm = Number(candidate.lengthCm);

  return {
    id: typeof candidate.id === 'string' && candidate.id ? candidate.id : 'draft-room',
    name: typeof candidate.name === 'string' && candidate.name ? candidate.name : 'Untitled layout',
    roomType,
    widthCm: Number.isFinite(widthCm)
      ? clamp(Math.round(widthCm), ROOM_SIZE_LIMITS.minWidthCm, ROOM_SIZE_LIMITS.maxWidthCm)
      : preset.defaultWidthCm,
    lengthCm: Number.isFinite(lengthCm)
      ? clamp(Math.round(lengthCm), ROOM_SIZE_LIMITS.minLengthCm, ROOM_SIZE_LIMITS.maxLengthCm)
      : preset.defaultLengthCm,
    furniture: Array.isArray(candidate.furniture)
      ? candidate.furniture.map(hydratePlacedFurniture).filter(Boolean)
      : [],
    updatedAt:
      typeof candidate.updatedAt === 'string' && candidate.updatedAt
        ? candidate.updatedAt
        : new Date().toISOString(),
  };
}

function hydrateUi(candidate) {
  if (!candidate || typeof candidate !== 'object') {
    return { ...DEFAULT_UI_STATE };
  }

  return {
    measurementUnit: candidate.measurementUnit === 'imperial' ? 'imperial' : 'cm',
    showGrid: candidate.showGrid !== false,
    snapToGrid: candidate.snapToGrid !== false,
    gridSizeCm:
      Number.isFinite(Number(candidate.gridSizeCm)) && Number(candidate.gridSizeCm) > 0
        ? Number(candidate.gridSizeCm)
        : DEFAULT_UI_STATE.gridSizeCm,
    catalogSearch: typeof candidate.catalogSearch === 'string' ? candidate.catalogSearch : '',
    activeCatalogCategory:
      typeof candidate.activeCatalogCategory === 'string' && candidate.activeCatalogCategory
        ? candidate.activeCatalogCategory
        : 'all',
    selectedFurnitureId:
      typeof candidate.selectedFurnitureId === 'string' ? candidate.selectedFurnitureId : null,
  };
}

function hydratePlacedFurniture(candidate) {
  if (!candidate || typeof candidate !== 'object') {
    return null;
  }

  const catalogItem = CATALOG_LOOKUP[candidate.catalogId];

  if (!catalogItem) {
    return null;
  }

  return {
    instanceId:
      typeof candidate.instanceId === 'string' && candidate.instanceId
        ? candidate.instanceId
        : createInstanceId(),
    catalogId: catalogItem.id,
    x: Number.isFinite(Number(candidate.x)) ? Number(candidate.x) : 0,
    y: Number.isFinite(Number(candidate.y)) ? Number(candidate.y) : 0,
    widthCm: Number.isFinite(Number(candidate.widthCm))
      ? Number(candidate.widthCm)
      : catalogItem.defaultWidthCm,
    depthCm: Number.isFinite(Number(candidate.depthCm))
      ? Number(candidate.depthCm)
      : catalogItem.defaultDepthCm,
    rotationDeg: Number.isFinite(Number(candidate.rotationDeg)) ? Number(candidate.rotationDeg) : 0,
    zIndex: Number.isFinite(Number(candidate.zIndex)) ? Number(candidate.zIndex) : 1,
  };
}

function createInstanceId() {
  return `furniture-${Math.random().toString(36).slice(2, 10)}`;
}

function getNextZIndex(furniture) {
  return furniture.reduce((highest, item) => Math.max(highest, item.zIndex ?? 0), 0) + 1;
}

function buildPlacedFurniture({ catalogId, xCm, yCm, activeDesign, ui }) {
  const catalogItem = CATALOG_LOOKUP[catalogId];

  if (!catalogItem) {
    return null;
  }

  const snappedPoint = snapPointToGrid(xCm, yCm, ui.gridSizeCm, ui.snapToGrid);
  const clampedPoint = clampPositionToRoom(
    snappedPoint.x,
    snappedPoint.y,
    catalogItem.defaultWidthCm,
    catalogItem.defaultDepthCm,
    activeDesign.widthCm,
    activeDesign.lengthCm
  );

  return {
    instanceId: createInstanceId(),
    catalogId,
    x: clampedPoint.x,
    y: clampedPoint.y,
    widthCm: catalogItem.defaultWidthCm,
    depthCm: catalogItem.defaultDepthCm,
    rotationDeg: 0,
    zIndex: getNextZIndex(activeDesign.furniture),
  };
}

function getPersistableState(state) {
  return {
    activeDesign: state.activeDesign,
    ui: state.ui,
  };
}

const persistedDraft = draftPersistence.load();

const persistedSavedDesigns = savedDesignsPersistence.load();

function sanitizeSavedDesigns(candidate) {
  if (!candidate || typeof candidate !== 'object') {
    return { list: [], activeId: null };
  }

  const list = Array.isArray(candidate.list) ? candidate.list : [];

  const sanitizedList = list
    .map((d) => {
      if (!d || typeof d !== 'object') return null;
      if (!d.id || typeof d.id !== 'string') return null;

      return {
        id: d.id,
        name: typeof d.name === 'string' && d.name ? d.name : 'Untitled layout',
        roomType:
          ROOM_TYPE_LOOKUP[d.roomType] != null
            ? d.roomType
            : 'custom',
        widthCm:
          Number.isFinite(Number(d.widthCm))
            ? clamp(Math.round(Number(d.widthCm)), ROOM_SIZE_LIMITS.minWidthCm, ROOM_SIZE_LIMITS.maxWidthCm)
            : ROOM_TYPE_LOOKUP.bedroom.defaultWidthCm,
        lengthCm:
          Number.isFinite(Number(d.lengthCm))
            ? clamp(Math.round(Number(d.lengthCm)), ROOM_SIZE_LIMITS.minLengthCm, ROOM_SIZE_LIMITS.maxLengthCm)
            : ROOM_TYPE_LOOKUP.bedroom.defaultLengthCm,
        thumbnail:
          typeof d.thumbnail === 'string' && d.thumbnail ? d.thumbnail : null,
        updatedAt:
          typeof d.updatedAt === 'string' && d.updatedAt ? d.updatedAt : new Date().toISOString(),
        furniture: Array.isArray(d.furniture) ? d.furniture.map(hydratePlacedFurniture).filter(Boolean) : [],
      };
    })
    .filter(Boolean);

  const activeId = typeof candidate.activeId === 'string' ? candidate.activeId : null;

  const normalizedActiveId = sanitizedList.some((d) => d.id === activeId) ? activeId : null;

  return { list: sanitizedList, activeId: normalizedActiveId };
}

const { list: savedDesignsList, activeId: activeSavedDesignId } = sanitizeSavedDesigns(
  persistedSavedDesigns
);

export const useDesignStore = create((set, get) => ({
  activeDesign: hydrateDesign(persistedDraft?.activeDesign),
  ui: hydrateUi(persistedDraft?.ui),
  savedDesigns: savedDesignsList,
  activeSavedDesignId,


  setRoomType(roomType) {
    const preset = ROOM_TYPE_LOOKUP[roomType] ?? ROOM_TYPE_LOOKUP.custom;

    set((state) => ({
      activeDesign: {
        ...state.activeDesign,
        roomType: preset.value,
        widthCm:
          preset.value === 'custom' ? state.activeDesign.widthCm : preset.defaultWidthCm,
        lengthCm:
          preset.value === 'custom' ? state.activeDesign.lengthCm : preset.defaultLengthCm,
        updatedAt: new Date().toISOString(),
      },
    }));

    draftPersistence.save(getPersistableState(get()));
  },

  setRoomDimensionsCm({ widthCm, lengthCm }) {
    const nextWidthCm = toFiniteNumber(widthCm, ROOM_TYPE_LOOKUP.bedroom.defaultWidthCm);
    const nextLengthCm = toFiniteNumber(lengthCm, ROOM_TYPE_LOOKUP.bedroom.defaultLengthCm);

    set((state) => ({
      activeDesign: {
        ...state.activeDesign,
        roomType: state.activeDesign.roomType === 'custom' ? 'custom' : state.activeDesign.roomType,
        widthCm: clamp(Math.round(nextWidthCm), ROOM_SIZE_LIMITS.minWidthCm, ROOM_SIZE_LIMITS.maxWidthCm),
        lengthCm: clamp(
          Math.round(nextLengthCm),
          ROOM_SIZE_LIMITS.minLengthCm,
          ROOM_SIZE_LIMITS.maxLengthCm
        ),
        updatedAt: new Date().toISOString(),
      },
    }));

    draftPersistence.save(getPersistableState(get()));
  },

  setMeasurementUnit(measurementUnit) {
    set((state) => ({
      ui: {
        ...state.ui,
        measurementUnit: measurementUnit === 'imperial' ? 'imperial' : 'cm',
      },
    }));

    draftPersistence.save(getPersistableState(get()));
  },

  setShowGrid(showGrid) {
    set((state) => ({
      ui: {
        ...state.ui,
        showGrid: Boolean(showGrid),
      },
    }));

    draftPersistence.save(getPersistableState(get()));
  },

  setSnapToGrid(snapToGrid) {
    set((state) => ({
      ui: {
        ...state.ui,
        snapToGrid: Boolean(snapToGrid),
      },
    }));

    draftPersistence.save(getPersistableState(get()));
  },

  setGridSizeCm(gridSizeCm) {
    const nextGridSizeCm = toFiniteNumber(gridSizeCm, DEFAULT_UI_STATE.gridSizeCm);

    set((state) => ({
      ui: {
        ...state.ui,
        gridSizeCm: clamp(Math.round(nextGridSizeCm), 1, 100),
      },
    }));

    draftPersistence.save(getPersistableState(get()));
  },

  setCatalogSearch(catalogSearch) {
    set((state) => ({
      ui: {
        ...state.ui,
        catalogSearch,
      },
    }));

    draftPersistence.save(getPersistableState(get()));
  },

  setActiveCatalogCategory(activeCatalogCategory) {
    set((state) => ({
      ui: {
        ...state.ui,
        activeCatalogCategory,
      },
    }));

    draftPersistence.save(getPersistableState(get()));
  },

  setSelectedFurniture(selectedFurnitureId) {
    set((state) => ({
      ui: {
        ...state.ui,
        selectedFurnitureId,
      },
    }));

    draftPersistence.save(getPersistableState(get()));
  },

  addPlacedFurniture({ catalogId, xCm, yCm }) {
    set((state) => {
      const nextItem = buildPlacedFurniture({
        catalogId,
        xCm,
        yCm,
        activeDesign: state.activeDesign,
        ui: state.ui,
      });

      if (!nextItem) {
        return state;
      }

      return {
        activeDesign: {
          ...state.activeDesign,
          furniture: [...state.activeDesign.furniture, nextItem],
          updatedAt: new Date().toISOString(),
        },
        ui: {
          ...state.ui,
          selectedFurnitureId: nextItem.instanceId,
        },
      };
    });

    draftPersistence.save(getPersistableState(get()));
  },

  updatePlacedFurniture(instanceId, updates) {
    set((state) => ({
      activeDesign: {
        ...state.activeDesign,
        furniture: state.activeDesign.furniture.map((item) => {
          if (item.instanceId !== instanceId) {
            return item;
          }

          return clampFurnitureToRoom(
            {
              ...item,
              ...updates,
              rotationDeg:
                updates.rotationDeg == null ? item.rotationDeg : normalizeRotationDeg(updates.rotationDeg),
            },
            state.activeDesign.widthCm,
            state.activeDesign.lengthCm
          );
        }),
        updatedAt: new Date().toISOString(),
      },
    }));

    draftPersistence.save(getPersistableState(get()));
  },

  bringFurnitureToFront(instanceId) {
    set((state) => ({
      activeDesign: {
        ...state.activeDesign,
        furniture: state.activeDesign.furniture.map((item) =>
          item.instanceId === instanceId
            ? { ...item, zIndex: getNextZIndex(state.activeDesign.furniture) }
            : item
        ),
        updatedAt: new Date().toISOString(),
      },
      ui: {
        ...state.ui,
        selectedFurnitureId: instanceId,
      },
    }));

    draftPersistence.save(getPersistableState(get()));
  },

  sendFurnitureToBack(instanceId) {
    set((state) => {
      const lowestZIndex = state.activeDesign.furniture.reduce(
        (lowest, item) => Math.min(lowest, item.zIndex ?? 0),
        0
      );

      return {
        activeDesign: {
          ...state.activeDesign,
          furniture: state.activeDesign.furniture.map((item) =>
            item.instanceId === instanceId ? { ...item, zIndex: lowestZIndex - 1 } : item
          ),
          updatedAt: new Date().toISOString(),
        },
        ui: {
          ...state.ui,
          selectedFurnitureId: instanceId,
        },
      };
    });

    draftPersistence.save(getPersistableState(get()));
  },

  resetDraft() {
    const nextState = {
      activeDesign: createDesign(),
      ui: { ...DEFAULT_UI_STATE },
    };

    set(nextState);
    draftPersistence.clear();
    draftPersistence.save(getPersistableState({ ...get(), ...nextState }));
  },

  /**
   * Save the current draft as a brand new design.
   * Creates a snapshot (room dimensions + furniture instances).
   */
  saveAsNewDesign({ name } = {}) {
    set((state) => {
      const designs = state.savedDesigns;
      const nextId = `design-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const nextName = typeof name === 'string' && name.trim() ? name.trim() : 'Untitled layout';

      const now = new Date().toISOString();
      const snapshot = {
        id: nextId,
        name: nextName,
        roomType: state.activeDesign.roomType,
        widthCm: state.activeDesign.widthCm,
        lengthCm: state.activeDesign.lengthCm,
        furniture: state.activeDesign.furniture,
        updatedAt: now,
        thumbnail: state.activeDesign.roomType,
      };

      const nextSavedDesigns = [snapshot, ...designs];

      savedDesignsPersistence.save({
        list: nextSavedDesigns,
        activeId: nextId,
      });

      return {
        savedDesigns: nextSavedDesigns,
        activeSavedDesignId: nextId,
      };
    });
  },

  /**
   * Updates the currently opened saved design with the current draft snapshot.
   */
  updateCurrentDesign() {
    set((state) => {
      if (!state.activeSavedDesignId) return state;

      const designs = state.savedDesigns;
      const index = designs.findIndex((d) => d.id === state.activeSavedDesignId);

      if (index < 0) return state;

      const now = new Date().toISOString();

      const updated = {
        ...designs[index],
        roomType: state.activeDesign.roomType,
        widthCm: state.activeDesign.widthCm,
        lengthCm: state.activeDesign.lengthCm,
        furniture: state.activeDesign.furniture,
        updatedAt: now,
        thumbnail: state.activeDesign.roomType,
      };

      const nextSavedDesigns = [
        ...designs.slice(0, index),
        updated,
        ...designs.slice(index + 1),
      ];

      savedDesignsPersistence.save({
        list: nextSavedDesigns,
        activeId: state.activeSavedDesignId,
      });

      return {
        savedDesigns: nextSavedDesigns,
      };
    });
  },

  openSavedDesign(designId) {
    set((state) => {
      const design = state.savedDesigns.find((d) => d.id === designId);
      if (!design) return state;

      const nextActiveDesign = {
        id: 'draft-room',
        name: design.name,
        roomType: design.roomType,
        widthCm: design.widthCm,
        lengthCm: design.lengthCm,
        furniture: Array.isArray(design.furniture) ? design.furniture : [],
        updatedAt: new Date().toISOString(),
      };

      // When switching designs, also clear selection.
      const nextUi = { ...state.ui, selectedFurnitureId: null };

      const nextState = {
        activeDesign: nextActiveDesign,
        ui: nextUi,
        activeSavedDesignId: designId,
      };

      draftPersistence.save(getPersistableState(nextState));
      return nextState;
    });
  },

  renameDesign(designId, nextName) {
    set((state) => {
      const designs = state.savedDesigns;
      const index = designs.findIndex((d) => d.id === designId);
      if (index < 0) return state;

      const name = typeof nextName === 'string' && nextName.trim() ? nextName.trim() : designs[index].name;

      const updated = { ...designs[index], name };
      const nextSavedDesigns = [
        ...designs.slice(0, index),
        updated,
        ...designs.slice(index + 1),
      ];

      savedDesignsPersistence.save({
        list: nextSavedDesigns,
        activeId: state.activeSavedDesignId,
      });

      return { savedDesigns: nextSavedDesigns };
    });
  },

  duplicateDesign(designId) {
    set((state) => {
      const src = state.savedDesigns.find((d) => d.id === designId);
      if (!src) return state;

      const nextId = `design-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const now = new Date().toISOString();

      const duplicated = {
        ...src,
        id: nextId,
        name: `${src.name} (Copy)`,
        updatedAt: now,
        furniture: src.furniture,
      };

      const nextSavedDesigns = [duplicated, ...state.savedDesigns];

      savedDesignsPersistence.save({
        list: nextSavedDesigns,
        activeId: nextId,
      });

      return {
        savedDesigns: nextSavedDesigns,
        activeSavedDesignId: nextId,
      };
    });
  },

  deleteDesign(designId) {
    set((state) => {
      const nextSavedDesigns = state.savedDesigns.filter((d) => d.id !== designId);

      const nextActiveId = state.activeSavedDesignId === designId
        ? (nextSavedDesigns[0]?.id ?? null)
        : state.activeSavedDesignId;

      savedDesignsPersistence.save({
        list: nextSavedDesigns,
        activeId: nextActiveId,
      });

      return {
        savedDesigns: nextSavedDesigns,
        activeSavedDesignId: nextActiveId,
      };
    });
  },

  /** Clear furniture but keep room dimensions + type. */
  clearRoom() {
    set((state) => {
      const nextActiveDesign = {
        ...state.activeDesign,
        furniture: [],
        updatedAt: new Date().toISOString(),
      };

      const nextUi = { ...state.ui, selectedFurnitureId: null };

      const nextState = {
        activeDesign: nextActiveDesign,
        ui: nextUi,
      };

      draftPersistence.save(getPersistableState({ ...state, ...nextState }));

      return nextState;
    });
  },
}));

export { DEFAULT_UI_STATE, createDesign, hydrateDesign, hydrateUi, ROOM_SIZE_LIMITS };

