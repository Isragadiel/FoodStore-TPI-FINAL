import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom'

import { pedidosApi } from './pedidosApi'
import { PedidoDetalle } from './PedidoDetalle'
import { useAuthStore } from '../../stores/authStore'
import { moneda } from '../../shared/api/format'
import { handleApiError } from '../../shared/api/handleApiError'
import { BadgeEstado } from '../../shared/ui/BadgeEstado'
import { Button } from '../../shared/ui/Button'
import { Modal } from '../../shared/ui/Modal'
import { Skeleton } from '../../shared/components/Skeleton'
import { EstadoError } from '../../shared/components/EstadoError'
import { EstadoVacio } from '../../shared/components/EstadoVacio'
import { Paginacion } from '../../shared/components/Paginacion'

const LIMITE = 10

export function MisPedidosPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const [pagina, setPagina] = useState(0)
  const [seleccionado, setSeleccionado] = useState<number | null>(null)

  const location = useLocation()
  const queryClient = useQueryClient()

  const pedidos = useQuery({
    queryKey: ['pedidos', 'cliente', usuario?.id, pagina],
    queryFn: () =>
      pedidosApi.listar({
        skip: pagina * LIMITE,
        limit: LIMITE,
      }),
    enabled: !!usuario,
  })

  const detalle = useQuery({
    queryKey: ['pedidos', 'detalle', usuario?.id, seleccionado],
    queryFn: () => pedidosApi.obtener(seleccionado!),
    enabled: seleccionado !== null && !!usuario,
  })

  const cancelar = useMutation({
    mutationFn: pedidosApi.cancelar,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['pedidos'] }),
        queryClient.invalidateQueries({ queryKey: ['productos'] }),
        queryClient.invalidateQueries({ queryKey: ['resumen'] }),
      ])
    },
  })

  return (
    <section className="space-y-5">
      <h1 className="page-title">Mis pedidos</h1>

      {location.state?.pedidoCreado && (
        <p role="status" className="rounded-lg bg-green-100 p-4 text-green-800">
          Pedido #{location.state.pedidoCreado} realizado correctamente.
        </p>
      )}

      {cancelar.isError && (
        <EstadoError mensaje={handleApiError(cancelar.error)} />
      )}

      {cancelar.isSuccess && (
        <p role="status" className="rounded-lg bg-green-100 p-4 text-green-800">
          Pedido cancelado correctamente.
        </p>
      )}

      {pedidos.isPending ? (
        <Skeleton />
      ) : pedidos.isError ? (
        <EstadoError
          mensaje={handleApiError(pedidos.error)}
          reintentar={() => void pedidos.refetch()}
        />
      ) : pedidos.data.items.length === 0 ? (
        <EstadoVacio mensaje="Todavia no realizaste pedidos." />
      ) : (
        <>
          {pedidos.data.items.map((pedido) => (
            <article
              key={pedido.id}
              className="panel flex flex-wrap items-center justify-between gap-4"
            >
              <div>
                <h2 className="text-xl font-bold">Pedido #{pedido.id}</h2>

                <p className="text-sm text-slate-500">
                  {new Date(pedido.created_at).toLocaleString('es-AR')}
                </p>
              </div>

              <BadgeEstado estado={pedido.estado} />

              <strong className="text-xl">{moneda(pedido.total)}</strong>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setSeleccionado(pedido.id)}
                >
                  Ver detalle
                </Button>

                {pedido.estado === 'PENDIENTE' && (
                  <Button
                    variant="danger"
                    disabled={cancelar.isPending}
                    onClick={() => {
                      if (window.confirm('Confirmar cancelacion del pedido?')) {
                        cancelar.mutate(pedido.id)
                      }
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </article>
          ))}

          <Paginacion
            pagina={pagina}
            total={pedidos.data.total}
            limite={LIMITE}
            cambiar={setPagina}
          />
        </>
      )}

      {seleccionado !== null && (
        <Modal
          titulo={`Pedido #${seleccionado}`}
          cerrar={() => setSeleccionado(null)}
        >
          {detalle.isPending ? (
            <p>Cargando detalle...</p>
          ) : detalle.isError ? (
            <EstadoError mensaje={handleApiError(detalle.error)} />
          ) : (
            <PedidoDetalle pedido={detalle.data} />
          )}
        </Modal>
      )}
    </section>
  )
}
