import Image from "next/image";

import { Icon } from "@/components/ui";

export interface FeatureImageProps {
  /** Alt text, and the caption shown on the placeholder. */
  alt: string;
  /**
   * Screenshot path, e.g. "/landing/shelf.png" in `public/`. Omit it to render
   * a placeholder frame at the same 16:10 size, so dropping a real image in
   * later doesn't shift the layout.
   */
  src?: string;
}

export function FeatureImage({ alt, src }: FeatureImageProps) {
  return (
    <div className="bg-surface-1 inset-hairline relative aspect-[16/10] w-full overflow-hidden rounded-xl">
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 600px"
          className="object-cover object-top"
        />
      ) : (
        <div className="text-text-4 absolute inset-3 flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border-2">
          <Icon name="image" size={28} strokeWidth={1.5} />
          <span className="font-mono text-xs">{alt}</span>
        </div>
      )}
    </div>
  );
}
