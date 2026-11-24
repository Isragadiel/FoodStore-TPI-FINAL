import { useForm } from '@tanstack/react-form'
import type { Categoria } from '../../shared/api/types'
import { Input } from '../../shared/ui/Input'
import { Button } from '../../shared/ui/Button'

interface Props {
  categoria?: Categoria
  guardar: (data: {
    nombre: string
    descripcion: string
  }) => Promise<void>
  cancelar: () => void
}

export function CategoriaForm({
  categoria,
  guardar,
  cancelar,
}: Props) {
  const form = useForm({
    defaultValues: {
      nombre: categoria?.nombre ?? '',
      descripcion: categoria?.descripcion ?? '',
    },

    onSubmit: async ({ value }) => {
      await guardar({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim(),
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
            maxLength={100}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      </form.Field>

      <form.Field name="descripcion">
        {(field) => (
          <label className="block space-y-2">
            <span className="font-semibold">Descripcion</span>

            <textarea
              className="input min-h-24"
              maxLength={500}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
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
