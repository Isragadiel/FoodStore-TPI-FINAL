import { useQuery } from '@tanstack/react-query'
import { pedidosApi } from './pedidosApi'
import { moneda } from '../../shared/api/format'
import { handleApiError } from '../../shared/api/handleApiError'
import { Skeleton } from '../../shared/components/Skeleton'
import { EstadoError } from '../../shared/components/EstadoError'

export function AdminResumenPage() {
  const resumen = useQuery({
    queryKey: ['resumen'],
    queryFn: pedidosApi.resumen,
  })

  if (resumen.isPending) return <Skeleton />

  if (resumen.isError) {
    return (
      <EstadoError
        mensaje={handleApiError(resumen.error)}
        reintentar={() => void resumen.refetch()}
      />
    )
  }

  const datos = resumen.data

  const indicadores = [
    {
      nombre: 'Pedidos pendientes',
      valor: datos.pendientes,
      estilo: 'border-amber-500',
    },
    {
      nombre: 'En preparacion',
      valor: datos.en_preparacion,
      estilo: 'border-blue-500',
    },
    {
      nombre: 'Entregados',
      valor: datos.entregados,
      estilo: 'border-green-500',
    },
    {
      nombre: 'Cancelados',
      valor: datos.cancelados,
      estilo: 'border-red-500',
    },
    {
      nombre: 'Pedidos de hoy',
      valor: datos.pedidos_hoy,
      estilo: 'border-purple-500',
    },
    {
      nombre: 'Ingresos por entregados',
      valor: moneda(datos.ingresos_entregados),
      estilo: 'border-orange-500',
    },
  ]

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Resumen del negocio</h2>
        <p className="text-slate-500">
          Indicadores generales de Food Store.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {indicadores.map((item) => (
          <article
            key={item.nombre}
            className={`panel border-l-4 ${item.estilo}`}
          >
            <p className="text-sm font-semibold text-slate-500">
              {item.nombre}
            </p>

            <p className="mt-3 text-3xl font-black">
              {item.valor}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
