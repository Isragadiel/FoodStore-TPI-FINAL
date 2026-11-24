import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'

import { categoriasApi } from './categoriasApi'
import { CategoriaForm } from './CategoriaForm'
import type { Categoria } from '../../shared/api/types'
import { handleApiError } from '../../shared/api/handleApiError'
import { DataTable } from '../../shared/components/DataTable'
import { EstadoError } from '../../shared/components/EstadoError'
import { Skeleton } from '../../shared/components/Skeleton'
import { Button } from '../../shared/ui/Button'
import { Modal } from '../../shared/ui/Modal'

export function AdminCategoriasPage() {
  const queryClient = useQueryClient()

  const [abierto, setAbierto] = useState(false)
  const [editando, setEditando] = useState<Categoria>()
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')

  const categorias = useQuery({
    queryKey: ['categorias'],
    queryFn: categoriasApi.listar,
  })

  async function actualizarConsultas() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['categorias'] }),
      queryClient.invalidateQueries({ queryKey: ['productos'] }),
    ])
  }

  const guardar = useMutation({
    mutationFn: (data: {
      nombre: string
      descripcion: string
    }) =>
      editando
        ? categoriasApi.actualizar(editando.id, data)
        : categoriasApi.crear(data),

    onSuccess: async () => {
      await actualizarConsultas()
      setAbierto(false)
      setAviso('Categoria guardada correctamente.')
    },
  })

  const eliminar = useMutation({
    mutationFn: categoriasApi.eliminar,

    onSuccess: async () => {
      await actualizarConsultas()
      setAviso('Categoria desactivada correctamente.')
    },

    onError: (e) => setError(handleApiError(e)),
  })

  function abrir(categoria?: Categoria) {
    setEditando(categoria)
    setError('')
    setAviso('')
    setAbierto(true)
  }

  const columns: ColumnDef<Categoria>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'nombre',
      header: 'Nombre',
    },
    {
      accessorKey: 'descripcion',
      header: 'Descripcion',
    },
    {
      id: 'estado',
      header: 'Estado',
      cell: ({ row }) =>
        row.original.activo ? 'Activa' : 'Inactiva',
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => abrir(row.original)}
          >
            Editar
          </Button>

          <Button
            variant="danger"
            disabled={eliminar.isPending}
            onClick={() => {
              if (window.confirm('Desactivar esta categoria?')) {
                setError('')
                setAviso('')
                eliminar.mutate(row.original.id)
              }
            }}
          >
            Desactivar
          </Button>
        </div>
      ),
    },
  ]

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Categorias</h2>

        <Button onClick={() => abrir()}>
          Nueva categoria
        </Button>
      </header>

      {aviso && (
        <p role="status" className="rounded-lg bg-green-100 p-3 text-green-800">
          {aviso}
        </p>
      )}

      {error && !abierto && <EstadoError mensaje={error} />}

      {categorias.isPending ? (
        <Skeleton />
      ) : categorias.isError ? (
        <EstadoError
          mensaje={handleApiError(categorias.error)}
          reintentar={() => void categorias.refetch()}
        />
      ) : (
        <DataTable data={categorias.data} columns={columns} />
      )}

      {abierto && (
        <Modal
          titulo={editando ? 'Editar categoria' : 'Nueva categoria'}
          cerrar={() => setAbierto(false)}
        >
          {error && <EstadoError mensaje={error} />}

          <CategoriaForm
            categoria={editando}
            cancelar={() => setAbierto(false)}
            guardar={async (data) => {
              try {
                setError('')
                await guardar.mutateAsync(data)
              } catch (e) {
                setError(handleApiError(e))
              }
            }}
          />
        </Modal>
      )}
    </section>
  )
}
