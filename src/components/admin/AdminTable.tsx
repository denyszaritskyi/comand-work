'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  LayoutDashboard,
  BarChart3,
  ArrowUpDown,
  ChevronDown,
  Check,
  X,
  Star,
  ChefHat,
  QrCode,
} from 'lucide-react'
import AdminDishForm from './AdminDishForm'
import type { Dish } from '@/types/menu'

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

const SORT_OPTIONS = [
  { value: 'newest', label: 'Спочатку нові' },
  { value: 'price-asc', label: 'Спочатку дешеві' },
  { value: 'price-desc', label: 'Спочатку дорогі' },
  { value: 'rating-desc', label: 'За рейтингом' },
  { value: 'name-asc', label: 'За назвою (А-Я)' },
] as const

type SortType = (typeof SORT_OPTIONS)[number]['value']

// --- 1. МОДАЛЬНЕ ВІКНО ПЕРЕГЛЯДУ (AdminDishDialog) ---
function AdminDishDialog({
  dish,
  onClose,
  onEdit,
  onDelete,
}: {
  dish: Dish
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      {/* Backdrop */}
      <div
        className="animate-in fade-in absolute inset-0 cursor-pointer bg-black/60 backdrop-blur-sm duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        role="dialog"
        className="animate-in zoom-in-95 relative z-10 w-full max-w-4xl overflow-hidden rounded-3xl border-2 border-zinc-200 bg-white shadow-2xl duration-200 sm:max-h-[90vh]"
      >
        {/* Кнопка закриття */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-zinc-900 shadow-md backdrop-blur transition hover:scale-110 hover:bg-white"
        >
          <X size={20} />
        </button>

        <div className="grid gap-0 sm:grid-cols-[1.1fr_1fr]">
          {/* Ліва колонка: Фото */}
          <div className="relative min-h-[260px] overflow-hidden sm:max-h-[90vh] sm:min-h-[480px]">
            {dish.imageSrc ? (
              <img
                src={dish.imageSrc}
                alt={dish.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-zinc-100 font-medium text-zinc-400">
                Фото відсутнє
              </div>
            )}

            {/* Бейджі поверх фото */}
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
              <div className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold shadow-sm backdrop-blur">
                {dish.category}
              </div>
              {dish.rating > 0 && (
                <div className="flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-black shadow-sm">
                  <span>★ {dish.rating}</span>
                </div>
              )}
            </div>
          </div>

          {/* Права колонка: Інфо + Дії */}
          <div className="flex max-h-[90vh] flex-col gap-5 overflow-y-auto bg-white p-5 sm:p-8">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-2xl leading-tight font-bold text-zinc-900 sm:text-3xl">
                  {dish.name}
                </h2>
                <span className="text-2xl font-bold whitespace-nowrap text-emerald-600">
                  {dish.price} ₴
                </span>
              </div>
              <p className="text-base leading-relaxed text-zinc-500">
                {dish.description || 'Опис для цієї страви ще не додано.'}
              </p>
            </div>

            {/* Блок добавок */}
            <div className="space-y-3">
              <p className="flex items-center gap-2 text-sm font-bold text-zinc-900">
                <Plus size={16} className="text-zinc-400" />
                Доступні добавки
              </p>
              {dish.addons && dish.addons.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {dish.addons.map((addon) => (
                    <div
                      key={addon.id}
                      className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/50 px-3 py-2.5"
                    >
                      <span className="text-sm font-medium text-zinc-700">
                        {addon.label}
                      </span>
                      <span className="text-sm font-bold text-emerald-600">
                        +{addon.price} ₴
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-3 text-center text-sm text-zinc-400">
                  Добавок немає
                </div>
              )}
            </div>

            {/* Footer з кнопками дій */}
            <div className="mt-auto grid grid-cols-2 gap-3 pt-4">
              <button
                type="button"
                onClick={onEdit}
                className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3.5 text-sm font-bold text-white shadow-lg shadow-zinc-900/10 transition hover:-translate-y-0.5 hover:bg-zinc-800 active:scale-95"
              >
                <Pencil size={18} />
                Редагувати
              </button>

              <button
                type="button"
                onClick={onDelete}
                className="flex items-center justify-center gap-2 rounded-xl bg-red-50 py-3.5 text-sm font-bold text-red-600 transition hover:bg-red-100 hover:text-red-700 active:scale-95"
              >
                <Trash2 size={18} />
                Видалити
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- 2. КАРТКА СТРАВИ ---
function AdminDishCard({
  dish,
  onSelect,
}: {
  dish: Dish
  onSelect: () => void
}) {
  return (
    <div
      onClick={onSelect}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] active:scale-[0.98]"
    >
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-zinc-900 shadow-sm backdrop-blur-md">
          {dish.category}
        </span>
      </div>

      <div className="relative h-56 w-full shrink-0 overflow-hidden bg-zinc-100">
        {dish.imageSrc ? (
          <img
            src={dish.imageSrc}
            alt={dish.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-300">
            No Image
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="text-lg leading-tight font-bold text-zinc-900 transition-colors group-hover:text-black">
            {dish.name}
          </h3>
          <span className="shrink-0 text-lg font-bold text-emerald-600">
            {dish.price} ₴
          </span>
        </div>

        <p className="mb-3 line-clamp-2 text-sm text-zinc-500">
          {dish.description || 'Опис відсутній...'}
        </p>

        <div className="mt-auto flex flex-wrap gap-1.5">
          {dish.rating > 0 && (
            <span className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700">
              <Star size={10} fill="currentColor" /> {dish.rating}
            </span>
          )}
          {dish.addons && dish.addons.length > 0 ? (
            <span className="rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-600">
              {dish.addons.length} добавок
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}

// --- 3. ГОЛОВНИЙ КОМПОНЕНТ ---
export default function AdminTable() {
  const [dishes, setDishes] = React.useState<Dish[]>([])

  // Фільтри
  const [search, setSearch] = React.useState('')
  const [activeCategory, setActiveCategory] = React.useState<string>('Всі')
  const [sortType, setSortType] = React.useState<SortType>('newest')
  const [isSortOpen, setIsSortOpen] = React.useState(false)

  // Модальні вікна
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [viewingDish, setViewingDish] = React.useState<Dish | null>(null)
  const [editingDish, setEditingDish] = React.useState<Dish | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<number | null>(
    null
  )

  // Fetch
  async function fetchDishes() {
    try {
      const res = await fetch('/api/dishes')
      const data = await res.json()
      setDishes(data)
    } catch (error) {
      console.error('Failed to fetch dishes', error)
    }
  }

  React.useEffect(() => {
    fetchDishes()
  }, [])

  // --- Handlers ---
  const handleCreate = () => {
    setEditingDish(null)
    setViewingDish(null)
    setIsFormOpen(true)
  }

  const handleCardClick = (dish: Dish) => {
    setViewingDish(dish)
  }

  const handleEditFromView = () => {
    if (!viewingDish) return
    const dishToEdit = viewingDish
    setViewingDish(null)
    setEditingDish(dishToEdit)
    setIsFormOpen(true)
  }

  const handleDeleteFromView = () => {
    if (!viewingDish) return
    const idToDelete = Number(viewingDish.id)
    setViewingDish(null)
    setDeleteConfirmId(idToDelete)
  }

  const handleSave = async (dishData: Dish | Omit<Dish, 'id'>) => {
    const method = editingDish ? 'PUT' : 'POST'
    await fetch('/api/dishes', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dishData),
    })
    setIsFormOpen(false)
    setEditingDish(null)
    fetchDishes()
  }

  const executeDelete = async () => {
    if (!deleteConfirmId) return
    await fetch('/api/dishes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deleteConfirmId }),
    })
    setDeleteConfirmId(null)
    fetchDishes()
  }

  const processedDishes = React.useMemo(() => {
    const result = dishes.filter((dish) => {
      const q = search.trim().toLowerCase()
      const cat = activeCategory !== 'Всі' ? activeCategory : ''
      const matchName = dish.name.toLowerCase().includes(q)
      const inCat = !cat || dish.category === cat
      return matchName && inCat
    })

    result.sort((a, b) => {
      switch (sortType) {
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'rating-desc':
          return (b.rating || 0) - (a.rating || 0)
        case 'newest':
        default:
          return (b.id as number) - (a.id as number)
      }
    })

    return result
  }, [dishes, search, activeCategory, sortType])

  return (
    <div className="min-h-screen bg-zinc-50/30 pb-20 font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white shadow-lg shadow-zinc-200">
              <LayoutDashboard size={20} />
            </div>
            <h1 className="hidden text-xl font-bold text-zinc-900 sm:block">
              Адмін-панель
            </h1>
          </div>

          <div className="flex gap-3">
            {/* Нова кнопка QR */}
            <Link
              href="/admin/qr"
              className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-bold text-zinc-700 shadow-sm transition hover:bg-zinc-50"
            >
              <QrCode size={18} />
              <span>QR Столів</span>
            </Link>
            {/* КНОПКА ПЕРЕХОДУ НА КУХНЮ */}
            <Link
              href="/admin/kitchen"
              className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-bold text-zinc-700 shadow-sm transition hover:bg-zinc-50"
            >
              <ChefHat size={18} />
              <span>Екран Кухні</span>
            </Link>

            <Link
              href="/admin/analytics"
              className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-bold text-zinc-700 shadow-sm transition hover:bg-zinc-50"
            >
              <BarChart3 size={18} />
              <span>Аналітика</span>
            </Link>

            <button
              onClick={handleCreate}
              className="flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-zinc-900/10 transition hover:-translate-y-0.5 hover:bg-zinc-800"
            >
              <Plus size={18} />
              <span>Додати страву</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-6">
        {/* CATEGORY NAV */}
        <div className="-mx-4 mb-6 px-4">
          <div className="scrollbar-hide flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveCategory('Всі')}
              className={
                activeCategory === 'Всі'
                  ? 'cursor-pointer snap-start rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium whitespace-nowrap text-white shadow-md transition-all'
                  : 'cursor-pointer snap-start rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium whitespace-nowrap text-zinc-700 transition hover:bg-zinc-100'
              }
            >
              Всі
            </button>
            {DISH_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={
                  activeCategory === cat
                    ? 'cursor-pointer snap-start rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium whitespace-nowrap text-white shadow-md transition-all'
                    : 'cursor-pointer snap-start rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium whitespace-nowrap text-zinc-700 transition hover:bg-zinc-100'
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FILTERS */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-h-[52px] flex-1 items-center gap-3 rounded-full border border-zinc-200 bg-white px-5 py-3 shadow-[0_6px_24px_rgba(15,23,42,0.06)] transition-all focus-within:ring-2 focus-within:ring-zinc-200">
            <Search className="h-5 w-5 text-zinc-400" />
            <input
              type="search"
              placeholder="Я шукаю..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none"
            />
          </div>

          <div className="relative shrink-0">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="inline-flex min-h-[52px] w-full items-center justify-between gap-3 rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 shadow-[0_6px_24px_rgba(15,23,42,0.06)] transition hover:shadow-[0_8px_28px_rgba(15,23,42,0.09)] focus-visible:ring-2 focus-visible:ring-zinc-200 active:scale-95 sm:w-auto"
            >
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-zinc-400" />
                <span>
                  {SORT_OPTIONS.find((o) => o.value === sortType)?.label}
                </span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-zinc-400 transition-transform ${isSortOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {isSortOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsSortOpen(false)}
                />
                <div className="animate-in fade-in zoom-in-95 absolute top-full right-0 z-30 mt-2 w-full origin-top-right overflow-hidden rounded-2xl border border-zinc-100 bg-white p-1.5 shadow-xl ring-1 shadow-zinc-200/50 ring-black/5 duration-200 sm:w-60">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortType(option.value)
                        setIsSortOpen(false)
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors ${sortType === option.value ? 'bg-zinc-100 font-bold text-zinc-900' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'}`}
                    >
                      {option.label}
                      {sortType === option.value && <Check size={16} />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {processedDishes.length > 0 ? (
            processedDishes.map((dish) => (
              <AdminDishCard
                key={dish.id}
                dish={dish}
                onSelect={() => handleCardClick(dish)}
              />
            ))
          ) : (
            <div className="col-span-full rounded-3xl border-2 border-dashed border-zinc-100 py-12 text-center text-zinc-400">
              Нічого не знайдено
            </div>
          )}
        </div>
      </main>

      {/* --- МОДАЛЬНІ ВІКНА --- */}

      {/* 1. Перегляд страви */}
      {viewingDish && (
        <AdminDishDialog
          dish={viewingDish}
          onClose={() => setViewingDish(null)}
          onEdit={handleEditFromView}
          onDelete={handleDeleteFromView}
        />
      )}

      {/* 2. Форма Редагування/Створення */}
      {isFormOpen && (
        <AdminDishForm
          key={editingDish ? editingDish.id : 'create-new'}
          initialData={editingDish}
          onSave={handleSave}
          onClose={() => setIsFormOpen(false)}
        />
      )}

      {/* 3. Підтвердження видалення */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteConfirmId(null)}
          />
          <div className="animate-in zoom-in-95 relative z-10 w-full max-w-sm overflow-hidden rounded-3xl bg-white p-6 shadow-2xl duration-200">
            <h3 className="mb-2 text-xl font-bold text-zinc-900">
              Видалити страву?
            </h3>
            <p className="mb-6 text-sm text-zinc-500">
              Цю дію неможливо скасувати.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 rounded-xl bg-zinc-100 px-4 py-3 text-sm font-bold text-zinc-600 hover:bg-zinc-200"
              >
                Скасувати
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700"
              >
                Видалити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
