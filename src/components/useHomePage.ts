'use client'

import { useEffect, useMemo, useState } from 'react'
import dishesData from '@/data/dishes.json'
import type { Dish, SizeOption } from '@/types/menu'

const sizeOptions: SizeOption[] = [
  { id: 's', label: 'Маленька', delta: -20 },
  { id: 'm', label: 'Стандарт', delta: 0 },
  { id: 'l', label: 'Велика', delta: 35 },
]

const dishes: Dish[] = dishesData

export function useHomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Всі')
  const [query, setQuery] = useState<string>('')
  const [sort, setSort] = useState<'asc' | 'desc'>('desc')
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

  return {
    categories,
    selectedCategory,
    setSelectedCategory,
    query,
    setQuery,
    sort,
    setSort,
    activeDish,
    selectedSize,
    setSelectedSize,
    selectedAddons,
    toggleAddon,
    totalPrice,
    openDish,
    closeDialog,
    sizeOptions,
    visible,
  }
}
