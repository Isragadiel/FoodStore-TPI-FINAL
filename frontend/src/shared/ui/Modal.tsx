import type { ReactNode } from 'react'

export function Modal({
  titulo,
  children,
  cerrar,
}: {
  titulo: string
  children: ReactNode
  cerrar: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="max-h-[90vh] w-full max-w-xl overflow-auto rounded-xl bg-white p-6 shadow-xl"
      >
        <header className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold">{titulo}</h2>
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar"
            className="text-2xl text-slate-500"
          >
            &times;
          </button>
        </header>
        {children}
      </section>
    </div>
  )
}
