import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  loginRequest,
  logoutRequest,
  meRequest,
} from '../features/auth/api/auth'
import type { SesionUsuario, UserPublic } from '../features/auth/types'

interface AuthState {
  usuario: SesionUsuario | null
  cargando: boolean
  login: (username: string, password: string) => Promise<SesionUsuario>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  limpiarSesion: () => void
}

function aSesion(u: UserPublic): SesionUsuario {
  return { id: u.id, username: u.username, full_name: u.full_name, email: u.email, role: u.role }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,
      login: async (username, password) => {
        await loginRequest(username, password)
        const sesion = aSesion(await meRequest())
        set({ usuario: sesion, cargando: false })
        return sesion
      },
      logout: async () => {
        try {
          await logoutRequest()
        } finally {
          set({ usuario: null })
        }
      },
      checkSession: async () => {
        try {
          set({ usuario: aSesion(await meRequest()), cargando: false })
        } catch {
          set({ usuario: null, cargando: false })
        }
      },
      limpiarSesion: () => set({ usuario: null, cargando: false }),
    }),
    {
      name: 'auth-storage',
      // Solo se persiste el usuario (nunca el token, que vive en la cookie HttpOnly).
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
)
