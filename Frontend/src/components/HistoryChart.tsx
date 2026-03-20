import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { SensorReading } from "../types";
import { getAQILevel } from "../utils/aqi";

interface HistoryChartProps {
  data: SensorReading[];
}

interface TooltipPayload {
  value: number;
  name: string;
  color: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong px-3.5 py-2.5 text-xs">
      <p className="text-slate-500 mb-1.5">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="font-medium" style={{ color: p.color }}>
          {p.name}:{" "}
          <span className="font-bold tabular-nums">
            {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
          </span>
        </p>
      ))}
    </div>
  );
}

export default function HistoryChart({ data }: HistoryChartProps) {
  const chartData = [...data].reverse().map((r) => ({
    time: new Date(r.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    AQI: r.aqi,
    Temperature: r.temperature,
    Humidity: r.humidity,
  }));

  const latestAqi = data[0]?.aqi ?? 0;
  const aqiLevel = getAQILevel(latestAqi);

  const gridColor = "rgba(51,65,85,0.5)";
  const tickProps = { fill: "#475569", fontSize: 11 };

  return (
    <div className="panel p-5">
      <p className="text-sm font-semibold text-slate-300 mb-5">Trend Charts</p>

      {/* AQI */}
      <div className="mb-7">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-3">
          Air Quality Index
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart
            data={chartData}
            margin={{ top: 4, right: 12, left: -16, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="time"
              tick={tickProps}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={tickProps}
              axisLine={false}
              tickLine={false}
              domain={[0, 500]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={50}
              stroke="#22c55e"
              strokeDasharray="4 3"
              strokeOpacity={0.35}
            />
            <ReferenceLine
              y={100}
              stroke="#eab308"
              strokeDasharray="4 3"
              strokeOpacity={0.35}
            />
            <ReferenceLine
              y={150}
              stroke="#f97316"
              strokeDasharray="4 3"
              strokeOpacity={0.35}
            />
            <ReferenceLine
              y={200}
              stroke="#ef4444"
              strokeDasharray="4 3"
              strokeOpacity={0.35}
            />
            <Line
              type="monotone"
              dataKey="AQI"
              stroke={aqiLevel.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Temp & Humidity */}
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-3">
          Temperature & Humidity
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart
            data={chartData}
            margin={{ top: 4, right: 12, left: -16, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="time"
              tick={tickProps}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={tickProps} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, color: "#64748b", paddingTop: 10 }}
            />
            <Line
              type="monotone"
              dataKey="Temperature"
              stroke="#f97316"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="Humidity"
              stroke="#38bdf8"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
