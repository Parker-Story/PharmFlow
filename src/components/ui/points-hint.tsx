import { ACHIEVEMENTS } from "@/data/achievements";

interface PointsHintProps {
  ids: string[];
}

export function PointsHint({ ids }: PointsHintProps) {
  const items = ACHIEVEMENTS.filter((a) => ids.includes(a.id));
  if (!items.length) return null;

  const total = items.reduce((sum, a) => sum + a.points, 0);

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      <span className="text-muted-foreground">Earn up to {total} pts:</span>
      {items.map((a) => (
        <span
          key={a.id}
          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary"
        >
          +{a.points}
          <span className="font-normal opacity-75">{a.title}</span>
        </span>
      ))}
    </div>
  );
}
