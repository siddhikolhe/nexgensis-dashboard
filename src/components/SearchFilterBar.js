"use client";

const SORT_OPTIONS = [
  { value: "", label: "Sort by" },
  { value: "title-asc", label: "Title (A-Z)" },
  { value: "title-desc", label: "Title (Z-A)" },
  { value: "price-asc", label: "Price (low-high)" },
  { value: "price-desc", label: "Price (high-low)" },
  { value: "rating-desc", label: "Rating (high-low)" },
];

export default function SearchFilterBar({
  searchInput,
  onSearchChange,
  category,
  onCategoryChange,
  categories,
  sort,
  onSortChange,
  onReset,
}) {
  const isSearching = searchInput.trim().length > 0;

  return (
    <div className="flex flex-col gap-3 border-b bg-white p-4 sm:flex-row sm:items-center">
      <div className="relative w-full sm:max-w-xs">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        >
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
          <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded-md border py-2 pl-9 pr-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          disabled={isSearching}
          title={
            isSearching
              ? "Clear the search box to filter by category"
              : undefined
          }
          className="rounded-md border px-2 py-2 text-sm disabled:cursor-not-allowed disabled:bg-gray-100"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="rounded-md border px-2 py-2 text-sm"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onReset}
          className="rounded-md border px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Reset
        </button>

        {isSearching && (
          <span className="text-xs text-gray-400">
            Category filter is disabled while searching - DummyJSON's API
            can&apos;t search and filter by category at the same time.
          </span>
        )}
      </div>
    </div>
  );
}
