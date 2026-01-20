export type AddonOption = {
  id: string
  label: string
  price: number
}

export type SizeOption = {
  id: string
  label: string
  delta: number
}

export type Dish = {
  id: number
  name: string
  price: number
  description: string
  category: string
  imageSrc: string
  rating: number
  reviewsCount: number
  addons?: AddonOption[]
}

export type CartItem = {
  key: string
  dishId: number
  name: string
  imageSrc: string
  sizeId: string
  sizeLabel: string
  addons: AddonOption[]
  unitPrice: number
  quantity: number
  paid?: boolean // для часткової оплати
}

export type OrderStatus =
  | 'new'
  | 'cooking'
  | 'ready'
  | 'completed'
  | 'cancelled'
  | 'paid'
  | 'partially_paid'

export type Order = {
  id: string
  createdAt: number // timestamp
  stoppedAt?: number
  items: CartItem[]
  total: number
  status: OrderStatus
  tableNumber: string
  paymentMethod?: 'cash' | 'card' // на майбутнє
}
