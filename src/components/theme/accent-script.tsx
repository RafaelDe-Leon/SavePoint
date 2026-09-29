import {
  ACCENT_STORAGE_KEY,
  ACCENT_VARS,
  DEFAULT_ACCENT,
} from "@/lib/accents";

/**
 * Applies the stored accent before first paint.
 *
 * Without this the page renders volt, then React swaps the accent on hydration
 * — a visible flash on every load for anyone who picked a different color. The
 * script is inlined and synchronous so it runs before the browser paints.
 *
 * The accent table is serialized from the registry, so adding a color in
 * accents.ts is picked up here automatically.
 */
export function AccentScript() {
  const js = `(function(){try{
var m=${JSON.stringify(ACCENT_VARS)};
var a=localStorage.getItem(${JSON.stringify(ACCENT_STORAGE_KEY)});
var v=m[a]||m[${JSON.stringify(DEFAULT_ACCENT)}];
if(!v)return;
var s=document.documentElement.style;
for(var k in v)s.setProperty(k,v[k]);
document.documentElement.setAttribute('data-accent',m[a]?a:${JSON.stringify(DEFAULT_ACCENT)});
}catch(e){}})()`;

  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}
