"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  type ClockFormat,
  type FilterMode,
  type ListItem,
  type TodoList,
} from "@/lib/types";
import { ListCard } from "@/components/list-card";

type Props = {
  list: TodoList;
  now: number;
  filter: FilterMode;
  clock: ClockFormat;
  onTitleChange: (title: string) => void;
  onAddRow: (count: number) => void;
  onDeleteList: () => void;
  onToggleItem: (itemId: string) => void;
  onItemTextChange: (itemId: string, text: string) => void;
  onItemDurationChange: (itemId: string, ms: number) => void;
  onDeleteItem: (itemId: string) => void;
  onReorderItems: (newItems: ListItem[]) => void;
  onImportList: (list: TodoList) => void;
};

export function SortableListCard({
  list,
  now,
  filter,
  clock,
  onTitleChange,
  onAddRow,
  onDeleteList,
  onToggleItem,
  onItemTextChange,
  onItemDurationChange,
  onDeleteItem,
  onReorderItems,
  onImportList,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: list.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    width: "100%",
    height: "fit-content",
    alignSelf: "start" as const,
    justifySelf: "stretch" as const,
    position: "relative" as const,
    zIndex: isDragging ? 20 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="w-full cursor-grab active:cursor-grabbing"
    >
      <ListCard
        list={list}
        now={now}
        filter={filter}
        clock={clock}
        onTitleChange={onTitleChange}
        onAddRow={onAddRow}
        onDeleteList={onDeleteList}
        onToggleItem={onToggleItem}
        onItemTextChange={onItemTextChange}
        onItemDurationChange={onItemDurationChange}
        onDeleteItem={onDeleteItem}
        onReorderItems={onReorderItems}
        onImportList={onImportList}
      />
    </div>
  );
}
