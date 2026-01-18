'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CheckCircle,
  XCircle,
  ShoppingCart,
  Wallet,
  ListChecks,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import type { Order } from '@/types/menu'

const STATUS_COLORS: Record<string, string> = {
  completed: '#22c55e',
  cancelled: '#ef4444',
  new: '#0ea5e9',
  cooking: '#f59e0b',
  ready: '#8b5cf6',
}

const STATUS_LABELS: Record<string, string> = {
  completed: 'Виконано',
  cancelled: 'Скасовано',
  new: 'Нові',
  cooking: 'Готуються',
  ready: 'Готові',
}

const TOOLTIP_STYLE = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  fontSize: '12px',
  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
}

const TOOLTIP_LABEL_STYLE = {
  color: '#0f172a',
  fontWeight: 600,
}

type Period = 'week' | 'month' | 'custom' | 'day'

type StatCard = {
  title: string
  value: string
  icon: React.ReactNode
  accentClass: string
}

function toMonthInputValue(date: Date) {
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}`
}

function toDayInputValue(date: Date) {
  const day = `${date.getDate()}`.padStart(2, '0')
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function getDateLabel(date: Date) {
  return date.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: 'short',
  })
}

function getRange(period: Period, customMonth: string, customDay: string) {
  const now = new Date()
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)

  if (period === 'day' && customDay) {
    const [year, month, day] = customDay.split('-').map(Number)
    const start = new Date(year, month - 1, day, 0, 0, 0, 0)
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999)
    return { start, end: endOfDay }
  }

  if (period === 'week') {
    const start = new Date(now)
    start.setDate(now.getDate() - 6)
    start.setHours(0, 0, 0, 0)
    return { start, end }
  }

  if (period === 'custom' && customMonth) {
    const [year, month] = customMonth.split('-').map(Number)
    const start = new Date(year, month - 1, 1, 0, 0, 0, 0)
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999)
    return { start, end: endOfMonth }
  }

  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  )
  return { start, end: endOfMonth }
}

function getStatusLabel(status: string) {
  return STATUS_LABELS[status] || status
}

export default function AdminAnalytics() {
  const [orders, setOrders] = React.useState<Order[]>([])
  const [period, setPeriod] = React.useState<Period>('week')
  const [customMonth, setCustomMonth] = React.useState<string>(() =>
    toMonthInputValue(new Date())
  )
  const [customDay, setCustomDay] = React.useState<string>(() =>
    toDayInputValue(new Date())
  )
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders')
        if (!res.ok) return
        const data: Order[] = await res.json()
        setOrders(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const { start, end } = React.useMemo(
    () => getRange(period, customMonth, customDay),
    [period, customMonth, customDay]
  )

  const filteredOrders = React.useMemo(() => {
    return orders.filter((order) => {
      if (!order.createdAt) return false
      const created = new Date(order.createdAt)
      return created >= start && created <= end
    })
  }, [orders, start, end])

  const totals = React.useMemo(() => {
    const totalOrders = filteredOrders.length
    const completedOrders = filteredOrders.filter(
      (order) => order.status === 'completed'
    ).length
    const cancelledOrders = filteredOrders.filter(
      (order) => order.status === 'cancelled'
    ).length
    const revenue = filteredOrders
      .filter((order) => order.status === 'completed')
      .reduce((sum, order) => sum + order.total, 0)
    const itemsCount = filteredOrders.reduce((sum, order) => {
      const orderItems = order.items.reduce(
        (innerSum, item) => innerSum + item.quantity,
        0
      )
      return sum + orderItems
    }, 0)

    return {
      totalOrders,
      completedOrders,
      cancelledOrders,
      revenue,
      itemsCount,
      avgOrderValue: completedOrders ? revenue / completedOrders : 0,
      avgItems: totalOrders ? itemsCount / totalOrders : 0,
    }
  }, [filteredOrders])

  const chartData = React.useMemo(() => {
    const days: Date[] = []
    const current = new Date(start)
    current.setHours(0, 0, 0, 0)
    while (current <= end) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    const grouped = new Map(
      days.map((day) => [getDateKey(day), { orders: 0, revenue: 0 }])
    )

    filteredOrders.forEach((order) => {
      const created = new Date(order.createdAt)
      const key = getDateKey(created)
      if (!grouped.has(key)) return
      const entry = grouped.get(key)
      if (!entry) return
      entry.orders += 1
      if (order.status === 'completed') {
        entry.revenue += order.total
      }
    })

    return days.map((day) => {
      const key = getDateKey(day)
      const entry = grouped.get(key) || { orders: 0, revenue: 0 }
      return {
        date: getDateLabel(day),
        orders: entry.orders,
        revenue: entry.revenue,
      }
    })
  }, [filteredOrders, start, end])

  const statusData = React.useMemo(() => {
    const grouped: Record<string, number> = {}
    filteredOrders.forEach((order) => {
      grouped[order.status] = (grouped[order.status] || 0) + 1
    })
    return Object.entries(grouped).map(([status, value]) => ({
      status,
      value,
      color: STATUS_COLORS[status] || '#94a3b8',
    }))
  }, [filteredOrders])

  const statCards: StatCard[] = [
    {
      title: 'Замовлень за період',
      value: totals.totalOrders.toString(),
      icon: <ShoppingCart size={18} />,
      accentClass: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      title: 'Виконано',
      value: totals.completedOrders.toString(),
      icon: <CheckCircle size={18} />,
      accentClass: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      title: 'Скасовано',
      value: totals.cancelledOrders.toString(),
      icon: <XCircle size={18} />,
      accentClass: 'text-red-600 bg-red-50 border-red-100',
    },
    {
      title: 'Дохід (виконані)',
      value: `${Math.round(totals.revenue)} ₴`,
      icon: <Wallet size={18} />,
      accentClass: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      title: 'Середній чек',
      value: `${totals.avgOrderValue.toFixed(0)} ₴`,
      icon: <BarChart3 size={18} />,
      accentClass: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      title: 'Сер. позицій',
      value: totals.avgItems.toFixed(1),
      icon: <ListChecks size={18} />,
      accentClass: 'text-slate-600 bg-slate-50 border-slate-100',
    },
  ]

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-16 font-sans">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white shadow-lg shadow-zinc-200">
              <BarChart3 size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-900">Аналітика</h1>
              <p className="text-xs font-medium text-zinc-400">
                Статистика замовлень за вибраний період
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm">
              <CalendarDays size={16} />
              <span>
                {start.toLocaleDateString('uk-UA')} –{' '}
                {end.toLocaleDateString('uk-UA')}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-6">
        <section className="mb-6 flex flex-col gap-3 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
              Фільтр періоду
            </p>
            <h2 className="text-lg font-bold text-zinc-900">
              Оберіть період аналітики
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value as Period)}
              className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm"
            >
              <option value="day">Конкретний день</option>
              <option value="week">Останні 7 днів</option>
              <option value="month">Поточний місяць</option>
              <option value="custom">Обрати місяць</option>
            </select>

            {period === 'day' && (
              <input
                type="date"
                value={customDay}
                onChange={(event) => setCustomDay(event.target.value)}
                className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm"
              />
            )}

            {period === 'custom' && (
              <input
                type="month"
                value={customMonth}
                onChange={(event) => setCustomMonth(event.target.value)}
                className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm"
              />
            )}
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-3xl border border-zinc-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-900">
                Замовлення по днях
              </h3>
              <span className="text-xs font-semibold text-zinc-400">
                Кількість та дохід
              </span>
            </div>
            {loading ? (
              <div className="py-16 text-center text-sm text-zinc-400">
                Завантаження...
              </div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 24, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="ordersArea"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#2563eb"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="100%"
                          stopColor="#2563eb"
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                      <linearGradient
                        id="revenueArea"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#10b981"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="100%"
                          stopColor="#10b981"
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="6 6" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="orders"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="revenue"
                      orientation="right"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      labelStyle={TOOLTIP_LABEL_STYLE}
                      cursor={{ stroke: '#e2e8f0', strokeDasharray: '4 4' }}
                      formatter={(value: number, name) =>
                        name === 'revenue'
                          ? [`${value} ₴`, 'Дохід']
                          : [value, 'Замовлення']
                      }
                    />
                    <Area
                      yAxisId="orders"
                      type="monotone"
                      dataKey="orders"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      fill="url(#ordersArea)"
                      activeDot={{ r: 4 }}
                    />
                    <Area
                      yAxisId="revenue"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fill="url(#revenueArea)"
                      activeDot={{ r: 4 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-zinc-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-900">Статуси</h3>
              <span className="text-xs font-semibold text-zinc-400">
                Частка замовлень
              </span>
            </div>
            {statusData.length === 0 ? (
              <div className="py-16 text-center text-sm text-zinc-400">
                Немає даних для цього періоду
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="status"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      stroke="#ffffff"
                      strokeWidth={2}
                    >
                      {statusData.map((entry) => (
                        <Cell key={entry.status} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      labelStyle={TOOLTIP_LABEL_STYLE}
                      formatter={(value: number, name) => [
                        value,
                        getStatusLabel(String(name)),
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="mt-4 grid gap-2 text-sm">
              {statusData.map((entry) => (
                <div
                  key={entry.status}
                  className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-zinc-50 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="font-semibold text-zinc-700">
                      {getStatusLabel(entry.status)}
                    </span>
                  </div>
                  <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs font-bold text-zinc-700">
                    {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-zinc-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-900">Дохід по днях</h3>
            <span className="text-xs font-semibold text-zinc-400">
              Тільки виконані замовлення
            </span>
          </div>
          {loading ? (
            <div className="py-16 text-center text-sm text-zinc-400">
              Завантаження...
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="revenueOnlyArea"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#22c55e"
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="100%"
                        stopColor="#16a34a"
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="6 6" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    labelStyle={TOOLTIP_LABEL_STYLE}
                    cursor={{ stroke: '#e2e8f0', strokeDasharray: '4 4' }}
                    formatter={(value: number) => [`${value} ₴`, 'Дохід']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#22c55e"
                    strokeWidth={2.5}
                    fill="url(#revenueOnlyArea)"
                    activeDot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((card) => (
            <div
              key={card.title}
              className="rounded-3xl border border-zinc-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
                    {card.title}
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-zinc-900">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${card.accentClass}`}
                >
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}
