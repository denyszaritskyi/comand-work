import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { Order, OrderStatus } from '@/types/menu'

const ORDERS_PATH = path.join(process.cwd(), 'src', 'data', 'orders.json')

// Допоміжна функція читання
async function readOrders(): Promise<Order[]> {
  try {
    const data = await fs.readFile(ORDERS_PATH, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    // Якщо файлу немає, повертаємо пустий масив
    return []
  }
}

// Допоміжна функція запису
async function writeOrders(orders: Order[]) {
  // Перевіряємо чи існує папка data (про всяк випадок)
  const dir = path.dirname(ORDERS_PATH)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(ORDERS_PATH, JSON.stringify(orders, null, 2), 'utf8')
}

export async function GET() {
  const orders = await readOrders()
  return NextResponse.json(orders)
}

// Створення нового замовлення
export async function POST(req: NextRequest) {
  const newOrder: Order = await req.json()
  const orders = await readOrders()

  // Додаємо нове замовлення
  orders.push(newOrder)

  await writeOrders(orders)
  return NextResponse.json({ success: true })
}

export async function PUT(req: NextRequest) {
  const { id, status } = await req.json()
  const orders = await readOrders()

  const orderIndex = orders.findIndex((o) => o.id === id)
  if (orderIndex === -1) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const order = orders[orderIndex]
  order.status = status as OrderStatus

  // ЛОГІКА ТАЙМЕРА:
  // Якщо статус "Готові", "Завершені" або "Відмінені" — фіксуємо час зупинки
  if (['ready', 'completed', 'cancelled'].includes(status)) {
    if (!order.stoppedAt) {
      order.stoppedAt = Date.now()
    }
  } else {
    // Якщо повернули в "Нові" або "Готуються" — таймер знову тікає
    delete order.stoppedAt
  }

  orders[orderIndex] = order
  await writeOrders(orders)

  return NextResponse.json({ success: true })
}
