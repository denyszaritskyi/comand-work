'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Clock, CheckCircle, ChefHat, Package } from 'lucide-react'
import { Order } from '@/types/menu'

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Отримуємо ID з localStorage
    const myOrderIds = JSON.parse(localStorage.getItem('my_orders') || '[]')

    if (myOrderIds.length === 0) {
      setLoading(false)
      return
    }

    const fetchStatus = async () => {
      try {
        // У реальному проекті треба ендпоінт /api/orders?ids=...
        // Тут для простоти беремо всі і фільтруємо
        const res = await fetch('/api/orders')
        if (res.ok) {
          const allOrders: Order[] = await res.json()
          // Фільтруємо ті, що належать юзеру, і сортуємо (нові зверху)
          const myOrders = allOrders
            .filter((o) => myOrderIds.includes(o.id))
            .sort((a, b) => b.createdAt - a.createdAt)

          setOrders(myOrders)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
    // Live update кожні 5 сек
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return (
          <span className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
            <Clock size={12} /> Очікує
          </span>
        )
      case 'cooking':
        return (
          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
            <ChefHat size={12} /> Готується
          </span>
        )
      case 'ready':
        return (
          <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
            <Package size={12} /> Готово до видачі
          </span>
        )
      case 'completed':
        return (
          <span className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-500">
            <CheckCircle size={12} /> Виконано
          </span>
        )
      case 'cancelled':
        return (
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
            Відмінено
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-bold text-zinc-500 transition hover:text-zinc-900"
          >
            <ArrowLeft size={18} /> До меню
          </Link>
          <h1 className="text-lg font-bold">Мої замовлення</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {loading ? (
          <div className="py-10 text-center text-zinc-400">Завантаження...</div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center text-zinc-400">
            У вас ще немає замовлень
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <div className="mb-1 text-xs font-bold text-zinc-400">
                      {new Date(order.createdAt).toLocaleDateString()} •{' '}
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <div className="text-lg font-bold">
                      Замовлення #{order.id.slice(-4)}
                    </div>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <div className="my-3 border-t border-dashed border-zinc-100"></div>

                <div className="mb-4 space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-zinc-600">
                        {item.quantity} x {item.name}
                      </span>
                      <span className="font-medium">
                        {item.unitPrice * item.quantity} ₴
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
                  <span className="text-sm font-bold text-zinc-500">Разом</span>
                  <span className="text-xl font-extrabold">
                    {order.total} ₴
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
