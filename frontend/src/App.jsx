import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Ventas from "./pages/Ventas.jsx";
import Clientes from "./pages/Clientes.jsx";
import Productos from "./pages/Productos.jsx";
import Empleados from "./pages/Empleados.jsx";
import UbicacionesRack from "./pages/UbicacionesRack.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="ventas" element={<Ventas />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="productos" element={<Productos />} />
        <Route path="ubicaciones-rack" element={<UbicacionesRack />} />
        <Route path="empleados" element={<Empleados />} />
        <Route path="*" element={<p className="empty">Esta página no existe.</p>} />
      </Route>
    </Routes>
  );
}
