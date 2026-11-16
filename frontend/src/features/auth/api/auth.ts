import { axiosInstance } from '../../../shared/api/axiosInstance'
import type { UserCreate, UserPublic } from '../types'

export async function loginRequest(username: string, password: string): Promise<void> {
  const form = new URLSearchParams()
  form.set('username', username)
  form.set('password', password)
  await axiosInstance.post('/auth/token', form)
}

export async function registerRequest(data: UserCreate): Promise<UserPublic> {
  const res = await axiosInstance.post<UserPublic>('/auth/register', data)
  return res.data
}

export async function logoutRequest(): Promise<void> {
  await axiosInstance.post('/auth/logout')
}

export async function meRequest(): Promise<UserPublic> {
  const res = await axiosInstance.get<UserPublic>('/auth/me')
  return res.data
}
