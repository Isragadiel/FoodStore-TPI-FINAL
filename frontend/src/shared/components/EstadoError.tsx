import { Button } from '../ui/Button'

export function EstadoError({
  mensaje,
  reintentar,
}: {
  mensaje: string
  reintentar?: () => void
}) {
  return (
    <div role="alert" className="rounded-lg bg-red-50 p-5 text-red-700">
      <p>{mensaje}</p>
      {reintentar && (
        <Button
          variant="secondary"
          className="mt-3"
          onClick={reintentar}
        >
          Reintentar
        </Button>
      )}
    </div>
  )
}
