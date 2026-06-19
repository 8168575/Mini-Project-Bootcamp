import React, { useMemo } from 'react';
import SectionCard from '../ui/SectionCard';

import DesignCard from './DesignCard';
import { useDesignStore } from '../../store/useDesignStore';

function SavedDesignsGallery() {
  const savedDesigns = useDesignStore((s) => s.savedDesigns);
  const activeSavedDesignId = useDesignStore((s) => s.activeSavedDesignId);
  const openSavedDesign = useDesignStore((s) => s.openSavedDesign);
  const renameDesign = useDesignStore((s) => s.renameDesign);
  const duplicateDesign = useDesignStore((s) => s.duplicateDesign);
  const deleteDesign = useDesignStore((s) => s.deleteDesign);

  const sorted = useMemo(() => {
    return [...savedDesigns].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }, [savedDesigns]);

  return (
    <SectionCard
      eyebrow="Designs"
      title="Saved layouts"
      description="Save snapshots of your current room and manage multiple designs."
      className="h-full"
    >
      {sorted.length > 0 ? (
        <div className="space-y-3">
          <div className="planner-scrollbar max-h-[320px] space-y-3 overflow-y-auto pr-1">
            {sorted.map((design) => (
              <DesignCard
                key={design.id}
                design={design}
                active={design.id === activeSavedDesignId}
                onOpen={() => openSavedDesign(design.id)}
                onRename={(name) => renameDesign(design.id, name)}
                onDuplicate={() => duplicateDesign(design.id)}
                onDelete={() => deleteDesign(design.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-[#d7c8b7] bg-white/65 px-4 py-6 text-center text-sm leading-6 text-slate-500">
          <p className="font-semibold text-slate-700">No saved designs yet</p>
          <p className="mt-1">Use “Save as new design” to create your first snapshot.</p>
        </div>
      )}
    </SectionCard>
  );
}

export default SavedDesignsGallery;

