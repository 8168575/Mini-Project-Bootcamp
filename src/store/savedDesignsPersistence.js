const SAVED_DESIGNS_STORAGE_KEY = 'home-interior-planner:saved-designs-v1';

function safeParse(rawValue) {
  try {
    return rawValue ? JSON.parse(rawValue) : null;
  } catch {
    return null;
  }
}

/**
 * Persistence adapter for the saved designs library.
 * Separate from draft persistence so refresh keeps both.
 */
export const savedDesignsPersistence = {
  load() {
    if (typeof window === 'undefined') return null;

    try {
      const raw = window.localStorage.getItem(SAVED_DESIGNS_STORAGE_KEY);
      return safeParse(raw);
    } catch {
      return null;
    }
  },

  save(value) {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(SAVED_DESIGNS_STORAGE_KEY, JSON.stringify(value));
    } catch {
      // Ignore quota/private-mode failures.
    }
  },

  clear() {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.removeItem(SAVED_DESIGNS_STORAGE_KEY);
    } catch {
      // ignore
    }
  },
};

