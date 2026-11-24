import { Button } from '../ui/Button'

export function Paginacion({
  pagina,
  total,
  limite,
  cambiar,
}: {
  pagina: number
  total: number
  limite: number
  cambiar: (pagina: number) => void
}) {
  const paginas = Math.max(1, Math.ceil(total / limite))

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
      <Button
        variant="secondary"
        disabled={pagina <= 0}
        onClick={() => cambiar(pagina - 1)}
      >
        Anterior
      </Button>

      <span>Pagina {pagina + 1} de {paginas}</span>

      <Button
        variant="secondary"
        disabled={pagina + 1 >= paginas}
        onClick={() => cambiar(pagina + 1)}
      >
        Siguiente
      </Button>
    </div>
  )
}
