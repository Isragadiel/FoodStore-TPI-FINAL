import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from './authApi'
import { handleApiError } from '../../shared/api/handleApiError'
import { Input } from '../../shared/ui/Input'
import { Button } from '../../shared/ui/Button'

export function RegisterPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const form = useForm({
    defaultValues: {
      username: '',
      full_name: '',
      email: '',
      password: '',
    },

    onSubmit: async ({ value }) => {
      try {
        setError('')
        await authApi.register(value)
        navigate('/login')
      } catch (e) {
        setError(handleApiError(e))
      }
    },
  })

  return (
    <section className="panel mx-auto max-w-md">
      <h1 className="page-title">Crear cuenta</h1>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        <form.Field name="username">
          {(field) => (
            <Input
              label="Usuario"
              required
              minLength={3}
              maxLength={50}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>

        <form.Field name="full_name">
          {(field) => (
            <Input
              label="Nombre completo"
              required
              minLength={2}
              maxLength={100}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>

        <form.Field name="email">
          {(field) => (
            <Input
              label="Correo electronico"
              type="email"
              required
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <Input
              label="Contrasena (minimo 8 caracteres)"
              type="password"
              required
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>

        {error && <p role="alert" className="text-red-600">{error}</p>}

        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(enviando) => (
            <Button type="submit" disabled={enviando} className="w-full">
              {enviando ? 'Registrando...' : 'Crear cuenta'}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <p className="mt-5 text-center text-sm">
        Ya tenes cuenta?{' '}
        <Link to="/login" className="font-bold text-orange-600">
          Ingresar
        </Link>
      </p>
    </section>
  )
}
