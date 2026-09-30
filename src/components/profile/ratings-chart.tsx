import { Tooltip } from "@/components/ui";

const STEPS = Array.from({ length: 10 }, (_, i) => (i + 1) / 2);

/**
 * Distribution of your ratings in half-star buckets. One series, so one
 * neutral hue — magnitude is height alone — with a per-bar tooltip and a
 * visually hidden table for screen readers.
 */
export function RatingsChart({ ratings }: { ratings: number[] }) {
  const counts = STEPS.map((s) => ratings.filter((r) => r === s).length);
  const max = Math.max(1, ...counts);

  return (
    <figure>
      <div aria-hidden="true" className="border-border-2 flex h-20 items-end gap-0.5 border-b">
        {STEPS.map((s, i) => (
          <Tooltip
            key={s}
            content={`${counts[i]} rated ${s}`}
            className="h-full flex-1 items-end"
          >
            {/* Full-height hit target; the bar sits inside it on the baseline. */}
            <span tabIndex={-1} className="flex h-full w-full items-end">
              <span
                className="bg-surface-5 group-hover:bg-text-3 w-full rounded-t-[4px] transition-colors duration-[120ms]"
                style={{ height: counts[i] ? `${(counts[i] / max) * 100}%` : 2 }}
              />
            </span>
          </Tooltip>
        ))}
      </div>
      <figcaption className="text-text-4 mt-1.5 flex justify-between font-mono text-xs">
        <span>0.5</span>
        <span>{ratings.length} rated</span>
        <span>5</span>
      </figcaption>
      <table className="sr-only">
        <caption>Your ratings</caption>
        <tbody>
          {STEPS.map((s, i) => (
            <tr key={s}>
              <th scope="row">{s} stars</th>
              <td>{counts[i]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
