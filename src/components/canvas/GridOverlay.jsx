import PropTypes from 'prop-types';

/**
 * Draws a repeating grid in render-space pixels while keeping the room state in centimeters.
 * The grid spacing is derived from the scale factor so the visual grid stays proportional.
 */
function GridOverlay({ visible, gridSizeCm, pixelsPerCm }) {
  if (!visible || pixelsPerCm <= 0 || gridSizeCm <= 0) {
    return null;
  }

  const gridSizePx = gridSizeCm * pixelsPerCm;

  if (gridSizePx < 6) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 rounded-[inherit] pointer-events-none"
      style={{
        backgroundImage:
          'linear-gradient(to right, rgba(95,118,105,0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(95,118,105,0.14) 1px, transparent 1px)',
        backgroundSize: `${gridSizePx}px ${gridSizePx}px`,
      }}
    />
  );
}

GridOverlay.propTypes = {
  visible: PropTypes.bool.isRequired,
  gridSizeCm: PropTypes.number.isRequired,
  pixelsPerCm: PropTypes.number.isRequired,
};

export default GridOverlay;
