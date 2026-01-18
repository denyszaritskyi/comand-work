// src/app/admin/page.tsx
'use client'

import AdminTable from '@/components/admin/AdminTable'

export default function AdminPage() {
  return (
    // Вся логіка, включаючи заголовок і модальні вікна, тепер всередині AdminTable
    <AdminTable />
  )
}
