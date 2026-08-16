import type { ListItem } from "@/lib/types";
import { useDndReorder } from "@/lib/use-dnd-reorder";

/**
 * Specialized hook for reordering ListItem arrays.
 * Type-safe wrapper around the generic useDndReorder hook.
 */
export function useDndListItems(
  items: ListItem[],
  onReorder: (newItems: ListItem[]) => void,
) {
  return useDndReorder(items, onReorder);
}
