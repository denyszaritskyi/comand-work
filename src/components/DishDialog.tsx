import Image from 'next/image'
import type { AddonOption, Dish, SizeOption } from '@/types/menu'

type Props = {
  dish: Dish
  sizeOptions: SizeOption[]
  selectedSize: string
  onSelectSize: (sizeId: string) => void
  selectedAddons: Set<string>
  onToggleAddon: (id: string) => void
  totalPrice: number
  onClose: () => void
}

export default function DishDialog({
  dish,
  sizeOptions,
  selectedSize,
  onSelectSize,
  selectedAddons,
  onToggleAddon,
  totalPrice,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div
        className="absolute inset-0 cursor-pointer bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={dish.name}
        className="relative z-10 w-full max-w-4xl overflow-hidden rounded-3xl border-2 border-zinc-200 bg-gradient-to-b from-white to-zinc-50 shadow-[0_20px_60px_rgba(0,0,0,0.35)] ring-1 ring-black/5 sm:max-h-[90vh]"
      >
        <button
          type="button"
          onClick={onClose}
          className="text-foreground absolute top-4 right-4 z-20 cursor-pointer rounded-full bg-white/90 px-3 py-2 text-sm font-semibold shadow-md backdrop-blur transition hover:bg-white"
          aria-label="Закрити"
        >
          ✕
        </button>
        <div className="grid gap-0 sm:grid-cols-[1.1fr_1fr]">
          <div className="relative min-h-[260px] overflow-hidden sm:max-h-[90vh] sm:min-h-[480px]">
            <Image
              src={dish.imageSrc}
              alt={dish.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
          <div className="flex max-h-[90vh] flex-col gap-4 overflow-y-auto p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="space-y-1">
                <h2 className="text-lg leading-tight font-semibold">
                  {dish.name}
                </h2>
                <p className="text-muted-foreground text-sm leading-snug">
                  {dish.description}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-foreground text-sm font-semibold">Розмір</p>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((option) => (
                  <label
                    key={option.id}
                    className={`border-border hover:border-foreground/40 flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${selectedSize === option.id ? 'bg-foreground text-background' : 'bg-muted'}`}
                  >
                    <input
                      type="radio"
                      name="size"
                      value={option.id}
                      checked={selectedSize === option.id}
                      onChange={() => onSelectSize(option.id)}
                      className="hidden"
                    />
                    {option.label}
                    {option.delta !== 0
                      ? ` (${option.delta > 0 ? '+' : ''}${option.delta} грн)`
                      : ' (базова)'}
                  </label>
                ))}
              </div>
            </div>

            {dish.addons && dish.addons.length > 0 ? (
              <div className="space-y-3">
                <p className="text-foreground text-sm font-semibold">Добавки</p>
                <div className="flex flex-col gap-2">
                  {dish.addons.map((addon: AddonOption) => (
                    <label
                      key={addon.id}
                      className="border-border bg-muted hover:border-foreground/40 flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-sm transition"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedAddons.has(addon.id)}
                          onChange={() => onToggleAddon(addon.id)}
                          className="h-4 w-4 accent-current"
                        />
                        <span>{addon.label}</span>
                      </div>
                      <span className="font-medium">+{addon.price} грн</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-auto flex flex-col gap-3">
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Разом</span>
                <span>{totalPrice} грн</span>
              </div>
              <button
                type="button"
                className="bg-foreground text-background hover:bg-foreground/90 focus-visible:ring-ring inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow transition focus-visible:ring-2 focus-visible:outline-none"
              >
                Додати в кошик
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
