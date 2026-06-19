import PropTypes from 'prop-types';

function RotateHandle({ onPointerDown }) {
  return (
    <>
      <div className="pointer-events-none absolute left-1/2 top-0 h-10 w-px -translate-x-1/2 -translate-y-full bg-[#5f7669]/35" />
      <button
        type="button"
        aria-label="Rotate furniture"
        onPointerDown={onPointerDown}
        className="absolute left-1/2 top-0 flex h-8 w-8 -translate-x-1/2 -translate-y-[calc(100%+10px)] items-center justify-center rounded-full border-2 border-white bg-[#d7895c] text-white shadow-[0_10px_20px_rgba(215,137,92,0.28)] transition hover:scale-105"
      >
        <span className="text-sm font-semibold">R</span>
      </button>
    </>
  );
}

RotateHandle.propTypes = {
  onPointerDown: PropTypes.func.isRequired,
};

export default RotateHandle;
