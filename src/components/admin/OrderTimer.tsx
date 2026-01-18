'use client'
import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

export default function OrderTimer({
  createdAt,
  stoppedAt,
}: {
  createdAt: number
  stoppedAt?: number
}) {
  const [displayTime, setDisplayTime] = useState('00:00')
  const [isLongWait, setIsLongWait] = useState(false)

  useEffect(() => {
    const calculateTime = () => {
      // Якщо таймер зупинено, беремо stoppedAt, інакше поточний час
      const end = stoppedAt || Date.now()
      const diffInSeconds = Math.floor((end - createdAt) / 1000)

      const minutes = Math.floor(diffInSeconds / 60)
      const seconds = diffInSeconds % 60

      setDisplayTime(`${minutes}:${seconds.toString().padStart(2, '0')}`)

      // Підсвічуємо червоним, якщо чекають більше 20 хв (тільки якщо ще не готово)
      if (!stoppedAt && minutes >= 20) setIsLongWait(true)
      else setIsLongWait(false)
    }

    calculateTime() // Рахуємо одразу

    // Якщо є stoppedAt, інтервал не потрібен
    if (stoppedAt) return

    const interval = setInterval(calculateTime, 1000)
    return () => clearInterval(interval)
  }, [createdAt, stoppedAt])

  return (
    <div
      className={`flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-xs font-bold ${
        stoppedAt
          ? 'border-zinc-200 bg-zinc-100 text-zinc-500' // Зупинено
          : isLongWait
            ? 'animate-pulse border-red-200 bg-red-50 text-red-600' // Довго
            : 'border-blue-200 bg-blue-50 text-blue-600' // Норма
      }`}
    >
      <Clock size={12} />
      {displayTime}
    </div>
  )
}
