import { useForm } from '@tanstack/react-form'
import type { Categoria, Producto } from '../../shared/api/types'
import type { ProductoData } from './productosApi'
import { Input } from '../../shared/ui/Input'
import { Button } from '../../shared/ui/Button'

interface Props {
  producto?: Producto
  categorias: Categoria[]
  guardar: (data: ProductoData) => Promise<void>
  cancelar: () => void
}

export function ProductoForm({
  producto,
  categorias,
  guardar,
  cancelar,
}: Props) {
  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? '',
      descripcion: producto?.descripcion ?? '',
      categoria_id: producto?.categoria_id ?? categorias[0]?.id ?? 0,
      precio_base: producto?.precio_base ?? 0,
      imagen_url: producto?.imagen_url ?? '',
      stock: producto?.stock ?? 0,
      disponible: producto?.disponible ?? true,
    },

    onSubmit: async ({ value }) => {
      await guardar({
        ...value,
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim(),
        imagen_url: value.imagen_url.trim(),
      })
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
      <form.Field name="nombre">
        {(field) => (
          <Input
            label="Nombre"
            required
            minLength={2}
            maxLength={120}
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      </form.Field>

      <form.Field name="descripcion">
        {(field) => (
          <label className="block space-y-1">
            <span className="font-semibold">Descripcion</span>
            <textarea
              className="input"
              maxLength={500}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </label>
        )}
      </form.Field>

      <form.Field name="categoria_id">
        {(field) => (
          <label className="block space-y-1">
            <span className="font-semibold">Categoria</span>
            <select
              className="input"
              required
              value={field.state.value || ''}
              onChange={(e) =>
                field.handleChange(Number(e.target.value))
              }
            >
              <option value="">Seleccionar categoria</option>

              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </label>
        )}
      </form.Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field name="precio_base">
          {(field) => (
            <Input
              label="Precio"
              type="number"
              required
              min={0}
              step="0.01"
              value={field.state.value}
              onChange={(e) =>
                field.handleChange(Number(e.target.value))
              }
            />
          )}
        </form.Field>

        <form.Field name="stock">
          {(field) => (
            <Input
              label="Stock"
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
      </div>

      <form.Field name="imagen_url">
        {(field) => (
          <Input
            label="URL de imagen (opcional)"
            type="url"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
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

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={cancelar}>
          Cancelar
        </Button>

        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(enviando) => (
            <Button type="submit" disabled={enviando}>
              {enviando ? 'Guardando...' : 'Guardar'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
