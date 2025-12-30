'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import CategoryNav from '@/components/CategoryNav'
import MenuCard from '@/components/MenuCard'
import dishesData from '@/data/dishes.json'

type Dish = {
  id: number
  name: string
  price: number
  description: string
  category: string
  imageSrc: string
  addons?: AddonOption[]
}

type SizeOption = {
  id: string
  label: string
  delta: number
}

type AddonOption = {
  id: string
  label: string
  price: number
}

const sizeOptions: SizeOption[] = [
  { id: 's', label: 'Маленька', delta: -20 },
  { id: 'm', label: 'Стандарт', delta: 0 },
  { id: 'l', label: 'Велика', delta: 35 },
]

const dishes: Dish[] = dishesData

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Всі')
  const [query, setQuery] = useState<string>('')
  const [sort, setSort] = useState<'asc' | 'desc'>('asc')
  const [activeDish, setActiveDish] = useState<Dish | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>('m')
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set())
  useEffect(() => {
    if (activeDish) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [activeDish])

  const categories = useMemo(
    () => ['Всі', ...Array.from(new Set(dishes.map((d) => d.category)))],
    []
  )

  const visible = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const filtered =
      selectedCategory === 'Всі'
        ? dishes
        : dishes.filter((d) => d.category === selectedCategory)
    const filteredByQuery = normalizedQuery
      ? filtered.filter((d) => d.name.toLowerCase().includes(normalizedQuery))
      : filtered
    const sorted = [...filteredByQuery].sort((a, b) =>
      sort === 'asc' ? a.price - b.price : b.price - a.price
    )
    return sorted
  }, [query, selectedCategory, sort])

  const totalPrice = useMemo(() => {
    if (!activeDish) return 0
    const sizeDelta =
      sizeOptions.find((option) => option.id === selectedSize)?.delta ?? 0
    const addonsTotal = (activeDish.addons ?? []).reduce((sum, addon) => {
      return selectedAddons.has(addon.id) ? sum + addon.price : sum
    }, 0)

    return activeDish.price + sizeDelta + addonsTotal
  }, [activeDish, selectedAddons, selectedSize])

  const openDish = (dish: Dish) => {
    setActiveDish(dish)
    setSelectedSize('m')
    setSelectedAddons(new Set())
  }

  const closeDialog = () => setActiveDish(null)

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="text-foreground min-h-screen bg-zinc-50 font-sans">
      <header className="relative mb-6 h-64 w-full overflow-hidden">
        <Image
          src="/pexels-pixabay-260922.jpg"
          alt="Restaurant header"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/40 to-transparent" />
        <div className="relative z-10 flex h-full flex-col justify-end px-4 pb-6 sm:px-8">
          <h1 className="text-3xl font-bold text-white">Наше меню</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/80">
            Смачні страви на будь-який смак: сніданки, обіди, вечері та десерти.
            Замовляйте та насолоджуйтеся!
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <CategoryNav
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

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
              onChange={(e) => setQuery(e.target.value)}
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
              onChange={(e) => setSort(e.target.value as 'asc' | 'desc')}
              className="border-border bg-background focus:ring-ring rounded-full border px-3 py-1 text-sm font-medium shadow-inner focus:ring-2 focus:outline-none"
            >
              <option value="asc">Ціна: за зростанням</option>
              <option value="desc">Ціна: за спаданням</option>
            </select>
          </div>
        </div>

        <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {visible.map((dish) => (
            <MenuCard
              key={dish.id}
              imageSrc={dish.imageSrc}
              name={dish.name}
              price={dish.price}
              description={dish.description}
              onSelect={() => openDish(dish)}
            />
          ))}
        </section>
      </main>

      {activeDish ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div
            className="absolute inset-0 cursor-pointer bg-black/60 backdrop-blur-sm"
            onClick={closeDialog}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={activeDish.name}
            className="bg-background relative z-10 w-full max-w-4xl overflow-hidden rounded-3xl shadow-2xl sm:max-h-[90vh]"
          >
            <div className="grid gap-0 sm:grid-cols-[1.1fr_1fr]">
              <div className="relative min-h-[260px] overflow-hidden sm:max-h-[90vh] sm:min-h-[480px]">
                <Image
                  src={activeDish.imageSrc}
                  alt={activeDish.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
              <div className="flex max-h-[90vh] flex-col gap-4 overflow-y-auto p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h2 className="text-lg leading-tight font-semibold">
                      {activeDish.name}
                    </h2>
                    <p className="text-muted-foreground text-sm leading-snug">
                      {activeDish.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeDialog}
                    className="text-muted-foreground hover:text-foreground ml-auto cursor-pointer rounded-full p-2 transition"
                    aria-label="Закрити"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-foreground text-sm font-semibold">
                    Розмір
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.map((option) => (
                      <label
                        key={option.id}
                        className={`border-border hover:border-foreground/40 flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${selectedSize === option.id ? 'bg-foreground text-background' : 'bg-muted'}`}
                      >
                        <input
                          type="radio"
                          name="size"
                          value={option.id}
                          checked={selectedSize === option.id}
                          onChange={() => setSelectedSize(option.id)}
                          className="hidden"
                        />
                        {option.label}
                        {option.delta !== 0
                          ? ` (${option.delta > 0 ? '+' : ''}${option.delta} грн)`
                          : ' (базова)'}
                      </label>
                    ))}
                  </div>
                </div>

                {activeDish.addons && activeDish.addons.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-foreground text-sm font-semibold">
                      Добавки
                    </p>
                    <div className="flex flex-col gap-2">
                      {activeDish.addons.map((addon) => (
                        <label
                          key={addon.id}
                          className="border-border bg-muted hover:border-foreground/40 flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-sm transition"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedAddons.has(addon.id)}
                              onChange={() => toggleAddon(addon.id)}
                              className="h-4 w-4 accent-current"
                            />
                            <span>{addon.label}</span>
                          </div>
                          <span className="font-medium">
                            +{addon.price} грн
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-auto flex flex-col gap-3">
                  <div className="flex items-center justify-between text-base font-semibold">
                    <span>Разом</span>
                    <span>{totalPrice} грн</span>
                  </div>
                  <button
                    type="button"
                    className="bg-foreground text-background hover:bg-foreground/90 focus-visible:ring-ring inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow transition focus-visible:ring-2 focus-visible:outline-none"
                  >
                    Додати в кошик
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
