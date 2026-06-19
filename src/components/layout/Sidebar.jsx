import FurnitureCatalog from '../catalog/FurnitureCatalog';
import SavedDesignsGallery from '../designs/SavedDesignsGallery';

function Sidebar() {
  return (
    <aside className="min-h-0 space-y-5">
      <SavedDesignsGallery />
      <FurnitureCatalog />
    </aside>
  );
}

export default Sidebar;


