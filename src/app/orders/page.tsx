'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { useMemo } from 'react'
import { useCartStore } from '@/store/cartStore'

export default function OrdersPage() {
  const { items, clearCart } = useCartStore()

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [items]
  )

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-border sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-foreground hover:bg-muted flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition"
            >
              <ArrowLeft className="h-4 w-4" /> Назад
            </Link>
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              <h1 className="text-lg font-semibold">Оформлення замовлення</h1>
            </div>
          </div>
          {items.length > 0 ? (
            <button
              type="button"
              onClick={clearCart}
              className="text-muted-foreground hover:text-foreground rounded-full px-3 py-2 text-xs font-semibold transition"
            >
              Очистити кошик
            </button>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {items.length === 0 ? (
          <div className="text-center">
            <p className="text-muted-foreground mb-2 text-sm">
              Немає позицій для оформлення.
            </p>
            <Link
              href="/"
              className="bg-foreground text-background hover:bg-foreground/90 inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold shadow transition"
            >
              Перейти до меню
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <section className="space-y-3">
              {items.map((item) => (
                <article
                  key={item.key}
                  className="border-border flex gap-3 rounded-xl border bg-white/80 p-3 shadow-sm backdrop-blur"
                >
                  <div className="bg-muted relative h-20 w-24 overflow-hidden rounded-lg border">
                    <Image
                      src={item.imageSrc}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1 text-sm">
                    <p className="leading-tight font-semibold">{item.name}</p>
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
                      {item.quantity} шт × {item.unitPrice} грн
                    </p>
                  </div>
                  <div className="flex items-center text-sm font-semibold">
                    {item.unitPrice * item.quantity} грн
                  </div>
                </article>
              ))}
            </section>

            <section className="border-border h-fit rounded-2xl border bg-white/90 p-4 shadow-lg">
              <h2 className="text-base font-semibold">Підсумок</h2>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Товари</span>
                  <span>{total} грн</span>
                </div>
                <div className="text-muted-foreground flex items-center justify-between">
                  <span>Доставка</span>
                  <span>Буде розраховано пізніше</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-base font-semibold">
                <span>Разом</span>
                <span>{total} грн</span>
              </div>
              <button
                type="button"
                className="focus-visible:ring-ring mt-4 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-amber-600 hover:to-orange-700 focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60"
                disabled={items.length === 0}
              >
                Підтвердити замовлення
              </button>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
