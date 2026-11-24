import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { handleApiError } from '../../shared/api/handleApiError'
import { Input } from '../../shared/ui/Input'
import { Button } from '../../shared/ui/Button'

export function LoginPage() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },

    onSubmit: async ({ value }) => {
      setError('')

      try {
        await login(value.username, value.password)

        const usuario = useAuthStore.getState().usuario

        navigate(
          usuario?.role === 'admin' ? '/admin/resumen' : '/',
          { replace: true },
        )
      } catch (e) {
        setError(handleApiError(e))
      }
    },
  })

  return (
    <section className="panel mx-auto max-w-md">
      <h1 className="page-title">Iniciar sesion</h1>

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
              autoComplete="username"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <Input
              label="Contrasena"
              type="password"
              required
              autoComplete="current-password"
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
              {enviando ? 'Ingresando...' : 'Ingresar'}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <p className="mt-5 text-center text-sm">
        No tenes cuenta?{' '}
        <Link to="/register" className="font-bold text-orange-600">
          Registrate
        </Link>
      </p>
    </section>
  )
}
