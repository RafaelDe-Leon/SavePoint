"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/cn";
import { IconButton } from "./icon-button";

export interface DialogProps {
  open?: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  /** Action row, pinned to the bottom on surface-1. */
  footer?: React.ReactNode;
  /** Max width in px. */
  width?: number;
  className?: string;
}

/**
 * Built on the native `<dialog>` element: focus trapping, Escape-to-close,
 * background inerting and top-layer stacking come from the platform rather
 * than hand-rolled listeners.
 *
 * The scrim is the only blurred surface besides the sticky nav.
 */
export function Dialog({
  open = false,
  onClose,
  title,
  description,
  children,
  footer,
  width = 520,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      // Fires for Escape and for programmatic close alike.
      onClose={onClose}
      onCancel={(e) => {
        // Let React own the open state rather than the DOM closing itself.
        e.preventDefault();
        onClose?.();
      }}
      onMouseDown={(e) => {
        // Light dismiss: the backdrop is the dialog's own box outside the panel.
        if (e.target === e.currentTarget) onClose?.();
      }}
      style={{ maxWidth: width }}
      className={cn(
        // `open:flex`, not `flex`: an unconditional display would override the
        // UA's `dialog:not([open]) { display: none }` and leave it on the page.
        "bg-surface-2 rounded-xl text-text-1 mx-auto mt-[12vh] mb-4 hidden max-h-[76vh] w-full flex-col overflow-hidden p-0 open:flex",
        "shadow-overlay",
        "backdrop:bg-overlay backdrop:backdrop-blur-[8px]",
        className,
      )}
    >
      {title || onClose ? (
        <div className="flex items-start gap-3 pt-[18px] pr-[18px] pl-[22px]">
          <div className="flex flex-1 flex-col gap-1 pt-1">
            {title ? (
              <h2 className="text-text-1 font-display text-xl font-bold leading-[1.2] tracking-display">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="text-text-3 font-body text-md leading-[1.45]">
                {description}
              </p>
            ) : null}
          </div>
          {onClose ? (
            <IconButton icon="x" label="Close" size="sm" onClick={onClose} />
          ) : null}
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto px-[22px] py-[18px]">
        {children}
      </div>

      {footer ? (
        <div className="border-border-1 bg-surface-1 flex justify-end gap-2 border-t px-[22px] py-3.5">
          {footer}
        </div>
      ) : null}
    </dialog>
  );
}
