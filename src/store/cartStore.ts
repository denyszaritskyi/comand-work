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
  tableId: string | null // <--- НОВЕ ПОЛЕ
  setTableId: (id: string) => void // <--- НОВА ДІЯ
  addToCart: (payload: AddToCartPayload) => void
  removeFromCart: (key: string) => void
  updateQuantity: (key: string, quantity: number) => void
  clearCart: () => void
}

const storage = createJSONStorage(() => {
  if (typeof window !== 'undefined') {
    return window.localStorage
  }
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  }
})

// ... (функції getUnitPrice та buildKey залишаються без змін) ...
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
      tableId: null, // Початкове значення
      setTableId: (id) => set({ tableId: id }), // Функція встановлення

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
      clearCart: () => set({ items: [] }), // tableId не очищуємо, бо людина все ще за столом
    }),
    {
      name: 'cart-storage',
      storage,
      partialize: (state) => ({ items: state.items, tableId: state.tableId }), // Зберігаємо tableId
    }
  )
)
