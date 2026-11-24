import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { productosApi } from './productosApi'
import { categoriasApi } from '../categorias/categoriasApi'
import { useCartStore } from '../../stores/cartStore'
import { moneda } from '../../shared/api/format'
import { handleApiError } from '../../shared/api/handleApiError'
import { Skeleton } from '../../shared/components/Skeleton'
import { EstadoError } from '../../shared/components/EstadoError'
import { EstadoVacio } from '../../shared/components/EstadoVacio'
import { Paginacion } from '../../shared/components/Paginacion'
import { Button } from '../../shared/ui/Button'

const LIMITE = 9

export function CatalogoPage() {
  const [pagina, setPagina] = useState(0)
  const [search, setSearch] = useState('')
  const [categoria, setCategoria] = useState('')
  const [aviso, setAviso] = useState('')

  const agregar = useCartStore((s) => s.agregar)
  const items = useCartStore((s) => s.items)

  const categorias = useQuery({
    queryKey: ['categorias'],
    queryFn: categoriasApi.listar,
  })

  const productos = useQuery({
    queryKey: ['productos', pagina, search, categoria],
    queryFn: () =>
      productosApi.listar({
        skip: pagina * LIMITE,
        limit: LIMITE,
        search: search || undefined,
        categoria_id: categoria ? Number(categoria) : undefined,
      }),
  })

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-slate-900 px-8 py-12 text-white">
        <p className="mb-2 font-bold text-orange-400">
          FOOD STORE
        </p>

        <h1 className="text-4xl font-black">
          Tu comida favorita, a un clic
        </h1>

        <p className="mt-3 text-slate-300">
          Explora nuestro menu y realiza tu pedido online.
        </p>
      </section>

      <div className="panel grid gap-4 md:grid-cols-2">
        <input
          className="input"
          aria-label="Buscar productos"
          placeholder="Buscar hamburguesas, pizzas, bebidas..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPagina(0)
          }}
        />

        <select
          className="input"
          aria-label="Filtrar categoria"
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

      {productos.isPending ? (
        <Skeleton />
      ) : productos.isError ? (
        <EstadoError
          mensaje={handleApiError(productos.error)}
          reintentar={() => void productos.refetch()}
        />
      ) : productos.data.items.length === 0 ? (
        <EstadoVacio mensaje="No encontramos productos." />
      ) : (
        <>
          <p className="text-sm text-slate-500">
            {productos.data.total} productos encontrados
          </p>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {productos.data.items.map((p) => {
              const cantidad = items.find(
                (item) => item.producto.id === p.id,
              )?.cantidad ?? 0

              const disponible = p.disponible && p.stock > 0

              return (
                <article key={p.id} className="panel flex flex-col">
                  {p.imagen_url ? (
                    <img
                      src={p.imagen_url}
                      alt={p.nombre}
                      className="mb-4 h-44 w-full rounded-lg object-cover"
                    />
                  ) : (
                    <div className="mb-4 flex h-44 items-center justify-center rounded-lg bg-orange-50 text-5xl">
                      {p.categoria.nombre.toLowerCase().includes('pizza')
                        ? '🍕'
                        : p.categoria.nombre.toLowerCase().includes('bebida')
                          ? '🥤'
                          : '🍔'}
                    </div>
                  )}

                  <p className="text-xs font-bold uppercase text-orange-600">
                    {p.categoria.nombre}
                  </p>

                  <h2 className="mt-1 text-xl font-bold">{p.nombre}</h2>

                  <p className="my-2 flex-1 text-sm text-slate-500">
                    {p.descripcion}
                  </p>

                  <p className="text-2xl font-black">
                    {moneda(p.precio_base)}
                  </p>

                  <p className="mb-4 text-sm text-slate-500">
                    {disponible ? `Stock: ${p.stock}` : 'No disponible'}
                  </p>

                  <Button
                    disabled={!disponible || cantidad >= p.stock}
                    onClick={() => {
                      agregar(p)
                      setAviso(`${p.nombre} agregado al carrito`)
                    }}
                  >
                    {disponible ? 'Agregar al carrito' : 'Sin disponibilidad'}
                  </Button>
                </article>
              )
            })}
          </div>

          <Paginacion
            pagina={pagina}
            total={productos.data.total}
            limite={LIMITE}
            cambiar={setPagina}
          />
        </>
      )}
    </div>
  )
}
