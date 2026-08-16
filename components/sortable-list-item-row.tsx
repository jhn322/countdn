"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { type ClockFormat, type ListItem } from "@/lib/types";
import { ListItemRow } from "@/components/list-item-row";

type Props = {
  item: ListItem;
  now: number;
  clock: ClockFormat;
  onToggle: () => void;
  onTextChange: (text: string) => void;
  onDurationChange: (ms: number) => void;
  onDelete: () => void;
};

export function SortableListItemRow({
  item,
  now,
  clock,
  onToggle,
  onTextChange,
  onDurationChange,
  onDelete,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ListItemRow
        item={item}
        now={now}
        clock={clock}
        onToggle={onToggle}
        onTextChange={onTextChange}
        onDurationChange={onDurationChange}
        onDelete={onDelete}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}
