"use client";

import { useRef, useState, useTransition } from "react";

import { Button, Dialog, Icon, IconButton } from "@/components/ui";
import { cn } from "@/lib/cn";
import { saveLibraryTabOrder } from "@/lib/library-actions";

type Tab = { value: string; label: string; count: number };

export interface TabOrderDialogProps {
  open: boolean;
  onClose: () => void;
  /** Tabs in their current order. */
  tabs: Tab[];
  /** The built-in order, for "Reset to default". */
  defaultOrder: string[];
}

const move = <T,>(list: T[], from: number, to: number) => {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

/**
 * Reorder the library's status tabs. Drag a row by its grip — pointer events,
 * so mouse, touch and pen all work (native HTML drag-and-drop doesn't fire on
 * touch screens). Each row also has up/down buttons for the keyboard. Nothing
 * is saved until "Save order".
 */
export function TabOrderDialog({ open, onClose, tabs, defaultOrder }: TabOrderDialogProps) {
  const [order, setOrder] = useState(tabs);
  const [dragging, setDragging] = useState<number | null>(null);
  const rows = useRef<(HTMLLIElement | null)[]>([]);

  // While dragging, the row under the pointer's vertical position becomes the
  // drop slot; the list reorders live so you see where it will land.
  const onDragMove = (e: React.PointerEvent) => {
    if (dragging === null) return;
    const rects = rows.current.map((r) => r?.getBoundingClientRect());
    let target = rects.findIndex((r) => r && e.clientY < r.top + r.height / 2);
    if (target === -1) target = order.length - 1;
    if (target !== dragging) {
      setOrder((o) => move(o, dragging, target));
      setDragging(target);
    }
  };
  const [saving, startSaving] = useTransition();

  // Start from the saved order each time the dialog opens.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setOrder(tabs);
  }

  const save = (value: string[] | null) =>
    startSaving(async () => {
      const result = await saveLibraryTabOrder(value);
      if (result?.ok) onClose();
    });

  const isDefault = order.every((t, i) => t.value === defaultOrder[i]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Edit status order"
      description="Drag the statuses, or use the arrows, to set the order of your library tabs."
      width={440}
      footer={
        <>
          <Button
            variant="ghost"
            icon="rotate-ccw"
            className="mr-auto"
            disabled={saving || isDefault}
            onClick={() => setOrder(defaultOrder.map((v) => tabs.find((t) => t.value === v)!))}
          >
            Reset
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={saving} onClick={() => save(order.map((t) => t.value))}>
            {saving ? "Saving…" : "Save order"}
          </Button>
        </>
      }
    >
      <ol className="flex flex-col gap-1" aria-label="Status order">
        {order.map((t, i) => (
          <li
            key={t.value}
            ref={(el) => {
              rows.current[i] = el;
            }}
            className={cn(
              "bg-surface-3 flex h-11 items-center gap-3 rounded-md pr-1.5 pl-1",
              "transition-[background-color,box-shadow] duration-[120ms]",
              dragging === i && "bg-surface-5 shadow-[inset_0_0_0_1px_var(--text-3)]",
            )}
          >
            {/* Drag handle. Hidden from AT — the arrow buttons cover it. */}
            <span
              aria-hidden="true"
              onPointerDown={(e) => {
                e.preventDefault();
                e.currentTarget.setPointerCapture(e.pointerId);
                setDragging(i);
              }}
              onPointerMove={onDragMove}
              onPointerUp={() => setDragging(null)}
              onPointerCancel={() => setDragging(null)}
              className={cn(
                "text-text-3 hover:text-text-1 hover:bg-surface-4 flex h-9 w-7 touch-none items-center justify-center rounded-sm",
                dragging === i ? "text-text-1 cursor-grabbing" : "cursor-grab",
              )}
            >
              <Icon name="grip-vertical" size={18} />
            </span>
            <span className="text-text-4 w-4 font-mono text-xs">{i + 1}</span>
            <span className="text-text-1 font-body flex-1 text-md font-medium">{t.label}</span>
            <span className="text-text-4 font-mono text-xs">{t.count}</span>
            <IconButton
              icon="chevron-up"
              label={`Move ${t.label} up`}
              size="sm"
              disabled={i === 0}
              onClick={() => setOrder((o) => move(o, i, i - 1))}
            />
            <IconButton
              icon="chevron-down"
              label={`Move ${t.label} down`}
              size="sm"
              disabled={i === order.length - 1}
              onClick={() => setOrder((o) => move(o, i, i + 1))}
            />
          </li>
        ))}
      </ol>
    </Dialog>
  );
}
