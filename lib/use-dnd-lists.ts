import type { TodoList } from "@/lib/types";
import { useDndReorder } from "@/lib/use-dnd-reorder";

/**
 * Specialized hook for reordering TodoList arrays.
 * Type-safe wrapper around the generic useDndReorder hook.
 */
export function useDndLists(
  lists: TodoList[],
  onReorder: (newLists: TodoList[]) => void,
) {
  return useDndReorder(lists, onReorder);
}
