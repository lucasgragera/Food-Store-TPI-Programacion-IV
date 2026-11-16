import { axiosInstance } from '../../../shared/api/axiosInstance'
import type { UserPublic } from '../../auth/types'

export async function getUsuarios(): Promise<UserPublic[]> {
  return (await axiosInstance.get<UserPublic[]>('/admin/usuarios')).data
}

export async function activarUsuario(id: number): Promise<UserPublic> {
  return (await axiosInstance.post<UserPublic>(`/admin/usuarios/${id}/activar`)).data
}

export async function desactivarUsuario(id: number): Promise<UserPublic> {
  return (await axiosInstance.post<UserPublic>(`/admin/usuarios/${id}/desactivar`)).data
}
