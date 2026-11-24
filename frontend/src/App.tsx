import { useEffect } from 'react'
import { AppRouter } from './routes/AppRouter'
import { useAuthStore } from './stores/authStore'

export default function App() {
  const checkSession = useAuthStore((s) => s.checkSession)
  const limpiarSesion = useAuthStore((s) => s.limpiarSesion)

  useEffect(() => {
    const unauthorized = () => limpiarSesion()

    window.addEventListener('auth:unauthorized', unauthorized)

    void checkSession()

    return () => {
      window.removeEventListener('auth:unauthorized', unauthorized)
    }
  }, [checkSession, limpiarSesion])

  return <AppRouter />
}
