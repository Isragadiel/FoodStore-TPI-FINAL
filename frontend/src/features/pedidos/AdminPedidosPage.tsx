import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'

import { pedidosApi } from './pedidosApi'
import { PedidoDetalle } from './PedidoDetalle'
import type { Pedido, EstadoPedido } from '../../shared/api/types'
import { moneda } from '../../shared/api/format'
import { handleApiError } from '../../shared/api/handleApiError'
import { DataTable } from '../../shared/components/DataTable'
import { Skeleton } from '../../shared/components/Skeleton'
import { EstadoError } from '../../shared/components/EstadoError'
import { Paginacion } from '../../shared/components/Paginacion'
import { BadgeEstado } from '../../shared/ui/BadgeEstado'
import { Button } from '../../shared/ui/Button'
import { Modal } from '../../shared/ui/Modal'

const LIMITE = 10

const ESTADOS: EstadoPedido[] = [
  'PENDIENTE',
  'EN_PREPARACION',
  'ENTREGADO',
  'CANCELADO',
]

export function AdminPedidosPage() {
  const queryClient = useQueryClient()

  const [pagina, setPagina] = useState(0)
  const [estado, setEstado] = useState<EstadoPedido | ''>('')
  const [seleccionado, setSeleccionado] = useState<number | null>(null)

  const pedidos = useQuery({
    queryKey: ['pedidos', 'admin', pagina, estado],
    queryFn: () =>
      pedidosApi.listar({
        skip: pagina * LIMITE,
        limit: LIMITE,
        estado: estado || undefined,
      }),
  })

  const detalle = useQuery({
    queryKey: ['pedidos', 'admin', 'detalle', seleccionado],
    queryFn: () => pedidosApi.obtener(seleccionado!),
    enabled: seleccionado !== null,
  })

  const cambiar = useMutation({
    mutationFn: (data: {
      id: number
      estado: EstadoPedido
    }) =>
      pedidosApi.cambiarEstado(data.id, data.estado),

    onSuccess: async () => {
      setPagina(0)

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['pedidos'] }),
        queryClient.invalidateQueries({ queryKey: ['productos'] }),
        queryClient.invalidateQueries({ queryKey: ['resumen'] }),
      ])
    },
  })

  function confirmar(id: number, nuevoEstado: EstadoPedido) {
    const mensaje = nuevoEstado === 'CANCELADO'
      ? 'Cancelar pedido y restituir el stock?'
      : `Cambiar estado a ${nuevoEstado.replaceAll('_', ' ')}?`

    if (window.confirm(mensaje)) {
      cambiar.mutate({
        id,
        estado: nuevoEstado,
      })
    }
  }

  const columns: ColumnDef<Pedido>[] = [
    {
      accessorKey: 'id',
      header: 'Pedido',
      cell: ({ row }) => `#${row.original.id}`,
    },
    {
      accessorKey: 'usuario_id',
      header: 'Cliente ID',
    },
    {
      accessorKey: 'created_at',
      header: 'Fecha',
      cell: ({ row }) =>
        new Date(row.original.created_at).toLocaleString('es-AR'),
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => (
        <BadgeEstado estado={row.original.estado} />
      ),
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => moneda(row.original.total),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => {
        const pedido = row.original

        return (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => setSeleccionado(pedido.id)}
            >
              Detalle
            </Button>

            {pedido.estado === 'PENDIENTE' && (
              <Button
                disabled={cambiar.isPending}
                onClick={() =>
                  confirmar(pedido.id, 'EN_PREPARACION')
                }
              >
                Preparar
              </Button>
            )}

            {pedido.estado === 'EN_PREPARACION' && (
              <Button
                disabled={cambiar.isPending}
                onClick={() =>
                  confirmar(pedido.id, 'ENTREGADO')
                }
              >
                Entregar
              </Button>
            )}

            {(pedido.estado === 'PENDIENTE' ||
              pedido.estado === 'EN_PREPARACION') && (
              <Button
                variant="danger"
                disabled={cambiar.isPending}
                onClick={() =>
                  confirmar(pedido.id, 'CANCELADO')
                }
              >
                Cancelar
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-bold">Gestion de pedidos</h2>

      <div className="panel">
        <label className="block max-w-sm space-y-2">
          <span className="font-semibold">Filtrar por estado</span>

          <select
            className="input"
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value as EstadoPedido | '')
              setPagina(0)
            }}
          >
            <option value="">Todos los estados</option>

            {ESTADOS.map((item) => (
              <option key={item} value={item}>
                {item.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </label>
      </div>

      {cambiar.isError && (
        <EstadoError mensaje={handleApiError(cambiar.error)} />
      )}

      {cambiar.isSuccess && (
        <p role="status" className="rounded-lg bg-green-100 p-3 text-green-800">
          Estado actualizado correctamente.
        </p>
      )}

      {pedidos.isPending ? (
        <Skeleton />
      ) : pedidos.isError ? (
        <EstadoError
          mensaje={handleApiError(pedidos.error)}
          reintentar={() => void pedidos.refetch()}
        />
      ) : (
        <>
          <DataTable
            data={pedidos.data.items}
            columns={columns}
          />

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
            <p>Cargando pedido...</p>
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
