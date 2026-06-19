import SectionCard from '../ui/SectionCard';
import { ROOM_TYPE_OPTIONS, useDesignStore } from '../../store/useDesignStore';
import { cmToFeetAndInches, feetAndInchesToCm, formatDimensionValue } from '../../utils/coordinates';

function Toolbar() {
  const activeDesign = useDesignStore((state) => state.activeDesign);
  const ui = useDesignStore((state) => state.ui);
  const setRoomType = useDesignStore((state) => state.setRoomType);
  const setRoomDimensionsCm = useDesignStore((state) => state.setRoomDimensionsCm);
  const setMeasurementUnit = useDesignStore((state) => state.setMeasurementUnit);
  const setShowGrid = useDesignStore((state) => state.setShowGrid);
  const setSnapToGrid = useDesignStore((state) => state.setSnapToGrid);

  const activeSavedDesignId = useDesignStore((s) => s.activeSavedDesignId);
  const saveAsNewDesign = useDesignStore((s) => s.saveAsNewDesign);
  const updateCurrentDesign = useDesignStore((s) => s.updateCurrentDesign);
  const clearRoom = useDesignStore((s) => s.clearRoom);


  const imperialWidth = cmToFeetAndInches(activeDesign.widthCm);
  const imperialLength = cmToFeetAndInches(activeDesign.lengthCm);

  const updateMetricDimension = (field, value) => {
    const numericValue = value === '' ? 0 : Number(value);

    setRoomDimensionsCm({
      widthCm: field === 'width' ? numericValue : activeDesign.widthCm,
      lengthCm: field === 'length' ? numericValue : activeDesign.lengthCm,
    });
  };

  const updateImperialDimension = (field, part, value) => {
    const numericValue = value === '' ? 0 : Number(value);
    const current = field === 'width' ? imperialWidth : imperialLength;
    const nextFeet = part === 'feet' ? numericValue : current.feet;
    const nextInches = part === 'inches' ? numericValue : current.inches;
    const nextCm = feetAndInchesToCm(nextFeet, nextInches);

    setRoomDimensionsCm({
      widthCm: field === 'width' ? nextCm : activeDesign.widthCm,
      lengthCm: field === 'length' ? nextCm : activeDesign.lengthCm,
    });
  };

  return (
    <SectionCard
      eyebrow="Room setup"
      title="Choose dimensions before placing furniture"
      description="Room size changes rescale the floor plan only. The stored geometry stays in centimeters."
      className="lg:sticky lg:top-4"
    >
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">

          <div className="space-y-3 rounded-3xl border border-[#ded4c6] bg-[#fffdf9] p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Design management</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  const name = window.prompt('Name this saved design:', 'Untitled layout');
                  if (name == null) return;
                  saveAsNewDesign({ name });
                }}
                className="rounded-2xl bg-[#5f7669] px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white shadow-[0_14px_26px_rgba(95,118,105,0.22)] transition hover:bg-[#53695d]"
              >
                Save as new design
              </button>
              <button
                type="button"
                onClick={() => updateCurrentDesign()}
                disabled={!activeSavedDesignId}
                className="rounded-2xl border border-[#ded4c6] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-700 transition hover:border-[#bfae96] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Update current design
              </button>
              <button
                type="button"
                onClick={() => {
                  const ok = window.confirm('Clear room furniture only? This keeps room dimensions.');
                  if (!ok) return;
                  clearRoom();
                }}
                className="rounded-2xl border border-rose-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-rose-700 transition hover:border-rose-300 hover:bg-[#fffdf9]"
              >
                Clear room
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Room type
            </label>
            <select
              className="w-full rounded-2xl border border-[#ded4c6] bg-[#fffdf9] px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#5f7669] focus:ring-2 focus:ring-[#5f7669]/20"
              value={activeDesign.roomType}
              onChange={(event) => setRoomType(event.target.value)}
            >
              {ROOM_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Measurement units
              </span>
              <div className="inline-flex rounded-full bg-[#efe7dd] p-1">
                {[
                  { value: 'cm', label: 'cm' },
                  { value: 'imperial', label: 'ft / in' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={ui.measurementUnit === option.value}
                    onClick={() => setMeasurementUnit(option.value)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
                      ui.measurementUnit === option.value
                        ? 'bg-[#5f7669] text-white shadow-md shadow-[#5f7669]/20'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {ui.measurementUnit === 'cm' ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    Width
                  </span>
                  <input
                    type="number"
                    min="240"
                    max="1200"
                    step="1"
                    value={activeDesign.widthCm}
                    onChange={(event) => updateMetricDimension('width', event.target.value)}
                    className="w-full rounded-2xl border border-[#ded4c6] bg-[#fffdf9] px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#5f7669] focus:ring-2 focus:ring-[#5f7669]/20"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    Length
                  </span>
                  <input
                    type="number"
                    min="240"
                    max="1200"
                    step="1"
                    value={activeDesign.lengthCm}
                    onChange={(event) => updateMetricDimension('length', event.target.value)}
                    className="w-full rounded-2xl border border-[#ded4c6] bg-[#fffdf9] px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#5f7669] focus:ring-2 focus:ring-[#5f7669]/20"
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <DimensionImperialGroup
                  label="Width"
                  value={imperialWidth}
                  onFeetChange={(value) => updateImperialDimension('width', 'feet', value)}
                  onInchesChange={(value) => updateImperialDimension('width', 'inches', value)}
                />
                <DimensionImperialGroup
                  label="Length"
                  value={imperialLength}
                  onFeetChange={(value) => updateImperialDimension('length', 'feet', value)}
                  onInchesChange={(value) => updateImperialDimension('length', 'inches', value)}
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 rounded-3xl bg-[#f7f1e8] p-4 ring-1 ring-[#e0d4c5]">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              View helpers
            </p>
            <div className="rounded-2xl bg-white/75 p-3 text-sm leading-6 text-slate-600 shadow-sm">
              {formatDimensionValue(activeDesign.widthCm, 'cm')} wide by{' '}
              {formatDimensionValue(activeDesign.lengthCm, 'cm')} long.
              <br />
              The canvas will fit these room dimensions proportionally.
            </div>
          </div>

          <div className="space-y-3">
            <ToggleRow
              label="Grid overlay"
              description="Shows a 10 cm planning grid on the paper canvas."
              checked={ui.showGrid}
              onToggle={setShowGrid}
            />
            <ToggleRow
              label="Snap to grid"
              description="Stores the grid preference now so placement math can reuse it later."
              checked={ui.snapToGrid}
              onToggle={setSnapToGrid}
            />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function DimensionImperialGroup({ label, value, onFeetChange, onInchesChange }) {
  return (
    <div className="space-y-2 rounded-3xl border border-[#ded4c6] bg-[#fffdf9] p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          {label}
        </span>
        <span className="text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
          {value.feet} ft {value.inches} in
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-2">
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-400">
            Feet
          </span>
          <input
            type="number"
            min="0"
            step="1"
            value={value.feet}
            onChange={(event) => onFeetChange(event.target.value)}
            className="w-full rounded-2xl border border-[#ded4c6] bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#5f7669] focus:ring-2 focus:ring-[#5f7669]/20"
          />
        </label>
        <label className="space-y-2">
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-400">
            Inches
          </span>
          <input
            type="number"
            min="0"
            max="11"
            step="1"
            value={value.inches}
            onChange={(event) => onInchesChange(event.target.value)}
            className="w-full rounded-2xl border border-[#ded4c6] bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#5f7669] focus:ring-2 focus:ring-[#5f7669]/20"
          />
        </label>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onToggle }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!checked)}
      className="flex w-full items-start justify-between gap-4 rounded-3xl border border-[#ded4c6] bg-white/80 px-4 py-4 text-left shadow-sm transition hover:border-[#bfae96] hover:bg-white"
    >
      <span className="space-y-1">
        <span className="block text-sm font-semibold text-slate-900">{label}</span>
        <span className="block text-xs leading-5 text-slate-500">{description}</span>
      </span>
      <span
        className={`mt-0.5 inline-flex h-6 w-11 items-center rounded-full p-1 transition ${
          checked ? 'bg-[#5f7669]' : 'bg-slate-300'
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white shadow transition ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  );
}

export default Toolbar;
