import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'

import { productosApi } from './productosApi'
import type { ProductoData } from './productosApi'
import { categoriasApi } from '../categorias/categoriasApi'
import { ProductoForm } from './ProductoForm'
import { StockForm } from './StockForm'
import type { Producto } from '../../shared/api/types'
import { moneda } from '../../shared/api/format'
import { handleApiError } from '../../shared/api/handleApiError'
import { DataTable } from '../../shared/components/DataTable'
import { EstadoError } from '../../shared/components/EstadoError'
import { Skeleton } from '../../shared/components/Skeleton'
import { Paginacion } from '../../shared/components/Paginacion'
import { Button } from '../../shared/ui/Button'
import { Modal } from '../../shared/ui/Modal'

const LIMITE = 10

export function AdminProductosPage() {
  const queryClient = useQueryClient()

  const [pagina, setPagina] = useState(0)
  const [search, setSearch] = useState('')
  const [categoria, setCategoria] = useState('')
  const [modal, setModal] = useState<'form' | 'stock' | null>(null)
  const [seleccionado, setSeleccionado] = useState<Producto>()
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')

  const categorias = useQuery({
    queryKey: ['categorias'],
    queryFn: categoriasApi.listar,
  })

  const productos = useQuery({
    queryKey: ['productos', 'admin', pagina, search, categoria],
    queryFn: () =>
      productosApi.listar({
        skip: pagina * LIMITE,
        limit: LIMITE,
        search: search || undefined,
        categoria_id: categoria ? Number(categoria) : undefined,
      }),
  })

  async function actualizarConsultas() {
    await queryClient.invalidateQueries({
      queryKey: ['productos'],
    })
  }

  function abrir(
    tipo: 'form' | 'stock',
    producto?: Producto,
  ) {
    setError('')
    setAviso('')
    setSeleccionado(producto)
    setModal(tipo)
  }

  const guardar = useMutation({
    mutationFn: (data: ProductoData) =>
      seleccionado
        ? productosApi.actualizar(seleccionado.id, data)
        : productosApi.crear(data),

    onSuccess: async () => {
      await actualizarConsultas()
      setModal(null)
      setAviso('Producto guardado correctamente.')
    },
  })

  const actualizarStock = useMutation({
    mutationFn: (data: {
      id: number
      stock: number
      disponible: boolean
    }) =>
      productosApi.actualizarStock(data.id, {
        stock: data.stock,
        disponible: data.disponible,
      }),

    onSuccess: async () => {
      await actualizarConsultas()
      setModal(null)
      setAviso('Stock actualizado correctamente.')
    },
  })

  const eliminar = useMutation({
    mutationFn: productosApi.eliminar,

    onSuccess: async () => {
      setPagina(0)
      await actualizarConsultas()
      setAviso('Producto desactivado correctamente.')
    },

    onError: (e) => setError(handleApiError(e)),
  })

  const columns: ColumnDef<Producto>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'nombre', header: 'Producto' },
    {
      id: 'categoria',
      header: 'Categoria',
      cell: ({ row }) => row.original.categoria.nombre,
    },
    {
      accessorKey: 'precio_base',
      header: 'Precio',
      cell: ({ row }) => moneda(row.original.precio_base),
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
      cell: ({ row }) => (
        <span className={
          row.original.stock === 0
            ? 'font-bold text-red-600'
            : 'font-bold text-slate-800'
        }>
          {row.original.stock}
        </span>
      ),
    },
    {
      id: 'disponibilidad',
      header: 'Disponible',
      cell: ({ row }) =>
        row.original.disponible ? 'Si' : 'No',
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => abrir('form', row.original)}
          >
            Editar
          </Button>

          <Button
            variant="secondary"
            onClick={() => abrir('stock', row.original)}
          >
            Stock
          </Button>

          <Button
            variant="danger"
            disabled={eliminar.isPending}
            onClick={() => {
              if (window.confirm('Desactivar este producto?')) {
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
        <h2 className="text-2xl font-bold">Productos</h2>

        <Button
          disabled={!categorias.data?.length}
          onClick={() => abrir('form')}
        >
          Nuevo producto
        </Button>
      </header>

      <div className="panel grid gap-4 md:grid-cols-2">
        <input
          className="input"
          aria-label="Buscar productos"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPagina(0)
          }}
        />

        <select
          className="input"
          aria-label="Categoria"
          value={categoria}
          onChange={(e) => {
            setCategoria(e.target.value)
            setPagina(0)
          }}
        >
          <option value="">Todas las categorias</option>
          {categorias.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      {categorias.isError && (
        <EstadoError
          mensaje={handleApiError(categorias.error)}
          reintentar={() => void categorias.refetch()}
        />
      )}

      {aviso && (
        <p role="status" className="rounded-lg bg-green-100 p-3 text-green-800">
          {aviso}
        </p>
      )}

      {error && !modal && <EstadoError mensaje={error} />}

      {productos.isPending ? (
        <Skeleton />
      ) : productos.isError ? (
        <EstadoError
          mensaje={handleApiError(productos.error)}
          reintentar={() => void productos.refetch()}
        />
      ) : (
        <>
          <DataTable
            data={productos.data.items}
            columns={columns}
          />

          <Paginacion
            pagina={pagina}
            total={productos.data.total}
            limite={LIMITE}
            cambiar={setPagina}
          />
        </>
      )}

      {modal && (
        <Modal
          titulo={
            modal === 'stock'
              ? 'Actualizar stock'
              : seleccionado
                ? 'Editar producto'
                : 'Nuevo producto'
          }
          cerrar={() => setModal(null)}
        >
          {error && <EstadoError mensaje={error} />}

          {modal === 'form' ? (
            <ProductoForm
              producto={seleccionado}
              categorias={categorias.data ?? []}
              cancelar={() => setModal(null)}
              guardar={async (data) => {
                try {
                  setError('')
                  await guardar.mutateAsync(data)
                } catch (e) {
                  setError(handleApiError(e))
                }
              }}
            />
          ) : seleccionado ? (
            <StockForm
              producto={seleccionado}
              guardar={async (data) => {
                try {
                  setError('')
                  await actualizarStock.mutateAsync({
                    id: seleccionado.id,
                    ...data,
                  })
                } catch (e) {
                  setError(handleApiError(e))
                }
              }}
            />
          ) : null}
        </Modal>
      )}
    </section>
  )
}
