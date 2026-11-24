import { useForm } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'

import { pedidosApi } from './pedidosApi'
import { useCartStore } from '../../stores/cartStore'
import type { FormaPago } from '../../shared/api/types'
import { moneda } from '../../shared/api/format'
import { handleApiError } from '../../shared/api/handleApiError'
import { Input } from '../../shared/ui/Input'
import { Button } from '../../shared/ui/Button'
import { EstadoError } from '../../shared/components/EstadoError'

export function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const vaciar = useCartStore((s) => s.vaciar)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const total = items.reduce(
    (sum, item) => sum + item.producto.precio_base * item.cantidad,
    0,
  )

  const mutation = useMutation({
    mutationFn: pedidosApi.crear,

    onSuccess: async (pedido) => {
      vaciar()

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['productos'] }),
        queryClient.invalidateQueries({ queryKey: ['pedidos'] }),
        queryClient.invalidateQueries({ queryKey: ['resumen'] }),
      ])

      navigate('/mis-pedidos', {
        replace: true,
        state: { pedidoCreado: pedido.id },
      })
    },
  })

  const form = useForm({
    defaultValues: {
      direccion_entrega: '',
      forma_pago: 'EFECTIVO' as FormaPago,
      notas: '',
    },

    onSubmit: async ({ value }) => {
      if (items.length === 0) return

      try {
        await mutation.mutateAsync({
          direccion_entrega: value.direccion_entrega.trim(),
          forma_pago: value.forma_pago,
          notas: value.notas.trim() || undefined,
          items: items.map((item) => ({
            producto_id: item.producto.id,
            cantidad: item.cantidad,
          })),
        })
      } catch {
        // El error se muestra mediante el estado de la mutacion.
      }
    },
  })

  if (items.length === 0) {
    return (
      <div className="panel text-center">
        <p className="mb-4">No hay productos en el carrito.</p>
        <Link to="/" className="btn">Volver al catalogo</Link>
      </div>
    )
  }

  return (
    <section>
      <h1 className="page-title">Finalizar compra</h1>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <form
          className="panel space-y-5"
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
          }}
        >
          <h2 className="text-xl font-bold">Datos de entrega</h2>

          <form.Field name="direccion_entrega">
            {(field) => (
              <Input
                label="Direccion de entrega"
                required
                minLength={5}
                maxLength={200}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>

          <form.Field name="forma_pago">
            {(field) => (
              <label className="block space-y-2">
                <span className="font-semibold">Forma de pago</span>

                <select
                  className="input"
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(e.target.value as FormaPago)
                  }
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                </select>
              </label>
            )}
          </form.Field>

          <form.Field name="notas">
            {(field) => (
              <label className="block space-y-2">
                <span className="font-semibold">Notas adicionales</span>

                <textarea
                  className="input min-h-24"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </label>
            )}
          </form.Field>

          {mutation.isError && (
            <EstadoError mensaje={handleApiError(mutation.error)} />
          )}

          <form.Subscribe selector={(s) => s.isSubmitting}>
            {(enviando) => (
              <Button
                type="submit"
                className="w-full"
                disabled={enviando || mutation.isPending}
              >
                {enviando ? 'Procesando pedido...' : 'Confirmar pedido'}
              </Button>
            )}
          </form.Subscribe>

          <Link to="/carrito" className="btn-secondary w-full">
            Volver al carrito
          </Link>
        </form>

        <aside className="panel h-fit space-y-4">
          <h2 className="text-xl font-bold">Tu pedido</h2>

          {items.map((item) => (
            <div
              key={item.producto.id}
              className="flex justify-between gap-3 border-b pb-3"
            >
              <span>{item.cantidad} x {item.producto.nombre}</span>

              <strong>
                {moneda(item.producto.precio_base * item.cantidad)}
              </strong>
            </div>
          ))}

          <p className="text-2xl font-black">
            Total estimado: {moneda(total)}
          </p>

          <p className="text-sm text-slate-500">
            El servidor verifica el precio y la disponibilidad al confirmar.
          </p>
        </aside>
      </div>
    </section>
  )
}
