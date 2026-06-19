const DRAFT_STORAGE_KEY = 'home-interior-planner:draft-v1';

/**
 * Tiny adapter layer around browser storage. Components never talk to localStorage directly,
 * which keeps the persistence boundary swappable for an API later.
 */
export const draftPersistence = {
  load() {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const rawValue = window.localStorage.getItem(DRAFT_STORAGE_KEY);

      return rawValue ? JSON.parse(rawValue) : null;
    } catch {
      return null;
    }
  },

  save(value) {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(value));
    } catch {
      // Ignore quota or private-mode failures for now. The UI should remain usable.
    }
  },

  clear() {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Ignore storage cleanup failures.
    }
  },
};
