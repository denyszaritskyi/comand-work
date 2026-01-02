type Props = {
  categories: string[]
  selected: string
  onSelect: (category: string) => void
}

export default function CategoryNav({ categories, selected, onSelect }: Props) {
  return (
    <nav className="bg-background/90 supports-backdrop-filter:bg-background/70 sticky top-0 z-20 backdrop-blur">
      <div className="-mx-4 px-4">
        <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pt-3 pb-2">
          {categories.map((cat) => {
            const active = cat === selected
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelect(cat)}
                className={
                  active
                    ? 'bg-foreground text-background cursor-pointer snap-start rounded-full px-4 py-2 text-sm whitespace-nowrap shadow transition-all'
                    : 'bg-muted text-foreground hover:bg-muted/90 cursor-pointer snap-start rounded-full px-4 py-2 text-sm whitespace-nowrap transition'
                }
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
