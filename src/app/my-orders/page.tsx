'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Clock, CheckCircle, ChefHat, Package } from 'lucide-react'
import { Order } from '@/types/menu'

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  // --- Діалог оплати ---
  const [payOrder, setPayOrder] = useState<Order | null>(null)
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])

  // --- Фінальний чек/оплата ---
  const [showPayConfirm, setShowPayConfirm] = useState(false)
  type PaySummaryItem = import('@/types/menu').CartItem & {
    orderId: string | number
  }
  const [paySummary, setPaySummary] = useState<{
    items: PaySummaryItem[]
    total: number
    orderId: string | number
  } | null>(null)
  const [payMethod, setPayMethod] = useState<'cash' | 'card'>('card')

  useEffect(() => {
    const myOrderIds = JSON.parse(localStorage.getItem('my_orders') || '[]')
    if (myOrderIds.length === 0) {
      setLoading(false)
      return
    }
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/orders')
        if (res.ok) {
          const allOrders: Order[] = await res.json()
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
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
      // case 'pending': // видалено, бо такого статусу немає
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
      case 'paid':
        return (
          <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
            <CheckCircle size={12} /> Сплачено
          </span>
        )
      case 'partially_paid':
        return (
          <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
            <Clock size={12} /> Частково сплачено
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

  // --- Діалог оплати ---
  function handleOpenPay(order: Order) {
    // Відображати тільки не оплачені страви
    setPayOrder({
      ...order,
      items: order.items.filter((item) => !item.paid),
    })
    setSelectedKeys(order.items.filter((item) => !item.paid).map((i) => i.key))
  }
  function handleClosePay() {
    setPayOrder(null)
  }
  function handleToggleItem(key: string) {
    setSelectedKeys((keys) =>
      keys.includes(key) ? keys.filter((k) => k !== key) : [...keys, key]
    )
  }

  // --- Позначити замовлення як сплачене ---
  async function markOrderPaid(orderId: string | number) {
    await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, status: 'paid' }),
    })
    setOrders((prev) => prev.filter((o) => o.id !== orderId))
  }

  // --- Позначити замовлення як частково сплачене ---
  async function markOrderPartiallyPaid(
    orderId: string | number,
    paidKeys: string[]
  ) {
    await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: orderId,
        status: 'partially_paid',
        paidItems: paidKeys,
      }),
    })
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'partially_paid',
              items: o.items.map((item) =>
                paidKeys.includes(item.key) ? { ...item, paid: true } : item
              ),
            }
          : o
      )
    )
  }

  // --- Переходимо до фінального чеку ---
  function handlePayAll() {
    if (!payOrder) return
    setPaySummary({
      items: payOrder.items.map((i) => ({ ...i, orderId: payOrder.id })),
      total: payOrder.total,
      orderId: payOrder.id,
    })
    setShowPayConfirm(true)
    setPayOrder(null)
  }
  function handlePaySelected() {
    if (!payOrder) return
    const toPay = payOrder.items
      .filter((i) => selectedKeys.includes(i.key))
      .map((i) => ({ ...i, orderId: payOrder.id }))
    const sum = toPay.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
    setPaySummary({ items: toPay, total: sum, orderId: payOrder.id })
    setShowPayConfirm(true)
    setPayOrder(null)
  }

  // --- Фінальне підтвердження оплати ---
  async function handleFinishPay() {
    alert(
      `Дякуємо! Оплачено ${paySummary?.total} ₴ способом ${payMethod === 'card' ? 'карткою' : 'готівкою'}.`
    )
    if (paySummary && paySummary.orderId) {
      const order = orders.find((o) => o.id === paySummary.orderId)
      if (order && paySummary.items.length === order.items.length) {
        await markOrderPaid(paySummary.orderId)
      } else {
        await markOrderPartiallyPaid(
          paySummary.orderId,
          paySummary.items.map((i) => i.key)
        )
      }
    }
    setShowPayConfirm(false)
    setPaySummary(null)
    setSelectedKeys([])
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
            {orders
              .filter(
                (order) =>
                  order.status !== 'paid' && order.status !== 'completed'
              )
              .map((order) => (
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
                        Замовлення #{String(order.id).slice(-4)}
                      </div>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="my-3 border-t border-dashed border-zinc-100"></div>

                  <div className="mb-4 space-y-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span
                          className={`text-zinc-600 ${item.paid ? 'text-green-500 line-through' : ''}`}
                        >
                          {item.quantity} x {item.name}
                          {item.paid && (
                            <span className="ml-2 text-xs text-green-500">
                              (сплачено)
                            </span>
                          )}
                        </span>
                        <span className="font-medium">
                          {item.unitPrice * item.quantity} ₴
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
                    <span className="text-sm font-bold text-zinc-500">
                      Разом
                    </span>
                    <span className="text-xl font-extrabold">
                      {order.total} ₴
                    </span>
                  </div>

                  {(order.status === 'new' ||
                    order.status === 'partially_paid') && (
                    <div className="flex justify-end pt-4">
                      <button
                        className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-3 text-sm font-bold text-white shadow-md transition hover:from-amber-600 hover:to-orange-700"
                        onClick={() => handleOpenPay(order)}
                      >
                        Оплатити
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </main>

      {/* --- Модалка вибору способу оплати та список страв (спліт/все) --- */}
      {payOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-7 shadow-xl">
            <button
              className="absolute top-4 right-4 text-xl text-zinc-400 hover:text-zinc-700"
              onClick={handleClosePay}
              aria-label="Закрити"
            >
              ×
            </button>
            <h2 className="mb-5 text-center text-xl font-bold">
              Оплата за замовлення #{String(payOrder.id).slice(-4)}
            </h2>
            <div className="mb-5 flex flex-col gap-2">
              <button
                className="mb-3 w-full rounded-lg bg-black py-3 font-bold text-white hover:bg-zinc-800"
                onClick={handlePayAll}
              >
                Оплатити все ({payOrder.total} ₴)
              </button>
              <div className="my-2 text-center text-zinc-400">
                або тільки за себе
              </div>
              <div className="mb-3 max-h-52 overflow-y-auto rounded-lg border">
                {payOrder.items.map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center justify-between px-3 py-2"
                  >
                    <span>
                      <input
                        type="checkbox"
                        checked={selectedKeys.includes(item.key)}
                        onChange={() => handleToggleItem(item.key)}
                        className="mr-2 accent-orange-500"
                      />
                      {item.quantity} x {item.name}
                    </span>
                    <span>{item.unitPrice * item.quantity} ₴</span>
                  </label>
                ))}
              </div>
              <button
                className="w-full rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 py-3 font-bold text-white transition hover:from-amber-600 hover:to-orange-700"
                onClick={handlePaySelected}
                disabled={selectedKeys.length === 0}
              >
                Оплатити вибране (
                {payOrder.items
                  .filter((item) => selectedKeys.includes(item.key))
                  .reduce(
                    (s, item) => s + item.unitPrice * item.quantity,
                    0
                  )}{' '}
                ₴)
              </button>
            </div>
            <div className="text-center text-xs text-zinc-400">
              Ви можете оплатити все або лише окремі позиції
            </div>
          </div>
        </div>
      )}

      {/* --- Фінальний чек + вибір способу --- */}
      {showPayConfirm && paySummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
            <button
              className="absolute top-3 right-4 text-xl text-zinc-400 hover:text-zinc-700"
              onClick={() => setShowPayConfirm(false)}
            >
              ×
            </button>
            {/* === КРАСИВИЙ ЧЕК === */}
            <div className="mb-4 rounded-xl border bg-white px-5 py-4 shadow-sm">
              <div className="mb-2 flex items-center justify-center gap-2">
                <span className="text-2xl">🍽️</span>
                <span className="font-extrabold tracking-wide text-zinc-800">
                  RESTAURANT
                </span>
              </div>
              <div className="mb-2 flex justify-between text-xs text-zinc-500">
                <span>
                  Столик: <b>#1</b>
                </span>
                <span>
                  {new Date().toLocaleDateString()},{' '}
                  {new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="mb-3 text-xs text-zinc-500">
                Замовлення №<b>{String(paySummary.orderId).slice(-4) || '-'}</b>
              </div>
              <div className="mb-2 border-b border-dashed" />
              <div>
                <div className="mb-2 grid grid-cols-4 text-xs font-semibold text-zinc-500">
                  <div className="col-span-2">Позиція</div>
                  <div className="text-center">К-сть</div>
                  <div className="text-right">Сума</div>
                </div>
                {paySummary.items.map((item, i) => (
                  <div
                    key={i}
                    className="mb-1 grid grid-cols-4 items-start gap-2 text-sm"
                  >
                    <div className="col-span-2">
                      {item.name}
                      {item.addons && item.addons.length > 0 && (
                        <ul className="ml-2 list-disc pl-4 text-xs text-zinc-400">
                          {item.addons.map(
                            (addon: { label: string }, idx: number) => (
                              <li key={idx}>+ {addon.label}</li>
                            )
                          )}
                        </ul>
                      )}
                    </div>
                    <div className="text-center">{item.quantity}</div>
                    <div className="text-right">
                      {item.unitPrice * item.quantity} ₴
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex flex-col gap-1 border-t border-dashed pt-2">
                <div className="flex justify-between font-bold">
                  <span>До сплати</span>
                  <span className="text-lg">{paySummary.total} ₴</span>
                </div>
                <div className="flex justify-between text-sm text-zinc-500">
                  <span>Спосіб</span>
                  <span>{payMethod === 'card' ? 'Карткою' : 'Готівкою'}</span>
                </div>
              </div>
              <div className="mt-3 border-t border-dashed" />
              <div className="mt-2 text-center text-xs text-zinc-400">
                Дякуємо! Чекаємо на Вас ще 😊
              </div>
            </div>
            {/* === Вибір способу оплати === */}
            <div className="mb-5">
              <div className="mb-2 font-bold text-zinc-700">
                Виберіть спосіб оплати:
              </div>
              <div className="flex flex-row justify-center gap-3">
                <button
                  type="button"
                  className={`rounded-xl border px-5 py-2 font-bold ${
                    payMethod === 'card'
                      ? 'border-blue-700 bg-blue-600 text-white'
                      : 'border-zinc-300 bg-zinc-100 text-zinc-700'
                  } `}
                  onClick={() => setPayMethod('card')}
                >
                  Карткою
                </button>
                <button
                  type="button"
                  className={`rounded-xl border px-5 py-2 font-bold ${
                    payMethod === 'cash'
                      ? 'border-orange-500 bg-orange-400 text-white'
                      : 'border-zinc-300 bg-zinc-100 text-zinc-700'
                  } `}
                  onClick={() => setPayMethod('cash')}
                >
                  Готівкою
                </button>
              </div>
            </div>
            <button
              className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 py-3 font-bold text-white transition hover:from-emerald-600 hover:to-green-700"
              onClick={handleFinishPay}
            >
              Підтвердити оплату
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
