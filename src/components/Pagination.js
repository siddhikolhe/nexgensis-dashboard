export default function Pagination({ page, limit, total, onPageChange, onLimitChange }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  // Show at most 5 page numbers, centered on the current page.
  const pageNumbers = [];
  let from = Math.max(1, page - 2);
  let to = Math.min(totalPages, from + 4);
  from = Math.max(1, to - 4);
  for (let i = from; i <= to; i++) pageNumbers.push(i);

  return (
    <div className="flex flex-col gap-3 border-t bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-500">
        Showing {start}-{end} of {total}
      </p>

      <div className="flex items-center gap-2">
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="rounded-md border px-2 py-1 text-sm"
        >
          {[10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>

        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-md border px-2 py-1 text-sm disabled:opacity-40"
        >
          Previous
        </button>

        {pageNumbers.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`rounded-md border px-3 py-1 text-sm ${
              p === page ? "bg-sky-600 text-white" : "hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-md border px-2 py-1 text-sm disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
