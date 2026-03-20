import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: ReactNode;
  accentColor?: string;
  sub?: string;
}

export default function StatCard({
  label,
  value,
  unit,
  icon,
  accentColor = "#6366f1",
  sub,
}: StatCardProps) {
  return (
    <div className="card p-4 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">
          {label}
        </span>
        <span
          className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
          style={{
            background: `${accentColor}18`,
            color: accentColor,
          }}
        >
          {icon}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-white tabular-nums leading-none">
          {value}
        </span>
        {unit && <span className="text-xs text-slate-500">{unit}</span>}
      </div>
      {sub && <p className="text-xs text-slate-600">{sub}</p>}
    </div>
  );
}
