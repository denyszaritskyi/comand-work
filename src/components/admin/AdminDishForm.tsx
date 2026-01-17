'use client'

import React, { useState } from 'react'
import { DISH_CATEGORIES } from './AdminTable'
import type { Dish, AddonOption } from '@/types/menu'

type AdminDishFormProps = {
  initialData?: Dish | null
  onSave: (dish: Dish | Omit<Dish, 'id'>) => void
  onClose: () => void
}

export default function AdminDishForm({
  initialData,
  onSave,
  onClose,
}: AdminDishFormProps) {
  // --- ВИПРАВЛЕННЯ: Ініціалізуємо стейт відразу, без useEffect ---
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    price: initialData?.price || 0,
    category: initialData?.category || DISH_CATEGORIES[0],
    imageSrc: initialData?.imageSrc || '',
    description: initialData?.description || '',
    rating: initialData?.rating || 5,
    reviewsCount: initialData?.reviewsCount || 0,
    addons: initialData?.addons || ([] as AddonOption[]),
  })

  // Стейт для конструктора добавок
  const [addonLabel, setAddonLabel] = useState('')
  const [addonPrice, setAddonPrice] = useState('')

  // ... (решта функцій addAddon, removeAddon, handleSubmit залишаються без змін) ...

  const addAddon = () => {
    if (!addonLabel.trim() || !addonPrice || isNaN(Number(addonPrice))) return
    setFormData((fd) => ({
      ...fd,
      addons: [
        ...fd.addons,
        {
          id: `${addonLabel.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
          label: addonLabel.trim(),
          price: Number(addonPrice),
        },
      ],
    }))
    setAddonLabel('')
    setAddonPrice('')
  }

  const removeAddon = (idx: number) => {
    setFormData((fd) => ({
      ...fd,
      addons: fd.addons.filter((_, i) => i !== idx),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.price || !formData.category) return

    const result = initialData ? { ...formData, id: initialData.id } : formData
    onSave(result)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <form
        className="scrollbar-thin relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-100 bg-white p-6 shadow-2xl"
        onSubmit={handleSubmit}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-zinc-900">
            {initialData ? 'Редагувати страву' : 'Додати нову страву'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xl font-bold text-zinc-400 hover:text-zinc-600"
          >
            ✕
          </button>
        </div>

        {/* --- ТІЛО ФОРМИ (Те саме, що було раніше) --- */}
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Назва
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:ring-2 focus:ring-black/5"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Ціна (грн)
            </label>
            <input
              type="number"
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:ring-2 focus:ring-black/5"
              value={formData.price}
              min={1}
              onChange={(e) =>
                setFormData({ ...formData, price: Number(e.target.value) })
              }
              required
            />
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Категорія
            </label>
            <select
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:ring-2 focus:ring-black/5"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              {DISH_CATEGORIES.map((cat) => (
                <option value={cat} key={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Шлях до фото
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:ring-2 focus:ring-black/5"
              value={formData.imageSrc}
              onChange={(e) =>
                setFormData({ ...formData, imageSrc: e.target.value })
              }
              placeholder="/dishes/..."
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Опис
          </label>
          <textarea
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:ring-2 focus:ring-black/5"
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div className="mb-6 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
          <label className="mb-2 block text-sm font-semibold text-zinc-700">
            Конструктор добавок
          </label>
          <div className="mb-3 flex gap-2">
            <input
              type="text"
              value={addonLabel}
              onChange={(e) => setAddonLabel(e.target.value)}
              placeholder="Назва"
              className="flex-1 rounded border border-zinc-200 px-3 py-2 text-sm"
            />
            <input
              type="number"
              value={addonPrice}
              onChange={(e) => setAddonPrice(e.target.value)}
              placeholder="Ціна"
              className="w-24 rounded border border-zinc-200 px-3 py-2 text-sm"
            />
            <button
              type="button"
              className="rounded bg-zinc-900 px-4 py-2 text-sm font-bold text-white hover:bg-zinc-700"
              onClick={addAddon}
            >
              +
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.addons.map((a, idx) => (
              <span
                key={a.id}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm shadow-sm"
              >
                {a.label}{' '}
                <span className="font-bold text-zinc-600">+{a.price}₴</span>
                <button
                  type="button"
                  onClick={() => removeAddon(idx)}
                  className="ml-1 font-bold text-zinc-400 hover:text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-3 border-t border-zinc-100 pt-2">
          <button
            className="flex-1 rounded-xl bg-black px-6 py-3 text-base font-bold text-white shadow-lg transition hover:bg-zinc-800"
            type="submit"
          >
            {initialData ? 'Зберегти зміни' : 'Створити страву'}
          </button>
          <button
            className="px-6 py-3 text-base font-semibold text-zinc-500 transition hover:text-zinc-800"
            type="button"
            onClick={onClose}
          >
            Скасувати
          </button>
        </div>
      </form>
    </div>
  )
}
