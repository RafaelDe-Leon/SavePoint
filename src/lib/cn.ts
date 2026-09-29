import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names, with later Tailwind utilities winning over
 * earlier conflicting ones. Every SafePoint component funnels its `className`
 * prop through this so consumers can always override.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
