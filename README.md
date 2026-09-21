# Sistema de gestión empresarial

Aplicación web para administrar el día a día de una pequeña empresa: clientes, productos e inventario, ventas con IVA y empleados.

- **Backend:** Node 22, Express 5, Mongoose 9
- **Frontend:** React 19 con Vite
- **Base de datos:** MongoDB 8
- **Infraestructura:** Docker Compose (modo producción y modo desarrollo)

## Estructura

```
gestion-empresarial/
├─ docker-compose.yml        # producción: nginx + API + Mongo
├─ docker-compose-dev.yml    # desarrollo: recarga automática en front y back
├─ .env.example
├─ backend/
│  ├─ dockerfile / dockerfile.dev
│  └─ src/
│     ├─ index.js            # servidor Express
│     ├─ config/db.js        # conexión con reintentos
│     ├─ models/             # Cliente, Producto, Empleado, Venta, Counter
│     ├─ routes/             # crud genérico + ventas + dashboard
│     ├─ middleware/         # manejo de errores
│     └─ seed.js             # datos de ejemplo
└─ frontend/
   ├─ dockerfile / dockerfile.dev / nginx.conf
   └─ src/
      ├─ pages/              # Resumen, Ventas, Clientes, Productos, Empleados
      └─ components/         # Layout, Modal, CrudPage (tabla + formulario reutilizable)
```

## Cómo ejecutarlo

### Desarrollo (recomendado para empezar)

```bash
docker compose -f docker-compose-dev.yml up --build
```

- Aplicación: http://localhost:5173
- API: http://localhost:3000/api/health

Los cambios que guardes en `backend/src` o `frontend/src` se recargan solos.

Para cargar datos de ejemplo (solo inserta si las colecciones están vacías):

```bash
docker compose -f docker-compose-dev.yml exec backend npm run seed
```

### Producción

```bash
cp .env.example .env      # y edita las claves
docker compose up --build -d
```

Aplicación en http://localhost:8080 (puerto configurable con `WEB_PORT`). Mongo no se expone al exterior.

## Reglas de negocio ya implementadas

- **Ventas:** el servidor calcula precios, subtotal, IVA y total; el navegador solo envía cliente y cantidades. El IVA se configura con `IVA_RATE` (por defecto 0,15).
- **Inventario:** al registrar una venta se descuenta el stock de forma atómica; si un producto no alcanza, la venta se rechaza y no se descuenta nada. Al anular una venta, el stock se devuelve.
- **Estados de venta:** pendiente → pagada → anulada (una venta anulada no puede reactivarse).
- **Integridad:** no se puede eliminar un cliente o producto que ya aparece en ventas; se marca como inactivo.
- **Numeración:** las ventas reciben un número correlativo (`V-000001`, `V-000002`…).

## API

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/health` | Comprobación de estado |
| GET | `/api/dashboard` | Datos del resumen |
| GET, POST | `/api/clientes`, `/api/productos`, `/api/empleados` | Listar (con `?q=`) y crear |
| GET, PUT, DELETE | `/api/{recurso}/:id` | Consultar, editar y eliminar |
| GET, POST | `/api/ventas` | Listar (con `?estado=`) y registrar |
| PATCH | `/api/ventas/:id/estado` | Cambiar estado (`pagada` o `anulada`) |

## Pendiente para una versión completa

- Inicio de sesión y roles (administrador, vendedor, contador).
- Compras a proveedores y cuentas por pagar.
- Facturación electrónica SRI.
- Nómina y control de asistencia.
- Reportes exportables (PDF y Excel).
