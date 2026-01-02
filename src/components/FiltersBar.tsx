import { ArrowUpDown, Search } from 'lucide-react'

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
  const isDesc = sort === 'desc'
  const sortLabel = isDesc ? 'Спочатку дорогі' : 'Спочатку дешеві'

  const toggleSort = () => onSortChange(isDesc ? 'asc' : 'desc')

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-h-[52px] flex-1 items-center gap-3 rounded-full border border-zinc-200 bg-white px-4 py-3 shadow-[0_6px_24px_rgba(15,23,42,0.06)] focus-within:ring-2 focus-within:ring-zinc-200">
        <Search className="h-5 w-5 text-zinc-400" aria-hidden />
        <input
          id="search"
          type="search"
          placeholder="Я шукаю..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full bg-transparent text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none"
        />
      </div>

      <button
        type="button"
        onClick={toggleSort}
        aria-pressed={isDesc}
        className="inline-flex min-h-[52px] items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 shadow-[0_6px_24px_rgba(15,23,42,0.06)] transition duration-150 hover:shadow-[0_8px_28px_rgba(15,23,42,0.09)] focus-visible:ring-2 focus-visible:ring-zinc-200 focus-visible:outline-none"
      >
        <ArrowUpDown className="h-5 w-5" aria-hidden />
        <span>{sortLabel}</span>
      </button>
    </div>
  )
}
