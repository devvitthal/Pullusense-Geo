import { useState } from "react";
import type { SensorReading } from "../types";
import { getAQILevel, formatCreatedAt } from "../utils/aqi";
import Pagination from "./Pagination";

const PAGE_SIZE = 15;

interface HistoryTableProps {
  data: SensorReading[];
}

export default function HistoryTable({ data }: HistoryTableProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));

  // Reset to page 1 when data length changes (new refresh)
  const safeData = data;
  const safePage = Math.min(page, totalPages);

  const rows = safeData.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const COLS = [
    "Recorded At",
    "AQI",
    "Status",
    "Temp (°C)",
    "Humidity (%)",
    "Latitude",
    "Longitude",
    "Location",
  ];

  return (
    <div className="panel overflow-hidden">
      {/* Table header */}
      <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-200">Reading History</p>
        <span className="text-xs text-slate-500 tabular-nums">
          {data.length.toLocaleString()} total records
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              {COLS.map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {rows.map((r) => {
              const level = getAQILevel(r.aqi);
              return (
                <tr
                  key={r.id}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap text-xs tabular-nums">
                    {formatCreatedAt(r.createdAt)}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span
                      className="font-bold tabular-nums"
                      style={{ color: level.color }}
                    >
                      {r.aqi}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span
                      className="text-xs px-2 py-0.5 rounded font-medium"
                      style={{
                        color: level.color,
                        background: `${level.color}15`,
                        border: `1px solid ${level.color}30`,
                      }}
                    >
                      {level.label}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-300 whitespace-nowrap tabular-nums">
                    {r.temperature.toFixed(1)}
                  </td>
                  <td className="px-4 py-2.5 text-slate-300 whitespace-nowrap tabular-nums">
                    {r.humidity.toFixed(1)}
                  </td>
                  <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap tabular-nums text-xs">
                    {r.latitude != null ? (
                      r.latitude.toFixed(5)
                    ) : (
                      <span className="text-slate-700">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap tabular-nums text-xs">
                    {r.longitude != null ? (
                      r.longitude.toFixed(5)
                    ) : (
                      <span className="text-slate-700">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-slate-400 whitespace-nowrap text-xs max-w-[180px] truncate">
                    {r.locationName ?? (
                      <span className="text-slate-700">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-5 py-3">
          <Pagination
            page={safePage}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
            pageSize={PAGE_SIZE}
            totalItems={data.length}
          />
        </div>
      )}
    </div>
  );
}
