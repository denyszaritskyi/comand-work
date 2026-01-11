'use client'

import { useState } from 'react'
import AdminTable from '@/components/admin/AdminTable'
import AdminDishForm from '@/components/admin/AdminDishForm'

export default function AdminPage() {
  const [openForm, setOpenForm] = useState(false)

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-semibold">Адмін-панель: страви</h1>
      {/* <button
        className="mb-6 bg-foreground text-background px-4 py-2 rounded-xl font-semibold shadow hover:bg-foreground/90 transition"
        onClick={() => setOpenForm(true)}
      >
        Додати страву
      </button> */}
      <AdminTable />
      {openForm && <AdminDishForm onClose={() => setOpenForm(false)} />}
    </main>
  )
}
