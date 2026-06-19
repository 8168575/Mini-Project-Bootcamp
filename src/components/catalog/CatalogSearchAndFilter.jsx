import PropTypes from 'prop-types';
import { furnitureCategories } from '../../data/furnitureCatalog';

function CatalogSearchAndFilter({
  searchValue,
  activeCategory,
  onSearchChange,
  onCategoryChange,
  matchCount,
}) {
  return (
    <div className="space-y-4 rounded-[1.75rem] bg-[#f7f1e8] p-4 ring-1 ring-[#e0d4c5]">
      <label className="block space-y-2">
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-500">
          Search furniture
        </span>
        <input
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Sofa, desk, rug..."
          className="w-full rounded-2xl border border-[#ddcfbf] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#5f7669] focus:ring-2 focus:ring-[#5f7669]/20"
        />
      </label>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-500">
            Categories
          </span>
          <span className="text-xs font-medium text-slate-500">{matchCount} matches</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <CategoryChip
            label="All"
            isActive={activeCategory === 'all'}
            onClick={() => onCategoryChange('all')}
          />
          {furnitureCategories.map((category) => (
            <CategoryChip
              key={category.value}
              label={category.label}
              isActive={activeCategory === category.value}
              onClick={() => onCategoryChange(category.value)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryChip({ label, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] transition ${
        isActive
          ? 'bg-[#5f7669] text-white shadow-md shadow-[#5f7669]/20'
          : 'bg-white text-slate-600 ring-1 ring-[#ddcfbf] hover:text-slate-900'
      }`}
    >
      {label}
    </button>
  );
}

CatalogSearchAndFilter.propTypes = {
  searchValue: PropTypes.string.isRequired,
  activeCategory: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onCategoryChange: PropTypes.func.isRequired,
  matchCount: PropTypes.number.isRequired,
};

CategoryChip.propTypes = {
  label: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default CatalogSearchAndFilter;
