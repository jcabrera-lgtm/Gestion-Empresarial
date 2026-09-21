import { NavLink, Outlet } from "react-router-dom";

const enlaces = [
  { to: "/", label: "Resumen", end: true },
  { to: "/ventas", label: "Ventas" },
  { to: "/clientes", label: "Clientes" },
  { to: "/productos", label: "Productos e inventario" },
  { to: "/ubicaciones-rack", label: "Racks (WMS)" },
  { to: "/empleados", label: "Empleados" },
];

export default function Layout() {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">Gestión empresarial</div>
        <nav aria-label="Principal">
          {enlaces.map((e) => (
            <NavLink key={e.to} to={e.to} end={e.end}>
              {e.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
