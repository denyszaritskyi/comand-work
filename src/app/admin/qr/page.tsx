// src/app/admin/qr/page.tsx
'use client'

import React, { useState, useRef, useSyncExternalStore } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useReactToPrint } from 'react-to-print'
import { ArrowLeft, Printer, QrCode } from 'lucide-react'
import Link from 'next/link'

export default function QrGeneratorPage() {
  const [tableId, setTableId] = useState('1')
  const componentRef = useRef<HTMLDivElement>(null)

  // Правильний спосіб отримати дані браузера (window) в React 18/19 без useEffect
  const origin = useSyncExternalStore(
    () => () => {}, // Функція підписки (нам не потрібна, бо origin не змінюється)
    () => window.location.origin, // Значення на клієнті
    () => '' // Значення на сервері (SSR)
  )

  const qrLink = origin ? `${origin}/?table=${tableId}` : ''
  const isReady = !!origin // Прапорець, що ми на клієнті і маємо посилання

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Table-${tableId}-QR`,
  })

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      {/* HEADER */}
      <header className="border-b border-zinc-200 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <Link
            href="/admin"
            className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="flex items-center gap-2 text-xl font-bold">
            <QrCode className="text-zinc-900" />
            Генератор QR-кодів
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-6">
        <div className="grid h-fit gap-8 md:grid-cols-[1fr_1.5fr]">
          {/* ЛІВА ЧАСТИНА: НАЛАШТУВАННЯ */}
          <div className="h-fit space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-700">
                Номер столика
              </label>
              <input
                type="number"
                min="1"
                value={tableId}
                onChange={(e) => setTableId(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-lg font-bold outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
              <p className="mb-1 font-bold">Посилання в коді:</p>
              <code className="break-all">{qrLink || 'Завантаження...'}</code>
            </div>

            <button
              onClick={() => handlePrint()}
              disabled={!isReady} // Блокуємо, поки не готово
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-4 text-base font-bold text-white shadow-lg shadow-zinc-900/20 transition hover:bg-zinc-800 active:scale-95 disabled:opacity-50"
            >
              <Printer size={20} />
              Друкувати / Зберегти PDF
            </button>
          </div>

          {/* ПРАВА ЧАСТИНА: ПРЕВ'Ю */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-100 p-8">
            <p className="mb-4 text-xs font-bold tracking-widest text-zinc-400 uppercase">
              Попередній перегляд друку
            </p>

            <div className="overflow-hidden shadow-2xl">
              <div
                ref={componentRef}
                className="flex h-[500px] w-[350px] flex-col items-center justify-between border border-zinc-100 bg-white p-8 text-center"
                style={{
                  pageBreakAfter: 'always',
                }}
              >
                <div className="mt-4 space-y-2">
                  <h2 className="text-3xl font-black text-zinc-900">МЕНЮ</h2>
                  <p className="text-sm font-medium text-zinc-500">
                    Відскануйте, щоб замовити
                  </p>
                </div>

                <div className="rounded-xl border-4 border-zinc-900 p-2">
                  {isReady ? (
                    <QRCodeSVG
                      value={qrLink}
                      size={200}
                      bgColor={'#ffffff'}
                      fgColor={'#000000'}
                      level={'H'}
                      includeMargin={false}
                    />
                  ) : (
                    <div className="flex h-[200px] w-[200px] items-center justify-center bg-zinc-100 text-zinc-400">
                      Завантаження...
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
                    Ваш столик
                  </p>
                  <p className="text-6xl font-black text-zinc-900">{tableId}</p>
                </div>

                <div className="w-full border-t border-zinc-100 pt-4">
                  <p className="text-[10px] text-zinc-400">Смачного!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
