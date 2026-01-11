'use client'

import React, { useState } from 'react'
import { DISH_CATEGORIES } from './AdminTable'

// Типи
type Addon = { id: string; label: string; price: number }
type DishFormState = {
  name: string
  price: number
  category: string
  imageSrc: string
  addons: Addon[]
}

export default function AdminDishForm({
  onAdd,
}: {
  onAdd: (dish: DishFormState) => void
}) {
  const [formData, setFormData] = useState<DishFormState>({
    name: '',
    price: 0,
    category: DISH_CATEGORIES[0],
    imageSrc: '',
    addons: [],
  })
  const [addonLabel, setAddonLabel] = useState('')
  const [addonPrice, setAddonPrice] = useState('')
  const [showForm, setShowForm] = useState(false)

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
    onAdd(formData)
    setFormData({
      name: '',
      price: 0,
      category: DISH_CATEGORIES[0],
      imageSrc: '',
      addons: [],
    })
    setShowForm(false)
  }

  return (
    <div className="mb-8">
      {!showForm && (
        <button
          className="rounded-lg bg-black px-5 py-2 text-base font-semibold text-white shadow transition hover:bg-zinc-800"
          onClick={() => setShowForm(true)}
          type="button"
        >
          + Додати страву
        </button>
      )}

      {showForm && (
        <form
          className="mt-4 w-full max-w-xl rounded-2xl border border-zinc-100 bg-white p-7 shadow-xl"
          onSubmit={handleSubmit}
        >
          <h2 className="mb-6 text-xl font-bold text-zinc-900">
            Додати страву
          </h2>
          <div className="mb-4">
            <label className="mb-1 block text-[15px] font-medium text-zinc-700">
              Назва
            </label>
            <input
              type="text"
              className="w-full rounded border border-zinc-200 bg-zinc-50 px-3 py-2 text-base"
              value={formData.name}
              onChange={(e) =>
                setFormData((fd) => ({ ...fd, name: e.target.value }))
              }
              placeholder="Назва страви"
              required
            />
          </div>
          <div className="mb-4 flex gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-[15px] font-medium text-zinc-700">
                Ціна
              </label>
              <input
                type="number"
                className="w-full rounded border border-zinc-200 bg-zinc-50 px-3 py-2 text-base"
                value={formData.price}
                min={1}
                onChange={(e) =>
                  setFormData((fd) => ({
                    ...fd,
                    price: Number(e.target.value),
                  }))
                }
                placeholder="грн"
                required
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-[15px] font-medium text-zinc-700">
                Категорія
              </label>
              <select
                className="w-full rounded border border-zinc-200 bg-zinc-50 px-3 py-2 text-base"
                value={formData.category}
                onChange={(e) =>
                  setFormData((fd) => ({ ...fd, category: e.target.value }))
                }
              >
                {DISH_CATEGORIES.map((cat) => (
                  <option value={cat} key={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-4 flex gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-[15px] font-medium text-zinc-700">
                Фото (шлях)
              </label>
              <input
                type="text"
                className="w-full rounded border border-zinc-200 bg-zinc-50 px-3 py-2 text-base"
                value={formData.imageSrc}
                onChange={(e) =>
                  setFormData((fd) => ({ ...fd, imageSrc: e.target.value }))
                }
                placeholder="/dishes/omlet.avif"
              />
            </div>
          </div>
          {/* ДОДАВАННЯ ДОБАВОК */}
          <div className="mb-6">
            <label className="mb-1 block text-[15px] font-medium text-zinc-700">
              Добавки
            </label>
            <div className="mb-2 flex flex-wrap gap-2">
              <input
                type="text"
                value={addonLabel}
                onChange={(e) => setAddonLabel(e.target.value)}
                placeholder="Назва"
                className="w-40 rounded border border-zinc-200 bg-zinc-50 px-2 py-2 text-sm"
              />
              <input
                type="number"
                value={addonPrice}
                min="1"
                onChange={(e) => setAddonPrice(e.target.value)}
                placeholder="Ціна"
                className="w-24 rounded border border-zinc-200 bg-zinc-50 px-2 py-2 text-sm"
              />
              <button
                className="rounded bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
                type="button"
                onClick={addAddon}
              >
                Додати
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.addons.length > 0 ? (
                formData.addons.map((a, idx) => (
                  <span
                    key={a.id}
                    className="flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-[2px] text-sm font-medium text-zinc-800"
                  >
                    {a.label}
                    <span className="text-zinc-500">+{a.price}₴</span>
                    <button
                      type="button"
                      title="Видалити"
                      onClick={() => removeAddon(idx)}
                      className="ml-1 px-1 text-zinc-400 hover:text-red-400"
                    >
                      &times;
                    </button>
                  </span>
                ))
              ) : (
                <span className="px-2 py-1 text-zinc-400">Немає</span>
              )}
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button
              className="flex-1 rounded-lg bg-black px-6 py-2 text-[16px] font-bold text-white transition hover:bg-zinc-800"
              type="submit"
            >
              Зберегти
            </button>
            <button
              className="flex-1 rounded-lg bg-zinc-100 px-6 py-2 text-[16px] font-bold text-zinc-500 transition hover:bg-zinc-200"
              type="button"
              onClick={() => setShowForm(false)}
            >
              Скасувати
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
