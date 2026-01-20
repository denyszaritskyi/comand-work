import { useEffect, useState } from 'react'

type Order = {
  id: string | number
  status: string
  // Add other fields if needed
}

export function useUnpaidOrdersNotification() {
  const [hasUnpaid, setHasUnpaid] = useState(false)

  useEffect(() => {
    // Перевіряємо локальне сховище на наявність неоплачених замовлень
    const orderIds = JSON.parse(localStorage.getItem('my_orders') || '[]')
    console.log('[NOTIFY] my_orders in localStorage:', orderIds)
    if (!orderIds.length) {
      queueMicrotask(() => setHasUnpaid(false))
      return
    }
    // Перевіряємо статуси замовлень через API
    fetch('/api/orders')
      .then((res) => res.json())
      .then((orders) => {
        console.log('[NOTIFY] orders from API:', orders)
        const myOrders = (orders as Order[]).filter((order) =>
          orderIds.includes(order.id)
        )
        myOrders.forEach((o) =>
          console.log(`[NOTIFY] myOrder: id=${o.id}, status=${o.status}`)
        )
        const unpaid = myOrders.some(
          (order) =>
            order.status === 'pending' ||
            order.status === 'partially_paid' ||
            order.status === 'new'
        )
        console.log('[NOTIFY] has unpaid:', unpaid)
        setHasUnpaid(unpaid)
      })
      .catch((e) => {
        console.error('[NOTIFY] error fetching orders:', e)
        setHasUnpaid(false)
      })
  }, [])

  return hasUnpaid
}
