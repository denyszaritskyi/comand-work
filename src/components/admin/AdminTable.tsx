'use client'

import * as React from 'react'
import AdminDishForm from './AdminDishForm'

// --- Типи даних ---
type Addon = { id: string; label: string; price: number }
type Dish = {
  id: string | number
  name: string
  price: number
  description?: string
  category: string
  rating: number
  imageSrc: string
  reviewsCount?: number
  addons?: Addon[]
}

export const DISH_CATEGORIES = [
  'Сніданки',
  'Обіди',
  'Вечері',
  'Десерти',
  'Напої',
  'Бургери',
  'Піци',
  'Салати',
  'Паста',
]

// --- Пустий масив, тепер всі дані з API! ---
const initialData: Dish[] = []

function AdminDishCard({ dish }: { dish: Dish }) {
  return (
    <div className="group relative mx-auto max-w-[340px] overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow transition hover:-translate-y-1 hover:shadow-lg">
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <span className="rounded-full bg-zinc-900/90 px-2 py-[2px] text-xs font-medium text-white">
          {dish.category}
        </span>
        <span className="font-mono text-xs text-zinc-400 select-none">
          #{dish.id}
        </span>
      </div>
      <div className="relative h-32 w-full overflow-hidden">
        <img
          src={dish.imageSrc}
          alt={dish.name}
          className="h-full w-full object-cover transition group-hover:scale-105 group-hover:brightness-90"
        />
      </div>
      <div className="flex flex-col gap-1 p-3">
        {/* Назва і ціна */}
        <div className="mb-1 flex items-center justify-between">
          <span className="text-base leading-tight font-medium break-words text-zinc-900">
            {dish.name}
          </span>
          <span className="text-base font-semibold text-zinc-700">
            {dish.price}
            <span className="pl-1 text-xs font-normal text-zinc-400">грн</span>
          </span>
        </div>
        {/* Рейтинг + reviews */}
        <div className="mb-2 flex min-h-[20px] items-center gap-2">
          <span className="flex min-w-fit items-center gap-0.5 text-sm font-medium whitespace-nowrap text-amber-500">
            <svg
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="orange"
              className="inline-block align-middle"
              style={{ marginBottom: '2px' }}
            >
              <path
                d="M12 17.25l-6.16 3.73 1.64-7.03L2 
                9.24l7.19-.61L12 2.5 14.81 8.63 
                22 9.24l-5.48 4.71 1.64 7.03z"
              />
            </svg>
            <span className="align-middle">{dish.rating}</span>
          </span>
          {!!dish.reviewsCount && (
            <span className="min-w-fit pl-1 text-xs whitespace-nowrap text-zinc-400">
              ({dish.reviewsCount})
            </span>
          )}
        </div>
        {/* Добавки чіпами */}
        <div className="mb-2 flex max-w-full flex-wrap gap-1 gap-y-1">
          {dish.addons?.length ? (
            dish.addons.map((a) => (
              <span
                key={a.id}
                className="rounded-full border border-zinc-200 bg-zinc-100 px-2 py-[1.5px] text-xs leading-tight font-normal whitespace-nowrap text-zinc-700"
                title={`+${a.price}₴`}
              >
                {a.label}
                <span className="ml-1 font-medium text-zinc-400">
                  +{a.price}₴
                </span>
              </span>
            ))
          ) : (
            <span className="text-zinc-300">Без добавок</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminTable() {
  const [dishes, setDishes] = React.useState<Dish[]>(initialData)
  const [search, setSearch] = React.useState('')
  const [activeCategory, setActiveCategory] = React.useState<string>('Всі')

  // Fetch dishes from API on mount & after actions
  async function fetchDishes() {
    const res = await fetch('/api/dishes')
    const data = await res.json()
    setDishes(data)
  }
  React.useEffect(() => {
    fetchDishes()
  }, [])

  // Додавання
  async function handleAdd(dish: Omit<Dish, 'id'>) {
    await fetch('/api/dishes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dish),
    })
    fetchDishes()
  }

  // Фільтр/пошук
  const filteredDishes = dishes.filter((dish) => {
    const q = search.trim().toLowerCase()
    const cat = activeCategory !== 'Всі' ? activeCategory : ''
    const matchName = dish.name.toLowerCase().includes(q)
    const matchCat = dish.category.toLowerCase().includes(q)
    const inCat = !cat || dish.category === cat
    return (matchName || matchCat) && inCat
  })

  // Summary
  const total = filteredDishes.length
  const avgPrice = total
    ? Math.round(filteredDishes.reduce((acc, d) => acc + d.price, 0) / total)
    : 0

  return (
    <div className="mb-6 font-sans">
      {/* Форма */}
      <AdminDishForm onAdd={handleAdd} />
      {/* Фільтр категорій */}
      <div className="mt-3 mb-3 flex flex-wrap gap-2">
        {['Всі', ...DISH_CATEGORIES].map((cat) => (
          <button
            key={cat}
            className={`rounded-full px-4 py-1 text-base ${
              activeCategory === cat
                ? 'bg-black font-bold text-white shadow'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      {/* Summary без середнього рейтингу */}
      <div className="mb-5 flex flex-wrap items-center gap-6 rounded-2xl border border-zinc-100 bg-white/70 px-6 py-4 shadow-sm">
        <div className="text-[17px] font-medium text-zinc-700">
          Всього страв: <span className="font-bold text-zinc-900">{total}</span>
        </div>
        <div className="text-[17px] font-medium text-zinc-700">
          Середня ціна:{' '}
          <span className="font-bold text-black">{avgPrice} грн</span>
        </div>
      </div>
      {/* Пошук */}
      <div className="mb-3 flex items-center gap-2">
        <input
          type="text"
          className="w-[260px] rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm focus:ring-2 focus:ring-zinc-200 focus:outline-none"
          placeholder="Пошук страви або категорії..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            className="ml-2 text-xs text-zinc-400"
            onClick={() => setSearch('')}
            type="button"
          >
            Очистити
          </button>
        )}
      </div>
      {/* Картки */}
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredDishes.length > 0 ? (
          filteredDishes.map((dish) => (
            <AdminDishCard key={dish.id} dish={dish} />
          ))
        ) : (
          <div className="col-span-full py-8 text-center text-base text-zinc-400">
            Немає страв, які відповідають запиту.
          </div>
        )}
      </div>
    </div>
  )
}
