export type Rol = 'user' | 'admin'

export interface UserPublic {
  id: number
  username: string
  full_name: string
  email: string
  role: Rol
  disabled: boolean
  created_at: string
}

export interface UserCreate {
  username: string
  full_name: string
  email: string
  password: string
}

/** Datos de sesion que se persisten (nunca el token). */
export interface SesionUsuario {
  id: number
  username: string
  full_name: string
  email: string
  role: Rol
}
