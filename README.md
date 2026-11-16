# Food Store — Trabajo Práctico Integrador (Programación 4)

Aplicación web para un negocio de comidas: backend **FastAPI + SQLModel** y frontend **React + TypeScript**.

- Repositorio: https://github.com/lucasgragera/Food-Store-TPI-Programaci-n-IV
- Video de demostración: https://www.youtube.com/watch?v=421gu8tqtv8

## Estructura

```
backend/    API REST (FastAPI, SQLModel, Unit of Work, JWT en cookie HttpOnly)
frontend/   Cliente (React 19, Vite, Tailwind 4, TanStack Query/Form/Table, Zustand)
README.md
```

## Requisitos

- Python 3.11 a 3.13 (SQLModel 0.0.22 no funciona con 3.14)
- Node.js 20.19 o superior y pnpm 9 o superior
- PostgreSQL 15+ (opcional: para desarrollo local alcanza con SQLite)

## Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # Windows: copy .env.example .env
python -m app.db.seed             # crea tablas, admin, categorías y productos (idempotente)
uvicorn app.main:app --reload
```

La API queda en `http://localhost:8000/api/v1`. Documentación en `http://localhost:8000/docs` y `/redoc`.

### Variables de entorno (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base | `postgresql://user:pass@localhost:5432/foodstore_db` (desarrollo: `sqlite:///./foodstore.db`) |
| `SECRET_KEY` | Firma del JWT (mín. 32 caracteres) | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración de token y cookie | `30` |
| `FRONTEND_ORIGIN` | Origen permitido en CORS | `http://localhost:5173` |

### Usuario administrador del seed

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | `admin` |

El seed también carga 4 categorías y 9 productos con stock. Los usuarios que se registran desde la app tienen rol `user`.

## Frontend

```bash
cd frontend
cp .env.example .env              # Windows: copy .env.example .env
pnpm install
pnpm build                        # verifica los tipos (TypeScript strict)
pnpm dev
```

La app queda en `http://localhost:5173`.

### Variables de entorno (`frontend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

## Funcionalidad

- **Cliente (`user`)**: registro/login, catálogo paginado en el servidor con búsqueda y filtro por categoría, carrito persistido, checkout (dirección, forma de pago, notas), «Mis pedidos» con detalle y cancelación en `PENDIENTE`.
- **Administrador (`admin`)**: resumen con indicadores, ABM de categorías y productos (incluye stock y disponibilidad), pedidos con cambio de estado y cancelación, usuarios con activar/desactivar.
- **Reglas de negocio** (en `backend/app/modules/pedidos/service.py`): creación transaccional con descuento de stock (RN-01), máquina de estados (RN-02), cancelación con restitución de stock (RN-03), permisos por dueño y rol (RN-04), líneas y total inmutables (RN-05), validación de forma de pago y dirección (RN-06).

## Arquitectura

**Backend**: `core/` (config, database, security, deps, `UnitOfWork`, `BaseRepository[T]`) y un paquete por dominio en `modules/` con router → service → unit of work → repository → models/schemas. El commit/rollback ocurre únicamente en el `__exit__` del Unit of Work.

**Frontend**: organizado por features (`features/<dominio>/{pages,components,hooks,api,types}`), `shared/` (api, ui, components, layout), `store/` (Zustand: `authStore`, `cartStore`) y `routes/` (`AppRouter`, `ProtectedRoute`). La sesión viaja en una cookie HttpOnly; el frontend nunca lee ni guarda el token.
