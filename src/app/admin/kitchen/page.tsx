'use client'

import React, { useEffect, useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  useDraggable,
  useDroppable,
  DragOverlay,
  DragStartEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from '@dnd-kit/core'
import { Order, OrderStatus } from '@/types/menu'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  RefreshCw,
  Utensils,
} from 'lucide-react'
import OrderTimer from '@/components/admin/OrderTimer'

// Тип для функції оновлення
type UpdateStatusFn = (id: string, status: OrderStatus) => void

const COLUMN_WIDTH = 'w-[480px] min-w-[480px]'

// --- ВМІСТ КАРТКИ ---
function OrderCardContent({
  order,
  isOverlay = false,
  onUpdateStatus,
}: {
  order: Order
  isOverlay?: boolean
  onUpdateStatus?: UpdateStatusFn
}) {
  const statusColor =
    {
      new: 'border-blue-500',
      cooking: 'border-amber-500',
      ready: 'border-emerald-500',
      completed: 'border-gray-500',
      cancelled: 'border-red-500',
      paid: 'border-green-500',
      partially_paid: 'border-yellow-500',
    }[order.status] || 'border-zinc-200'

  return (
    <div
      className={`relative rounded-xl border-l-4 bg-white p-4 ${statusColor} flex h-full flex-col shadow-sm ${isOverlay ? 'rotate-2 cursor-grabbing shadow-2xl ring-2 ring-zinc-900/10' : 'cursor-grab hover:shadow-md'} transition-all`}
    >
      {/* HEADER */}
      <div className="mb-3 flex items-start justify-between border-b border-zinc-50 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-zinc-900">
              Стіл {order.tableNumber}
            </span>
            <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-500">
              #{order.id.slice(-3)}
            </span>
            {(order.status === 'paid' || order.status === 'partially_paid') && (
              <span
                className={`ml-2 rounded px-2 py-0.5 text-xs font-semibold ${order.status === 'paid' ? 'border border-green-300 bg-green-100 text-green-700' : 'border border-yellow-300 bg-yellow-100 text-yellow-700'}`}
              >
                {order.status === 'paid' ? 'Оплачено' : 'Частково оплачено'}
              </span>
            )}
          </div>
          <div className="mt-0.5 text-[10px] font-medium tracking-wider text-zinc-400 uppercase">
            {new Date(order.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
        <OrderTimer createdAt={order.createdAt} stoppedAt={order.stoppedAt} />
      </div>

      {/* BODY */}
      <div className="mb-4 flex-1 space-y-3">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm leading-tight font-bold text-zinc-800">
                {item.name}
              </p>
              {item.addons.length > 0 && (
                <p className="mt-0.5 text-xs text-zinc-500">
                  + {item.addons.map((a) => a.label).join(', ')}
                </p>
              )}
              {item.sizeLabel !== 'Стандарт' && (
                <p className="text-xs text-zinc-400">{item.sizeLabel}</p>
              )}
            </div>
            <div className="ml-3 font-mono text-lg font-bold text-zinc-900">
              x{item.quantity}
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-3">
        <span className="text-sm font-bold text-zinc-400">{order.total} ₴</span>

        {!isOverlay && onUpdateStatus && (
          <div
            className="flex gap-2"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                if (confirm('Відмінити?')) onUpdateStatus(order.id, 'cancelled')
              }}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 transition-colors hover:bg-red-100"
              title="Відмінити"
            >
              <XCircle size={20} />
            </button>
            {order.status !== 'new' && (
              <button
                onClick={() => onUpdateStatus(order.id, 'completed')}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 transition-colors hover:bg-zinc-700"
                title="Завершити"
              >
                <CheckCircle size={20} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// --- SORTABLE WRAPPER ---
function SortableOrderCard({
  order,
  onUpdateStatus,
}: {
  order: Order
  onUpdateStatus: UpdateStatusFn
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: order.id,
  })

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        className="mb-3 min-h-[150px] rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-100/50 opacity-40"
      />
    )
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="mb-3 touch-none"
    >
      <OrderCardContent order={order} onUpdateStatus={onUpdateStatus} />
    </div>
  )
}

// --- COLUMN ---
function KanbanColumn({
  id,
  title,
  orders,
  onUpdateStatus,
}: {
  id: OrderStatus
  title: string
  orders: Order[]
  onUpdateStatus: UpdateStatusFn
}) {
  const { setNodeRef } = useDroppable({ id })
  const styles = {
    new: { bg: 'bg-white', header: 'bg-blue-50 text-blue-700' },
    cooking: { bg: 'bg-white', header: 'bg-amber-50 text-amber-700' },
    ready: { bg: 'bg-white', header: 'bg-emerald-50 text-emerald-700' },
  }[id as string] || { bg: 'bg-white', header: 'text-zinc-700' }

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 ${COLUMN_WIDTH} flex flex-col rounded-2xl ${styles.bg} h-full overflow-hidden border border-zinc-200 shadow-sm`}
    >
      <div
        className={`flex items-center justify-between border-b border-zinc-100 px-5 py-4 text-sm font-bold tracking-wide uppercase ${styles.header}`}
      >
        <span>{title}</span>
        <span className="rounded bg-white/80 px-2 py-0.5 text-xs text-zinc-900 shadow-sm">
          {orders.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto bg-zinc-50/50 p-3">
        {orders.map((order) => (
          <SortableOrderCard
            key={order.id}
            order={order}
            onUpdateStatus={onUpdateStatus}
          />
        ))}
        {orders.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 pb-10 text-zinc-300">
            <Utensils size={32} strokeWidth={1.5} />
            <span className="text-sm font-medium">Пусто</span>
          </div>
        )}
      </div>
    </div>
  )
}

// --- MAIN PAGE ---
export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  // ВИПРАВЛЕНО: Прибрано isClient, натомість використовуємо id в DndContext

  // Логіка завантаження всередині useEffect
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders')
        if (res.ok) {
          const data: Order[] = await res.json()
          setOrders(
            data.filter((o) => !['completed', 'cancelled'].includes(o.status))
          )
        }
      } catch (e) {
        console.error(e)
      }
    }

    fetchOrders() // Перший виклик
    const interval = setInterval(fetchOrders, 5000) // Polling
    return () => clearInterval(interval)
  }, [])

  const updateStatus: UpdateStatusFn = async (id, newStatus) => {
    setOrders((prev) => {
      if (['completed', 'cancelled'].includes(newStatus))
        return prev.filter((o) => o.id !== id)
      return prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    })
    await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    })
  }

  const handleManualRefresh = async () => {
    try {
      const res = await fetch('/api/orders')
      if (res.ok) {
        const data: Order[] = await res.json()
        setOrders(
          data.filter((o) => !['completed', 'cancelled'].includes(o.status))
        )
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleDragStart = (event: DragStartEvent) =>
    setActiveId(event.active.id as string)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return
    const activeOrder = orders.find((o) => o.id === active.id)
    if (activeOrder && activeOrder.status !== over.id) {
      updateStatus(active.id as string, over.id as OrderStatus)
    }
  }

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: '0.4' } },
    }),
  }

  const activeOrder = orders.find((o) => o.id === activeId)

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-100 font-sans text-zinc-900">
      <header className="z-10 flex flex-none items-center justify-between border-b border-zinc-200 bg-white px-6 py-3 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="flex items-center gap-2 text-lg font-bold">
            Кухня: Монітор
          </h1>
        </div>
        <button
          onClick={handleManualRefresh}
          className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-bold text-white shadow-lg shadow-black/20 transition hover:bg-zinc-800"
        >
          <RefreshCw size={14} />
        </button>
      </header>

      <main className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        {/* ВИПРАВЛЕНО: Додано id="kitchen-dnd" для підтримки SSR без isClient */}
        <DndContext
          id="kitchen-dnd"
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex h-full flex-nowrap items-start gap-4">
            <KanbanColumn
              id="new"
              title="Нові"
              orders={orders.filter(
                (o) =>
                  o.status === 'new' ||
                  o.status === 'paid' ||
                  o.status === 'partially_paid'
              )}
              onUpdateStatus={updateStatus}
            />
            <KanbanColumn
              id="cooking"
              title="Готуються"
              orders={orders.filter((o) => o.status === 'cooking')}
              onUpdateStatus={updateStatus}
            />
            <KanbanColumn
              id="ready"
              title="Готові до видачі"
              orders={orders.filter((o) => o.status === 'ready')}
              onUpdateStatus={updateStatus}
            />
          </div>

          <DragOverlay dropAnimation={dropAnimation}>
            {activeOrder ? (
              <div className={COLUMN_WIDTH}>
                <OrderCardContent order={activeOrder} isOverlay />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  )
}
