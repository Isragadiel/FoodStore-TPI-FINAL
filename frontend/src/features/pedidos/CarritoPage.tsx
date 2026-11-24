import { Link } from 'react-router-dom'
import { useCartStore } from '../../stores/cartStore'
import { moneda } from '../../shared/api/format'
import { Button } from '../../shared/ui/Button'
import { EstadoVacio } from '../../shared/components/EstadoVacio'

export function CarritoPage() {
  const items = useCartStore((s) => s.items)
  const quitar = useCartStore((s) => s.quitar)
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const vaciar = useCartStore((s) => s.vaciar)

  const total = items.reduce(
    (sum, item) => sum + item.producto.precio_base * item.cantidad,
    0,
  )

  return (
    <section>
      <h1 className="page-title">Mi carrito</h1>

      {items.length === 0 ? (
        <>
          <EstadoVacio mensaje="Tu carrito esta vacio." />
          <Link to="/" className="btn mt-4">
            Explorar productos
          </Link>
        </>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            {items.map(({ producto, cantidad }) => (
              <article
                key={producto.id}
                className="panel flex flex-wrap items-center justify-between gap-4"
              >
                <div>
                  <h2 className="text-lg font-bold">{producto.nombre}</h2>
                  <p className="text-slate-500">
                    {moneda(producto.precio_base)} por unidad
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    disabled={cantidad <= 1}
                    onClick={() => cambiarCantidad(producto.id, cantidad - 1)}
                  >
                    -
                  </Button>

                  <span className="min-w-8 text-center">{cantidad}</span>

                  <Button
                    variant="secondary"
                    disabled={cantidad >= producto.stock}
                    onClick={() => cambiarCantidad(producto.id, cantidad + 1)}
                  >
                    +
                  </Button>
                </div>

                <strong>
                  {moneda(producto.precio_base * cantidad)}
                </strong>

                <Button
                  variant="danger"
                  onClick={() => quitar(producto.id)}
                >
                  Quitar
                </Button>
              </article>
            ))}

            <Button
              variant="secondary"
              onClick={() => {
                if (window.confirm('Vaciar el carrito?')) vaciar()
              }}
            >
              Vaciar carrito
            </Button>
          </div>

          <aside className="panel h-fit space-y-4">
            <h2 className="text-xl font-bold">Resumen de compra</h2>

            <p>
              Unidades: {items.reduce((sum, item) => sum + item.cantidad, 0)}
            </p>

            <div className="border-t pt-4">
              <p className="text-sm text-slate-500">Total estimado</p>
              <p className="text-3xl font-black">{moneda(total)}</p>
            </div>

            <Link to="/checkout" className="btn w-full">
              Finalizar compra
            </Link>

            <Link to="/" className="btn-secondary w-full">
              Seguir comprando
            </Link>
          </aside>
        </div>
      )}
    </section>
  )
}
