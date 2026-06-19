import { useDeferredValue, useMemo } from 'react';
import SectionCard from '../ui/SectionCard';
import FurnitureCard from './FurnitureCard';
import CatalogSearchAndFilter from './CatalogSearchAndFilter';
import { furnitureCatalog } from '../../data/furnitureCatalog';
import { useDesignStore } from '../../store/useDesignStore';

function FurnitureCatalog() {
  const searchValue = useDesignStore((state) => state.ui.catalogSearch);
  const activeCategory = useDesignStore((state) => state.ui.activeCatalogCategory);
  const setCatalogSearch = useDesignStore((state) => state.setCatalogSearch);
  const setActiveCatalogCategory = useDesignStore((state) => state.setActiveCatalogCategory);
  const deferredSearch = useDeferredValue(searchValue);

  const filteredItems = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    return furnitureCatalog.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesSearch =
        normalizedSearch.length === 0 || item.name.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, deferredSearch]);

  return (
    <SectionCard
      eyebrow="Catalog"
      title="Drag furniture into the room"
      description="Each card creates a new furniture instance at the drop point using centimeter coordinates."
      className="h-full"
    >
      <div className="space-y-4">
        <CatalogSearchAndFilter
          searchValue={searchValue}
          activeCategory={activeCategory}
          onSearchChange={setCatalogSearch}
          onCategoryChange={setActiveCatalogCategory}
          matchCount={filteredItems.length}
        />

        <div className="planner-scrollbar max-h-[720px] space-y-3 overflow-y-auto pr-1">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => <FurnitureCard key={item.id} item={item} />)
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-[#d7c8b7] bg-white/65 px-4 py-6 text-center text-sm leading-6 text-slate-500">
              No catalog items match the current search and category filter.
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

export default FurnitureCatalog;
