'use client'

import CategoryNav from '@/components/CategoryNav'
import DishDialog from '@/components/DishDialog'
import FiltersBar from '@/components/FiltersBar'
import HeroHeader from '@/components/HeroHeader'
import MenuCard from '@/components/MenuCard'
import { useHomePage } from '@/components/useHomePage'

export default function Home() {
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

  return (
    <div className="text-foreground min-h-screen bg-zinc-50 font-sans">
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
            />
          ))}
        </section>
      </main>

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
        />
      ) : null}
    </div>
  )
}
