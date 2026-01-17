'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ShoppingBag,
  MapPin,
  ScanLine,
  Utensils,
} from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'
import { useCartStore } from '@/store/cartStore'

export default function OrdersPage() {
  const { items, clearCart, tableId } = useCartStore()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [items]
  )

  const handleConfirmOrder = async () => {
    if (items.length === 0) return
    if (!tableId) {
      alert('Будь ласка, відскануйте QR-код на столі ще раз!')
      return
    }
    setIsSubmitting(true)

    const newOrder = {
      id: Date.now().toString(),
      createdAt: Date.now(),
      items: items,
      total: total,
      status: 'new',
      tableNumber: tableId,
    }

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      })

      const history = JSON.parse(localStorage.getItem('my_orders') || '[]')
      history.push(newOrder.id)
      localStorage.setItem('my_orders', JSON.stringify(history))

      clearCart()
      router.push('/my-orders')
    } catch (error) {
      console.error('Помилка:', error)
      setIsSubmitting(false)
    }
  }

  if (!mounted) return <div className="min-h-screen bg-zinc-50" />

  if (mounted && !tableId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4 text-center">
        <div className="mb-6 animate-pulse rounded-full bg-zinc-100 p-6">
          <ScanLine size={64} className="text-zinc-400" />
        </div>
        <h1 className="mb-3 text-2xl font-bold text-zinc-900">
          Стіл не визначено
        </h1>
        <p className="mb-8 max-w-xs leading-relaxed text-zinc-500">
          Щоб ми знали, куди принести замовлення, будь ласка,
          <strong> відскануйте QR-код </strong> на вашому столику.
        </p>
        <Link
          href="/"
          className="rounded-xl bg-zinc-900 px-8 py-4 font-bold text-white shadow-lg shadow-zinc-900/20 transition-all active:scale-95"
        >
          Повернутися до меню
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-32 font-sans text-zinc-900">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-bold text-zinc-500 transition hover:text-zinc-900"
          >
            <ArrowLeft size={18} /> Меню
          </Link>
          <h1 className="text-lg font-bold">Ваше замовлення</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-6">
        {items.length === 0 ? (
          <div className="py-20 text-center">
            <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-zinc-200" />
            <p className="font-medium text-zinc-500">Кошик порожній</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Блок столика */}
            <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-emerald-50 bg-emerald-100 text-emerald-600">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                    Ваш столик
                  </p>
                  <p className="text-3xl leading-none font-extrabold text-zinc-900">
                    #{tableId}
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-400">
                Автоматично визначено
              </div>
            </div>

            {/* Список страв */}
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50/50 p-4 text-xs font-bold tracking-wider text-zinc-500 uppercase">
                <ShoppingBag size={14} /> Позиції у замовленні ({items.length})
              </div>
              <div className="divide-y divide-zinc-100">
                {items.map((item) => (
                  <div key={item.key} className="flex gap-4 p-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-zinc-100 bg-zinc-100">
                      <Image
                        src={item.imageSrc}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-start justify-between">
                        <p className="truncate pr-2 text-sm font-bold text-zinc-900">
                          {item.name}
                        </p>
                        <p className="text-sm font-bold whitespace-nowrap text-zinc-900">
                          {item.unitPrice * item.quantity} ₴
                        </p>
                      </div>
                      <p className="mb-1 text-xs font-medium text-zinc-500">
                        {item.quantity} шт • {item.sizeLabel}
                      </p>
                      {item.addons.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.addons.map((a) => (
                            <span
                              key={a.id}
                              className="rounded border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500"
                            >
                              +{a.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Футер */}
            <div className="fixed bottom-0 left-0 z-30 w-full border-t border-zinc-200 bg-white p-4 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
              <div className="mx-auto max-w-xl">
                <div className="mb-4 flex items-end justify-between">
                  <span className="mb-1 text-sm font-medium text-zinc-500">
                    До сплати (оплата при закритті)
                  </span>
                  <span className="text-3xl font-extrabold text-zinc-900">
                    {total} ₴
                  </span>
                </div>

                <button
                  onClick={handleConfirmOrder}
                  disabled={isSubmitting}
                  className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-zinc-900 font-bold text-white shadow-lg shadow-zinc-900/20 transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">Відправка на кухню...</span>
                  ) : (
                    <>
                      {/* ІКОНКА ЗМІНЕНА ТУТ */}
                      <Utensils size={20} />
                      <span>Замовити</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
