export function EstadoVacio({
  mensaje = 'No se encontraron resultados.',
}: {
  mensaje?: string
}) {
  return (
    <div className="panel py-12 text-center text-slate-500">
      {mensaje}
    </div>
  )
}
