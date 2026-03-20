interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  pageSize: number;
  totalItems: number;
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  pageSize,
  totalItems,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  // Build page window: always show first, last, current ± 1, with ellipsis gaps
  const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("ellipsis-start");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    ) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("ellipsis-end");
    pages.push(totalPages);
  }

  const btn =
    "inline-flex items-center justify-center w-8 h-8 text-xs font-medium rounded transition-colors focus:outline-none";
  const active = `${btn} bg-indigo-600 text-white border border-indigo-500`;
  const inactive = `${btn} text-slate-400 hover:text-white hover:bg-white/8 border border-transparent`;
  const arrow =
    "inline-flex items-center gap-1.5 px-3 h-8 text-xs font-medium rounded border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed";

  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
      <span className="text-xs text-slate-500">
        Showing{" "}
        <span className="text-slate-300 font-medium">
          {from}–{to}
        </span>{" "}
        of <span className="text-slate-300 font-medium">{totalItems}</span>{" "}
        records
      </span>

      <div className="flex items-center gap-1">
        <button
          className={arrow}
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Prev
        </button>

        <div className="flex items-center gap-0.5 mx-1">
          {pages.map((p, i) =>
            p === "ellipsis-start" || p === "ellipsis-end" ? (
              <span
                key={p + i}
                className="w-8 text-center text-xs text-slate-600 select-none"
              >
                ···
              </span>
            ) : (
              <button
                key={p}
                className={p === page ? active : inactive}
                onClick={() => onPageChange(p as number)}
              >
                {p}
              </button>
            ),
          )}
        </div>

        <button
          className={arrow}
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
        >
          Next
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
