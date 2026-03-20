import { getAQILevel } from "../utils/aqi";

interface AQIBadgeProps {
  aqi: number;
  size?: "sm" | "md" | "lg";
}

export default function AQIBadge({ aqi, size = "md" }: AQIBadgeProps) {
  const level = getAQILevel(aqi);

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1 font-semibold",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded font-medium tracking-wide ${sizeClasses[size]}`}
      style={{
        color: level.color,
        background: `${level.color}15`,
        border: `1px solid ${level.color}35`,
      }}
    >
      <span
        className="inline-block rounded-full flex-shrink-0"
        style={{ width: 6, height: 6, background: level.color }}
      />
      {level.label}
    </span>
  );
}
