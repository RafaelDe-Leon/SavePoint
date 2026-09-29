import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { SHELF_TABS, type ShelfTab } from "@/lib/sample-library";

/**
 * Per-user preferences, stored beside the fake shelf in `.data/prefs.json`
 * until there's a real user record to hang them on.
 */

interface Preferences {
  libraryTabOrder?: string[];
}

const STORE = path.join(process.cwd(), ".data", "prefs.json");

async function read(): Promise<Preferences> {
  try {
    return JSON.parse(await readFile(STORE, "utf8"));
  } catch {
    return {};
  }
}

async function write(prefs: Preferences) {
  await mkdir(path.dirname(STORE), { recursive: true });
  await writeFile(STORE, JSON.stringify(prefs, null, 2));
}

const DEFAULT_ORDER = Object.keys(SHELF_TABS) as ShelfTab[];

/**
 * Your library tab order. Tolerant of drift: unknown keys are dropped and
 * tabs added since the order was saved are appended, so a new tab always
 * shows up.
 */
export async function getLibraryTabOrder(): Promise<ShelfTab[]> {
  const saved = ((await read()).libraryTabOrder ?? []).filter(
    (k): k is ShelfTab => k in SHELF_TABS,
  );
  return [...new Set([...saved, ...DEFAULT_ORDER])];
}

export async function setLibraryTabOrder(order: string[] | null) {
  const prefs = await read();
  if (order) prefs.libraryTabOrder = order.filter((k) => k in SHELF_TABS);
  else delete prefs.libraryTabOrder;
  await write(prefs);
}
