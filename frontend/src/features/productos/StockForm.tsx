import { useForm } from '@tanstack/react-form'
import type { Producto } from '../../shared/api/types'
import { Input } from '../../shared/ui/Input'
import { Button } from '../../shared/ui/Button'

interface Props {
  producto: Producto
  guardar: (data: {
    stock: number
    disponible: boolean
  }) => Promise<void>
}

export function StockForm({ producto, guardar }: Props) {
  const form = useForm({
    defaultValues: {
      stock: producto.stock,
      disponible: producto.disponible,
    },
    onSubmit: async ({ value }) => {
      await guardar(value)
    },
  })

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <p className="font-bold">{producto.nombre}</p>

      <form.Field name="stock">
        {(field) => (
          <Input
            label="Cantidad disponible"
            type="number"
            required
            min={0}
            step={1}
            value={field.state.value}
            onChange={(e) =>
              field.handleChange(Number(e.target.value))
            }
          />
        )}
      </form.Field>

      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={field.state.value}
              onChange={(e) =>
                field.handleChange(e.target.checked)
              }
            />
            Disponible para la venta
          </label>
        )}
      </form.Field>

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(enviando) => (
          <Button
            type="submit"
            disabled={enviando}
            className="w-full"
          >
            {enviando ? 'Actualizando...' : 'Actualizar stock'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
