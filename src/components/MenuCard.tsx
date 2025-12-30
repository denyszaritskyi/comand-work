import Image from 'next/image'
import type { KeyboardEvent } from 'react'

type Props = {
  imageSrc: string
  name: string
  price: number
  description: string
  onSelect?: () => void
}

export default function MenuCard({
  imageSrc,
  name,
  price,
  description,
  onSelect,
}: Props) {
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect?.()
    }
  }

  return (
    <article
      className="group border-border bg-card text-card-foreground focus-within:ring-ring flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border shadow-sm transition focus-within:ring-2 hover:-translate-y-0.5 hover:shadow-md"
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="relative aspect-4/3 w-full overflow-hidden">
        <Image
          src={imageSrc}
          alt={name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={false}
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm leading-tight font-semibold">{name}</h3>
          <span className="text-sm font-bold whitespace-nowrap">
            {price} грн
          </span>
        </div>
        <p className="text-muted-foreground line-clamp-2 text-xs">
          {description}
        </p>
        <button
          type="button"
          className="bg-foreground text-background hover:bg-foreground/90 focus-visible:ring-ring mt-auto flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold shadow-sm transition focus-visible:ring-2 focus-visible:outline-none"
        >
          Додати в кошик
        </button>
      </div>
    </article>
  )
}
