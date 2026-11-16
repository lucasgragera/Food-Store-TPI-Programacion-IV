import axios from 'axios'
import { useAuthStore } from '../../store/authStore'

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  withCredentials: true,
})

const CUENTA_DESACTIVADA = 'Cuenta de usuario desactivada'

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response) {
      const { status, data } = error.response
      const url = error.config?.url ?? ''
      const detail = (data as { detail?: unknown } | undefined)?.detail
      const sesionInvalida =
        (status === 401 && !url.includes('/auth/token') && !url.includes('/auth/me')) ||
        (status === 400 && detail === CUENTA_DESACTIVADA)
      if (sesionInvalida) {
        useAuthStore.getState().limpiarSesion()
        if (window.location.pathname !== '/login') {
          window.location.assign('/login')
        }
      }
    }
    return Promise.reject(error)
  },
)
