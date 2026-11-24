import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { authApi } from '../features/auth/authApi'
import type { Usuario } from '../shared/api/types'
import { queryClient } from '../shared/api/queryClient'

interface AuthState {
  usuario: Usuario | null
  cargando: boolean
  login: (
    username: string,
    password: string,
  ) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  limpiarSesion: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (username, password) => {
        await authApi.login(username, password)
        const usuario = await authApi.me()

        queryClient.clear()
        set({ usuario, cargando: false })
      },

      logout: async () => {
        await authApi.logout()
        queryClient.clear()
        set({ usuario: null, cargando: false })
      },

      checkSession: async () => {
        set({ cargando: true })

        try {
          const usuario = await authApi.me()
          set({ usuario })
        } catch {
          queryClient.clear()
          set({ usuario: null })
        } finally {
          set({ cargando: false })
        }
      },

      limpiarSesion: () => {
        queryClient.clear()
        set({ usuario: null, cargando: false })
      },
    }),
    {
      name: 'food-store-auth',
      partialize: (state) => ({
        usuario: state.usuario,
      }),
    },
  ),
)
