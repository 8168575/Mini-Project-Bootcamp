import { clamp } from './coordinates';

export const RESIZE_HANDLE_DIRECTIONS = {
  nw: { x: -1, y: -1 },
  ne: { x: 1, y: -1 },
  se: { x: 1, y: 1 },
  sw: { x: -1, y: 1 },
};

export const MIN_FURNITURE_DIMENSION_CM = 30;

/**
 * Normalizes an angle into the 0-359 range.
 * Rotation math stays predictable when drags cross the 0/360 seam.
 */
export function normalizeRotationDeg(rotationDeg) {
  const normalized = rotationDeg % 360;

  return normalized < 0 ? normalized + 360 : normalized;
}

/**
 * Returns a rotation step based on modifier keys.
 * By default the planner will snap to 15 degrees, while Shift/Alt unlock free rotation later.
 */
export function getRotationSnapStepDeg({ isShiftPressed = false, isAltPressed = false } = {}) {
  return isShiftPressed || isAltPressed ? 0 : 15;
}

/**
 * Computes the axis-aligned bounding box size for a rotated rectangle.
 * This is the geometric foundation for later resize handles and collision checks.
 */
export function getRotatedBoundingBoxSize(width, depth, rotationDeg) {
  const normalizedRotation = normalizeRotationDeg(rotationDeg);
  const radians = degreesToRadians(normalizedRotation);
  const sine = Math.abs(Math.sin(radians));
  const cosine = Math.abs(Math.cos(radians));

  return {
    width: width * cosine + depth * sine,
    depth: width * sine + depth * cosine,
  };
}

export function getFurnitureCenter(item) {
  return {
    x: item.x + item.widthCm / 2,
    y: item.y + item.depthCm / 2,
  };
}

export function getRotatedAxes(rotationDeg) {
  const radians = degreesToRadians(rotationDeg);

  return {
    xAxis: {
      x: Math.cos(radians),
      y: Math.sin(radians),
    },
    yAxis: {
      x: -Math.sin(radians),
      y: Math.cos(radians),
    },
  };
}

export function getCornerPosition(item, handle) {
  const handleDirection = RESIZE_HANDLE_DIRECTIONS[handle];

  if (!handleDirection) {
    return getFurnitureCenter(item);
  }

  const center = getFurnitureCenter(item);
  const { xAxis, yAxis } = getRotatedAxes(item.rotationDeg);

  return {
    x:
      center.x +
      handleDirection.x * (item.widthCm / 2) * xAxis.x +
      handleDirection.y * (item.depthCm / 2) * yAxis.x,
    y:
      center.y +
      handleDirection.x * (item.widthCm / 2) * xAxis.y +
      handleDirection.y * (item.depthCm / 2) * yAxis.y,
  };
}

/**
 * Resizes a rotated furniture item by projecting pointer movement onto the item's local axes.
 * That keeps corner drags coherent even after rotation, while the stored geometry remains
 * top-left position + width/depth in centimeters.
 */
export function resizeFurnitureFromHandle({
  item,
  handle,
  pointer,
  preserveAspectRatio = false,
  roomWidthCm,
  roomLengthCm,
  minWidthCm = MIN_FURNITURE_DIMENSION_CM,
  minDepthCm = MIN_FURNITURE_DIMENSION_CM,
}) {
  const handleDirection = RESIZE_HANDLE_DIRECTIONS[handle];

  if (!handleDirection) {
    return item;
  }

  const { xAxis, yAxis } = getRotatedAxes(item.rotationDeg);
  const oppositeHandle = getOppositeHandle(handle);
  const anchor = getCornerPosition(item, oppositeHandle);
  const anchorToPointer = {
    x: pointer.x - anchor.x,
    y: pointer.y - anchor.y,
  };

  let nextWidthCm = handleDirection.x * dotProduct(anchorToPointer, xAxis);
  let nextDepthCm = handleDirection.y * dotProduct(anchorToPointer, yAxis);

  nextWidthCm = clamp(nextWidthCm, minWidthCm, roomWidthCm);
  nextDepthCm = clamp(nextDepthCm, minDepthCm, roomLengthCm);

  if (preserveAspectRatio) {
    const aspectRatio = item.widthCm / item.depthCm;
    const widthChangeRatio = Math.abs(nextWidthCm / item.widthCm - 1);
    const depthChangeRatio = Math.abs(nextDepthCm / item.depthCm - 1);

    if (widthChangeRatio >= depthChangeRatio) {
      nextDepthCm = clamp(nextWidthCm / aspectRatio, minDepthCm, roomLengthCm);
    } else {
      nextWidthCm = clamp(nextDepthCm * aspectRatio, minWidthCm, roomWidthCm);
    }
  }

  const handlePoint = {
    x:
      anchor.x +
      handleDirection.x * nextWidthCm * xAxis.x +
      handleDirection.y * nextDepthCm * yAxis.x,
    y:
      anchor.y +
      handleDirection.x * nextWidthCm * xAxis.y +
      handleDirection.y * nextDepthCm * yAxis.y,
  };

  const nextCenter = {
    x: (anchor.x + handlePoint.x) / 2,
    y: (anchor.y + handlePoint.y) / 2,
  };

  return clampFurnitureToRoom({
    ...item,
    x: nextCenter.x - nextWidthCm / 2,
    y: nextCenter.y - nextDepthCm / 2,
    widthCm: nextWidthCm,
    depthCm: nextDepthCm,
  }, roomWidthCm, roomLengthCm);
}

export function getRotationFromPointer({ item, pointer, snapStepDeg = 15 }) {
  const center = getFurnitureCenter(item);
  const rawAngle = (Math.atan2(pointer.y - center.y, pointer.x - center.x) * 180) / Math.PI + 90;
  const normalizedAngle = normalizeRotationDeg(rawAngle);

  if (!snapStepDeg) {
    return normalizedAngle;
  }

  return normalizeRotationDeg(Math.round(normalizedAngle / snapStepDeg) * snapStepDeg);
}

export function clampFurnitureToRoom(item, roomWidthCm, roomLengthCm) {
  const nextWidthCm = clamp(item.widthCm, MIN_FURNITURE_DIMENSION_CM, roomWidthCm);
  const nextDepthCm = clamp(item.depthCm, MIN_FURNITURE_DIMENSION_CM, roomLengthCm);

  return {
    ...item,
    x: clamp(item.x, 0, Math.max(0, roomWidthCm - nextWidthCm)),
    y: clamp(item.y, 0, Math.max(0, roomLengthCm - nextDepthCm)),
    widthCm: nextWidthCm,
    depthCm: nextDepthCm,
    rotationDeg: normalizeRotationDeg(item.rotationDeg),
  };
}

export function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function dotProduct(a, b) {
  return a.x * b.x + a.y * b.y;
}

function getOppositeHandle(handle) {
  switch (handle) {
    case 'nw':
      return 'se';
    case 'ne':
      return 'sw';
    case 'se':
      return 'nw';
    case 'sw':
      return 'ne';
    default:
      return 'se';
  }
}
