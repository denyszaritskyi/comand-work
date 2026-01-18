'use client'

import { ShoppingCart } from 'lucide-react'
import { useEffect, useMemo, useState, Suspense } from 'react' // Додали Suspense
import { useSearchParams } from 'next/navigation' // Додали useSearchParams
import CategoryNav from '@/components/CategoryNav'
import CartDrawer from '@/components/CartDrawer'
import DishDialog from '@/components/DishDialog'
import FiltersBar from '@/components/FiltersBar'
import HeroHeader from '@/components/HeroHeader'
import MenuCard from '@/components/MenuCard'
import { useHomePage } from '@/components/useHomePage'
import { useCartStore } from '@/store/cartStore'

// Створюємо компонент-обгортку, який читає параметри (вимога Next.js)
function TableSetter() {
  const searchParams = useSearchParams()
  const { setTableId } = useCartStore()

  useEffect(() => {
    const table = searchParams.get('table')
    if (table) {
      setTableId(table)
    }
  }, [searchParams, setTableId])

  return null
}

export default function Home() {
  const { addToCart, items } = useCartStore()
  const [isCartOpen, setIsCartOpen] = useState(false)
  // ... (весь код useHomePage без змін) ...
  const {
    categories,
    selectedCategory,
    setSelectedCategory,
    query,
    setQuery,
    sort,
    setSort,
    activeDish,
    selectedSize,
    setSelectedSize,
    selectedAddons,
    toggleAddon,
    totalPrice,
    openDish,
    closeDialog,
    sizeOptions,
    visible,
  } = useHomePage()

  const cartCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )

  useEffect(() => {
    if (activeDish || isCartOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [activeDish, isCartOpen])

  // ... (handleAddFromDialog та handleQuickAdd без змін) ...
  const handleAddFromDialog = () => {
    if (!activeDish) return
    const selectedSizeOption =
      sizeOptions.find((option) => option.id === selectedSize) ?? sizeOptions[0]
    const addons = (activeDish.addons ?? []).filter((addon) =>
      selectedAddons.has(addon.id)
    )
    addToCart({
      dish: activeDish,
      size: selectedSizeOption,
      addons,
      quantity: 1,
    })
    closeDialog()
  }

  const handleQuickAdd = (dish: (typeof visible)[number]) => {
    const defaultSize =
      sizeOptions.find((option) => option.id === 'm') ?? sizeOptions[0]
    addToCart({ dish, size: defaultSize, addons: [], quantity: 1 })
  }

  return (
    <div className="text-foreground min-h-screen bg-zinc-50 font-sans">
      {/* Читаємо номер столу */}
      <Suspense fallback={null}>
        <TableSetter />
      </Suspense>

      <HeroHeader />

      <main className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <CategoryNav
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        <FiltersBar
          query={query}
          sort={sort}
          onQueryChange={setQuery}
          onSortChange={(value) => setSort(value)}
        />

        <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {visible.map((dish) => (
            <MenuCard
              key={dish.id}
              imageSrc={dish.imageSrc}
              name={dish.name}
              price={dish.price}
              description={dish.description}
              rating={dish.rating}
              reviewsCount={dish.reviewsCount}
              onSelect={() => openDish(dish)}
              onAddToCart={() => handleQuickAdd(dish)}
            />
          ))}
        </section>
      </main>

      {/* ... (решта коду Dialog і CartDrawer без змін) ... */}
      {activeDish ? (
        <DishDialog
          dish={activeDish}
          sizeOptions={sizeOptions}
          selectedSize={selectedSize}
          onSelectSize={setSelectedSize}
          selectedAddons={selectedAddons}
          onToggleAddon={toggleAddon}
          totalPrice={totalPrice}
          onClose={closeDialog}
          onAddToCart={handleAddFromDialog}
        />
      ) : null}

      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        className="bg-foreground text-background hover:bg-foreground/90 focus-visible:ring-ring fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold shadow-lg transition focus-visible:ring-2 focus-visible:outline-none"
      >
        <ShoppingCart className="h-4 w-4" aria-hidden />
        <span>Кошик</span>
        <span className="bg-background/20 rounded-full px-2 py-0.5 text-[11px] font-bold">
          {cartCount}
        </span>
      </button>

      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}
