'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { AddonOption, CartItem, Dish, SizeOption } from '@/types/menu'

type AddToCartPayload = {
  dish: Dish
  size?: SizeOption
  addons?: AddonOption[]
  quantity?: number
}

type CartStore = {
  items: CartItem[]
  addToCart: (payload: AddToCartPayload) => void
  removeFromCart: (key: string) => void
  updateQuantity: (key: string, quantity: number) => void
  clearCart: () => void
}

const storage = createJSONStorage(() =>
  typeof window !== 'undefined' ? window.localStorage : undefined
)

const getUnitPrice = (
  dish: Dish,
  size?: SizeOption,
  addons: AddonOption[] = []
) => {
  const sizeDelta = size?.delta ?? 0
  const addonsTotal = addons.reduce((total, addon) => total + addon.price, 0)
  return dish.price + sizeDelta + addonsTotal
}

const buildKey = (
  dishId: number,
  sizeId: string,
  addons: AddonOption[] = []
) => {
  const addonKey = addons
    .map((addon) => addon.id)
    .sort()
    .join('|')
  return `${dishId}-${sizeId}-${addonKey}`
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addToCart: ({ dish, size, addons = [], quantity = 1 }) => {
        const sizeLabel = size?.label ?? 'Стандарт'
        const sizeId = size?.id ?? 'default'
        const key = buildKey(dish.id, sizeId, addons)
        const unitPrice = getUnitPrice(dish, size, addons)

        set((state) => {
          const existing = state.items.find((item) => item.key === key)
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.key === key
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            }
          }

          const nextItem: CartItem = {
            key,
            dishId: dish.id,
            name: dish.name,
            imageSrc: dish.imageSrc,
            sizeId,
            sizeLabel,
            addons,
            unitPrice,
            quantity,
          }

          return { items: [...state.items, nextItem] }
        })
      },
      removeFromCart: (key) =>
        set((state) => ({
          items: state.items.filter((item) => item.key !== key),
        })),
      updateQuantity: (key, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((item) => item.key !== key) }
          }
          return {
            items: state.items.map((item) =>
              item.key === key ? { ...item, quantity } : item
            ),
          }
        }),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
      storage,
      partialize: (state) => ({ items: state.items }),
    }
  )
)
