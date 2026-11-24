import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white p-5 text-center text-sm text-slate-500">
        Food Store | Trabajo Practico Integrador | UTN 2026
      </footer>
    </div>
  )
}
