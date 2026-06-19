/**
 * Snaps drag transforms to the room grid in pixel-space while the canonical state remains
 * centimeter-based. The final cm values are still recomputed and committed on drag end.
 */
export function createSnapToGridModifier(gridSizePx, enabled) {
  if (!enabled || !Number.isFinite(gridSizePx) || gridSizePx <= 0) {
    return undefined;
  }

  return ({ transform }) => ({
    ...transform,
    x: Math.round(transform.x / gridSizePx) * gridSizePx,
    y: Math.round(transform.y / gridSizePx) * gridSizePx,
  });
}
