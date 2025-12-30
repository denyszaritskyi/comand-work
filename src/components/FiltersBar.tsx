type Props = {
  query: string
  sort: 'asc' | 'desc'
  onQueryChange: (value: string) => void
  onSortChange: (value: 'asc' | 'desc') => void
}

export default function FiltersBar({
  query,
  sort,
  onQueryChange,
  onSortChange,
}: Props) {
  return (
    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="border-border bg-background focus-within:ring-ring flex items-center gap-2 rounded-full border px-4 py-2 shadow-inner focus-within:ring-2">
        <label
          className="text-muted-foreground text-sm font-medium"
          htmlFor="search"
        >
          Пошук:
        </label>
        <input
          id="search"
          type="search"
          placeholder="Введіть назву страви"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="placeholder:text-muted-foreground/70 bg-transparent text-sm outline-none"
        />
      </div>

      <div className="border-border bg-card flex items-center gap-2 rounded-full border px-3 py-2 shadow-sm">
        <label
          className="text-muted-foreground text-sm font-medium"
          htmlFor="sort"
        >
          Сортування:
        </label>
        <select
          id="sort"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as 'asc' | 'desc')}
          className="border-border bg-background focus:ring-ring rounded-full border px-3 py-1 text-sm font-medium shadow-inner focus:ring-2 focus:outline-none"
        >
          <option value="asc">Ціна: за зростанням</option>
          <option value="desc">Ціна: за спаданням</option>
        </select>
      </div>
    </div>
  )
}
