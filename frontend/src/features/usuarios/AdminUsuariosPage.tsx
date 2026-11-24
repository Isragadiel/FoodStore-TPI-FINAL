import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'

import { usuariosApi } from './usuariosApi'
import { useAuthStore } from '../../stores/authStore'
import type { Usuario } from '../../shared/api/types'
import { handleApiError } from '../../shared/api/handleApiError'
import { DataTable } from '../../shared/components/DataTable'
import { Skeleton } from '../../shared/components/Skeleton'
import { EstadoError } from '../../shared/components/EstadoError'
import { Button } from '../../shared/ui/Button'

export function AdminUsuariosPage() {
  const actual = useAuthStore((s) => s.usuario)
  const queryClient = useQueryClient()

  const usuarios = useQuery({
    queryKey: ['usuarios'],
    queryFn: usuariosApi.listar,
  })

  const cambiarEstado = useMutation({
    mutationFn: (usuario: Usuario) =>
      usuario.disabled
        ? usuariosApi.activar(usuario.id)
        : usuariosApi.desactivar(usuario.id),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['usuarios'],
      })
    },
  })

  const columns: ColumnDef<Usuario>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'username',
      header: 'Usuario',
    },
    {
      accessorKey: 'full_name',
      header: 'Nombre completo',
    },
    {
      accessorKey: 'email',
      header: 'Correo',
    },
    {
      accessorKey: 'role',
      header: 'Rol',
    },
    {
      id: 'estado',
      header: 'Estado',
      cell: ({ row }) => (
        <span className={
          row.original.disabled
            ? 'font-bold text-red-600'
            : 'font-bold text-green-600'
        }>
          {row.original.disabled ? 'Desactivado' : 'Activo'}
        </span>
      ),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => {
        const usuario = row.original

        return (
          <Button
            variant={usuario.disabled ? 'primary' : 'danger'}
            disabled={
              cambiarEstado.isPending ||
              usuario.id === actual?.id
            }
            onClick={() => {
              const accion = usuario.disabled
                ? 'Activar'
                : 'Desactivar'

              if (window.confirm(`${accion} a ${usuario.username}?`)) {
                cambiarEstado.mutate(usuario)
              }
            }}
          >
            {usuario.disabled ? 'Activar' : 'Desactivar'}
          </Button>
        )
      },
    },
  ]

  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-bold">Usuarios registrados</h2>

      {cambiarEstado.isError && (
        <EstadoError mensaje={handleApiError(cambiarEstado.error)} />
      )}

      {cambiarEstado.isSuccess && (
        <p role="status" className="rounded-lg bg-green-100 p-3 text-green-800">
          Estado del usuario actualizado correctamente.
        </p>
      )}

      {usuarios.isPending ? (
        <Skeleton />
      ) : usuarios.isError ? (
        <EstadoError
          mensaje={handleApiError(usuarios.error)}
          reintentar={() => void usuarios.refetch()}
        />
      ) : (
        <DataTable data={usuarios.data} columns={columns} />
      )}
    </section>
  )
}
