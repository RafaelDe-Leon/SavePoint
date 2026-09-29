/** The shape Next passes a page's `searchParams` promise resolves to. */
export type SearchParams = Record<string, string | string[] | undefined>;

/** First value of a param, or undefined. */
export function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

/** A comma-separated param as a list: `?system=ps5,deck` → ["ps5", "deck"]. */
export function list(v: string | string[] | undefined) {
  return (one(v) ?? "").split(",").filter(Boolean);
}

/** Narrows a param to one of an object's keys, falling back when it isn't. */
export function oneOf<T extends string>(
  v: string | string[] | undefined,
  options: Record<T, unknown>,
  fallback: T,
): T {
  const s = one(v);
  return s && s in options ? (s as T) : fallback;
}
