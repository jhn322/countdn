import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

/**
 * Generic hook for reordering arrays using dnd-kit.
 * Returns a handler function for dnd-kit's onDragEnd event.
 */
export function useDndReorder<T extends { id: string }>(
  items: T[],
  onReorder: (newItems: T[]) => void,
) {
  return (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newItems = arrayMove(items, oldIndex, newIndex);
    onReorder(newItems);
  };
}
