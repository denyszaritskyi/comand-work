import Image from 'next/image'

export default function HeroHeader() {
  return (
    <header className="relative mb-6 h-64 w-full overflow-hidden">
      <Image
        src="/pexels-pixabay-260922.jpg"
        alt="Restaurant header"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/40 to-transparent" />
      <div className="relative z-10 flex h-full flex-col justify-end px-4 pb-6 sm:px-8">
        <h1 className="text-3xl font-bold text-white">Наше меню</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/80">
          Смачні страви на будь-який смак: сніданки, обіди, вечері та десерти.
          Замовляйте та насолоджуйтеся!
        </p>
      </div>
    </header>
  )
}
