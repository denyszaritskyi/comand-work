'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
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
}

const dishes: Dish[] = dishesData

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Всі')

  const categories = useMemo(
    () => ['Всі', ...Array.from(new Set(dishes.map((d) => d.category)))],
    []
  )

  const visible = useMemo(() => {
    if (selectedCategory === 'Всі') return dishes
    return dishes.filter((d) => d.category === selectedCategory)
  }, [selectedCategory])

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

        <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {visible.map((dish) => (
            <MenuCard
              key={dish.id}
              imageSrc={dish.imageSrc}
              name={dish.name}
              price={dish.price}
              description={dish.description}
            />
          ))}
        </section>
      </main>
    </div>
  )
}
