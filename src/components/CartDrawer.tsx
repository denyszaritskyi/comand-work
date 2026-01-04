'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Trash2, X } from 'lucide-react'
import { useMemo } from 'react'
import { useCartStore } from '@/store/cartStore'

type Props = {
  open: boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: Props) {
  const { items, removeFromCart, updateQuantity, clearCart } = useCartStore()
  const router = useRouter()
  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items]
  )

  const handleProceed = () => {
    if (items.length === 0) return
    onClose()
    router.push('/orders')
  }

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      <aside
        className={`absolute top-0 right-0 flex h-full w-full max-w-md transform flex-col bg-gradient-to-b from-white to-zinc-50 shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-label="Кошик"
      >
        <header className="border-border bg-muted/40 flex items-center justify-between gap-3 border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" aria-hidden />
            <p className="text-lg font-semibold">Кошик</p>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 ? (
              <button
                type="button"
                onClick={clearCart}
                className="text-muted-foreground hover:text-foreground flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                Очистити
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрити кошик"
              className="text-foreground hover:bg-foreground/5 flex h-9 w-9 items-center justify-center rounded-full transition"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {items.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Кошик порожній. Додайте страви, щоб оформити замовлення.
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <article
                  key={item.key}
                  className="border-border flex items-start gap-3 rounded-xl border bg-white/80 p-3 shadow-sm backdrop-blur"
                >
                  <div className="bg-muted relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border">
                    <Image
                      src={item.imageSrc}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="space-y-1">
                        <p className="text-sm leading-tight font-semibold">
                          {item.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Розмір: {item.sizeLabel}
                        </p>
                        {item.addons.length > 0 ? (
                          <p className="text-muted-foreground text-xs">
                            Добавки:{' '}
                            {item.addons.map((addon) => addon.label).join(', ')}
                          </p>
                        ) : null}
                        <p className="text-muted-foreground text-xs">
                          {item.unitPrice} грн / шт
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label="Прибрати позицію"
                        className="text-muted-foreground hover:text-foreground ml-auto rounded-full p-1 transition"
                        onClick={() => removeFromCart(item.key)}
                      >
                        <X className="h-4 w-4" aria-hidden />
                      </button>
                    </div>

                    <div className="text-foreground flex items-center gap-3 text-sm font-semibold">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label="Зменшити кількість"
                          onClick={() =>
                            updateQuantity(item.key, item.quantity - 1)
                          }
                          className="border-border hover:bg-muted flex h-8 w-8 items-center justify-center rounded-full border text-base transition"
                        >
                          −
                        </button>
                        <span className="min-w-[1.5ch] text-center tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Збільшити кількість"
                          onClick={() =>
                            updateQuantity(item.key, item.quantity + 1)
                          }
                          className="border-border hover:bg-muted flex h-8 w-8 items-center justify-center rounded-full border text-base transition"
                        >
                          +
                        </button>
                      </div>
                      <span className="bg-muted ml-auto rounded-full px-3 py-1 text-xs font-semibold">
                        {item.unitPrice * item.quantity} грн
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <footer className="border-border border-t bg-white/90 px-5 py-4">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>Сума</span>
            <span>{total} грн</span>
          </div>
          <button
            type="button"
            onClick={handleProceed}
            className="focus-visible:ring-ring mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-amber-600 hover:to-orange-700 focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60"
            disabled={items.length === 0}
          >
            Перейти до оформлення
          </button>
        </footer>
      </aside>
    </div>
  )
}
