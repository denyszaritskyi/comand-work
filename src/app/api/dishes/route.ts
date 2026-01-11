import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const DISHES_PATH = path.join(process.cwd(), 'src', 'data', 'dishes.json')
console.log('DISHES_PATH: ', DISHES_PATH)

// Читання страв
async function readDishes() {
  try {
    const buf = await fs.readFile(DISHES_PATH, 'utf8')
    console.log('JSON READ:', buf)
    return JSON.parse(buf)
  } catch {
    return []
  }
}

// Запис страв
import type { Dish } from '@/types/menu'

async function writeDishes(arr: Dish[]) {
  await fs.writeFile(DISHES_PATH, JSON.stringify(arr, null, 2), 'utf8')
}

export async function GET() {
  const dishes = await readDishes()
  return NextResponse.json(dishes)
}

// Додавання нової страви
export async function POST(req: NextRequest) {
  const newDish: Dish = await req.json()
  const dishes: Dish[] = await readDishes()
  dishes.unshift({ ...newDish, id: Date.now() }) //Новий id
  await writeDishes(dishes)
  return NextResponse.json({ success: true })
}

// Редагування страви
export async function PUT(req: NextRequest) {
  const updatedDish: Dish = await req.json()
  const dishes: Dish[] = await readDishes()
  const idx = dishes.findIndex((d: Dish) => d.id == updatedDish.id)
  if (idx === -1)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  dishes[idx] = updatedDish
  await writeDishes(dishes)
  return NextResponse.json({ success: true })
}

// Видалення страви
export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'No id' }, { status: 400 })
  const dishes: Dish[] = await readDishes()
  const newDishes = dishes.filter((d: Dish) => d.id != id)
  await writeDishes(newDishes)
  return NextResponse.json({ success: true })
}
