# Food Store - Sistema de Gestion de Pedidos

## Trabajo Practico Integrador

- Institucion: Universidad Tecnologica Nacional (UTN).
- Carrera: Tecnicatura Universitaria en Programacion.
- Materia: Programacion IV.
- Autor: Israel Garcia.
- Modalidad: Individual.
- Ano: 2026.

## 1. Descripcion

Food Store es una aplicacion web Full Stack orientada a la
comercializacion de productos gastronomicos.

Permite a los clientes consultar un catalogo, registrarse,
iniciar sesion, gestionar un carrito y realizar pedidos.

Los administradores pueden gestionar categorias, productos,
stock, usuarios y pedidos, ademas de consultar indicadores
generales del negocio.

## 2. Enlaces de entrega

- Repositorio: https://github.com/Isragadiel/FoodStore-TPI-FINAL
- Video de demostracion: PENDIENTE_VIDEO

## 3. Tecnologias utilizadas

### Backend

- Python 3.13.
- FastAPI.
- SQLModel y SQLAlchemy.
- PostgreSQL.
- Uvicorn.
- Pydantic Settings.
- JWT mediante python-jose.
- Passlib y bcrypt.

### Frontend

- React 19.
- TypeScript 5.9.
- Vite 7.
- Tailwind CSS 4.
- TanStack Query 5.
- TanStack Form 1.
- TanStack Table 8.
- React Router 7.
- Zustand 5.
- Axios.
- pnpm.

## 4. Arquitectura

El backend utiliza una arquitectura modular por dominio,
con separacion de responsabilidades entre las capas.

```text
Router
  |
Service
  |
Unit of Work
  |
Repository
  |
Model / PostgreSQL
```

Los routers reciben las solicitudes HTTP.
Los servicios implementan las reglas de negocio.
Los repositorios centralizan el acceso a los datos.
Unit of Work administra las transacciones, realizando
commit o rollback segun corresponda.

El frontend utiliza una arquitectura organizada por
funcionalidades, componentes reutilizables y servicios API.

TanStack Query administra el estado del servidor.
Zustand administra la sesion y el carrito.
TanStack Form administra los formularios.
TanStack Table administra las tablas administrativas.

## 5. Estructura del proyecto

```text
FoodStore-TPI-FINAL/
|-- backend/
|   |-- app/
|   |   |-- core/
|   |   |-- db/
|   |   |-- modules/
|   |   |   |-- auth/
|   |   |   |-- usuarios/
|   |   |   |-- categorias/
|   |   |   |-- productos/
|   |   |   |-- pedidos/
|   |   |-- main.py
|   |-- requirements.txt
|   |-- .env.example
|-- frontend/
|   |-- src/
|   |   |-- features/
|   |   |-- shared/
|   |   |-- stores/
|   |   |-- routes/
|   |   |-- App.tsx
|   |   |-- main.tsx
|   |-- package.json
|   |-- pnpm-lock.yaml
|   |-- .env.example
|-- .gitignore
|-- README.md
```

## 6. Requisitos previos

- Python 3.13 recomendado.
- PostgreSQL instalado y en funcionamiento.
- Node.js 20.19+ o una version compatible con Vite 7.
- pnpm 9 o superior.
- Git.

El proyecto fue desarrollado y probado en Windows,
con Python 3.13, PostgreSQL 18 y Node.js 24.

## 7. Instalacion y ejecucion

### 7.1. Clonar el repositorio

```bash
git clone https://github.com/Isragadiel/FoodStore-TPI-FINAL.git
cd FoodStore-TPI-FINAL
```

Tambien es posible descomprimir el ZIP de entrega y
ejecutar los siguientes pasos desde su carpeta raiz.

### 7.2. Crear la base de datos

Desde pgAdmin o psql, ejecutar:

```sql
CREATE DATABASE food_store_tpi;
```

No es necesario crear las tablas manualmente.

### 7.3. Configurar el backend

Abrir una terminal:

```powershell
cd backend
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
```

En Linux o macOS, la activacion del entorno virtual es:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Editar el archivo backend/.env con los datos reales
de la instalacion local de PostgreSQL.

```dotenv
DATABASE_URL=postgresql+psycopg2://postgres:TU_PASSWORD@localhost:5432/food_store_tpi
SECRET_KEY=REEMPLAZAR_POR_CLAVE_ALEATORIA
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_ORIGIN=http://localhost:5173
```

Si la contrasena de PostgreSQL contiene caracteres
reservados de URL, deben codificarse correctamente.

Generar una clave secreta segura:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Copiar el resultado en SECRET_KEY.

### 7.4. Inicializar los datos

Desde la carpeta backend, con el entorno virtual activo:

```bash
python -m app.db.seed
```

El seed crea las tablas necesarias, un administrador,
tres categorias y nueve productos iniciales.

El proceso puede ejecutarse nuevamente sin duplicar
los registros iniciales.

### 7.5. Iniciar el backend

```bash
uvicorn app.main:app --reload
```

Direcciones disponibles:

- API: http://localhost:8000
- Swagger: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 7.6. Configurar el frontend

Abrir una segunda terminal desde la raiz del proyecto:

```powershell
cd frontend
Copy-Item .env.example .env
pnpm install
pnpm build
pnpm dev
```

