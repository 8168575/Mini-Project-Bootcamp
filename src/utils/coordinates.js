export const CM_PER_INCH = 2.54;
export const INCHES_PER_FOOT = 12;

/**
 * Clamps a numeric value into the provided inclusive range.
 * Keeping the geometry bounds centralized helps the canvas and future drag math stay consistent.
 */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Rounds a value to the nearest increment. Used for cm grid snapping and future drag modifiers.
 */
export function snapToIncrement(value, increment, enabled = true) {
  if (!enabled || !Number.isFinite(value) || !Number.isFinite(increment) || increment <= 0) {
    return value;
  }

  return Math.round(value / increment) * increment;
}

/**
 * Computes a single scale factor that fits the room into the available viewport.
 * The calculation keeps aspect ratio intact so the floor plan remains proportional.
 */
export function getScaleToFitRoom(widthCm, lengthCm, availableWidthPx, availableHeightPx, paddingPx = 0) {
  const usableWidth = Math.max(0, availableWidthPx - paddingPx * 2);
  const usableHeight = Math.max(0, availableHeightPx - paddingPx * 2);

  if (
    !Number.isFinite(widthCm) ||
    !Number.isFinite(lengthCm) ||
    widthCm <= 0 ||
    lengthCm <= 0 ||
    usableWidth <= 0 ||
    usableHeight <= 0
  ) {
    return 0;
  }

  return Math.min(usableWidth / widthCm, usableHeight / lengthCm);
}

export function cmToPx(cm, pixelsPerCm) {
  return cm * pixelsPerCm;
}

export function pxToCm(px, pixelsPerCm) {
  if (!pixelsPerCm) {
    return 0;
  }

  return px / pixelsPerCm;
}

export function clampPositionToRoom(xCm, yCm, itemWidthCm, itemDepthCm, roomWidthCm, roomLengthCm) {
  return {
    x: clamp(xCm, 0, Math.max(0, roomWidthCm - itemWidthCm)),
    y: clamp(yCm, 0, Math.max(0, roomLengthCm - itemDepthCm)),
  };
}

export function snapPointToGrid(xCm, yCm, gridSizeCm, enabled) {
  return {
    x: snapToIncrement(xCm, gridSizeCm, enabled),
    y: snapToIncrement(yCm, gridSizeCm, enabled),
  };
}

export function feetAndInchesToCm(feet, inches) {
  const numericFeet = Number(feet) || 0;
  const numericInches = Number(inches) || 0;
  const totalInches = numericFeet * INCHES_PER_FOOT + numericInches;

  return totalInches * CM_PER_INCH;
}

export function cmToFeetAndInches(cm) {
  const totalInches = cm / CM_PER_INCH;
  let feet = Math.floor(totalInches / INCHES_PER_FOOT);
  let inches = Math.round(totalInches - feet * INCHES_PER_FOOT);

  if (inches >= INCHES_PER_FOOT) {
    feet += 1;
    inches = 0;
  }

  return { feet, inches };
}

export function formatDimensionValue(cm, unit = 'cm') {
  if (unit === 'imperial') {
    const { feet, inches } = cmToFeetAndInches(cm);

    return `${feet} ft ${inches} in`;
  }

  return `${Math.round(cm)} cm`;
}
