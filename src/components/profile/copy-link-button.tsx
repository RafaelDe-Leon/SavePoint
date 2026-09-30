"use client";

import { IconButton } from "@/components/ui";
import { useToast } from "@/components/app/use-toast";

/** Copies the absolute URL of `path` — your public profile link. */
export function CopyLinkButton({ path }: { path: string }) {
  const { show } = useToast();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(new URL(path, window.location.origin).href);
      show({ text: "Copied your profile link", tone: "success" });
    } catch {
      show({ text: "Couldn't reach the clipboard. Copy the address bar instead.", tone: "danger" });
    }
  };

  return <IconButton icon="link-2" label="Copy profile link" variant="secondary" size="sm" onClick={copy} />;
}