En Linux o macOS, utilizar cp en lugar de Copy-Item.

El archivo frontend/.env debe contener:

```dotenv
VITE_API_URL=http://localhost:8000/api/v1
```

Abrir http://localhost:5173 en el navegador.

Utilizar localhost de forma consistente para acceder
al frontend y al backend desde el navegador.

## 8. Credenciales iniciales

| Campo | Valor |
|---|---|
| Usuario administrador | admin |
| Contrasena | Admin1234! |
| Rol | admin |

Estas credenciales corresponden exclusivamente al
administrador inicial del entorno academico.

Los clientes pueden registrarse desde la aplicacion.
No se requiere crear usuarios manualmente en PostgreSQL.

## 9. Funcionalidades

### Cliente

- Registro e inicio de sesion.
- Consulta del catalogo.
- Busqueda, filtros y paginacion.
- Carrito persistente.
- Confirmacion de pedidos.
- Seleccion de forma de pago.
- Consulta del historial y detalle de pedidos.
- Cancelacion de pedidos pendientes.

### Administrador

- Resumen de pedidos e ingresos.
- Alta, consulta, modificacion y baja logica de categorias.
- Alta, consulta, modificacion y baja logica de productos.
- Administracion de stock y disponibilidad.
- Consulta y gestion de pedidos.
- Activacion y desactivacion de usuarios.

## 10. Modelo de datos

El sistema utiliza cinco entidades principales:

- Usuario.
- Categoria.
- Producto.
- Pedido.
- DetallePedido.

Relaciones:

- Categoria 1:N Producto.
- Usuario 1:N Pedido.
- Pedido 1:N DetallePedido.
- Producto 1:N DetallePedido.

El detalle conserva el nombre y precio unitario del
producto al momento de realizar el pedido.

## 11. Reglas de negocio

- Los pedidos deben contener al menos un producto.
- No se permiten productos repetidos en una solicitud.
- Los productos deben estar activos, disponibles y
  contar con stock suficiente.
- El backend calcula los subtotales y el total.
- La creacion del pedido y el descuento de stock se
  realizan dentro de una misma transaccion.
- La cancelacion restituye el stock correspondiente.
- Los clientes solo pueden consultar sus propios pedidos.
- Los clientes pueden cancelar sus pedidos pendientes.
- Los pedidos entregados y cancelados son terminales.
- Los detalles y totales historicos no se modifican.

Transiciones permitidas:

```text
PENDIENTE -> EN_PREPARACION -> ENTREGADO
PENDIENTE -> CANCELADO
EN_PREPARACION -> CANCELADO
```

## 12. Seguridad

- Contrasenas almacenadas mediante hashing bcrypt.
- Autenticacion JWT con expiracion de 30 minutos.
- Cookie HttpOnly para el token de acceso.
- Autorizacion por roles en el backend.
- Proteccion de rutas en el frontend.
- Validacion de datos mediante esquemas.
- CORS configurado para el origen autorizado.
- Variables sensibles excluidas del repositorio.

La configuracion de cookies corresponde a un entorno
local HTTP. Para un despliegue productivo se requiere
HTTPS, cookies Secure y una configuracion de seguridad
adaptada al entorno.

## 13. Verificacion del proyecto

Durante el desarrollo se realizaron pruebas manuales
mediante solicitudes HTTP y pruebas funcionales desde
la interfaz web.

| Modulo | Verificacion |
|---|---|
| Backend | Importacion y compilacion correctas |
| Dependencias | pip check sin conflictos |
| Autenticacion | Registro, login y autorizacion |
| Categorias | CRUD y baja logica |
| Productos | 10 de 10 pruebas HTTP superadas |
| Pedidos | 15 de 15 pruebas HTTP superadas |
| Transacciones | Descuento, restitucion y rollback |
| Frontend | TypeScript sin errores |
| Build | Compilacion de produccion correcta |
| Interfaz | Flujo de compra y gestion administrativa |
| Seguridad | Acceso administrativo segun rol |

Las pruebas HTTP fueron ejecutadas manualmente durante
el desarrollo. No se presenta esta verificacion como
una suite automatizada de pruebas unitarias.

Comandos de verificacion:

Backend:

```bash
python -m compileall -q app
python -m pip check
```

Frontend:

```bash
pnpm exec tsc --noEmit -p tsconfig.app.json
pnpm build
```

## 14. Alcance y limitaciones

El sistema corresponde al alcance academico del TPI.
No integra pasarelas de pago reales ni procesamiento
de tarjetas.

El build genera una advertencia por el tamano del
bundle JavaScript, sin impedir su compilacion.

## 15. Buenas practicas

- Separacion de responsabilidades.
- Arquitectura modular.
- Repository Pattern y Unit of Work.
- Reutilizacion de componentes.
- Centralizacion de la comunicacion HTTP.
- Tipado mediante TypeScript y esquemas Python.
- Manejo de errores y validaciones.
- Control de versiones con Git.
- Configuracion mediante variables de entorno.
- Dependencias versionadas y lockfile del frontend.

## 16. Autor

Israel Garcia.

Trabajo Practico Integrador de Programacion IV.
Universidad Tecnologica Nacional - 2026.
