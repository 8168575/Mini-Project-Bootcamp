import PropTypes from 'prop-types';

const HANDLE_POSITIONS = {
  nw: '-left-3 -top-3',
  ne: '-right-3 -top-3',
  se: '-right-3 -bottom-3',
  sw: '-left-3 -bottom-3',
};

function ResizeHandles({ onPointerDown }) {
  return (
    <>
      {Object.entries(HANDLE_POSITIONS).map(([handle, positionClassName]) => (
        <button
          key={handle}
          type="button"
          aria-label={`Resize from ${handle} corner`}
          onPointerDown={(event) => onPointerDown(handle, event)}
          className={`absolute ${positionClassName} h-6 w-6 rounded-full border-2 border-white bg-[#5f7669] shadow-[0_10px_20px_rgba(52,68,61,0.25)] transition hover:scale-105`}
        />
      ))}
    </>
  );
}

ResizeHandles.propTypes = {
  onPointerDown: PropTypes.func.isRequired,
};

export default ResizeHandles;
