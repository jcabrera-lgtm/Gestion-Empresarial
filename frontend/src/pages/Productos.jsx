import { useEffect, useState } from "react";
import CrudPage, { Estado } from "../components/CrudPage.jsx";
import { fmtMoney } from "../format.js";
import { api } from "../api.js";

export default function Productos() {
  const [racks, setRacks] = useState([]);

  useEffect(() => {
    api
      .get("/ubicaciones-rack")
      .then(setRacks)
      .catch(() => setRacks([])); // si el WMS aún no tiene racks cargados, se deja vacío
  }, []);

  return (
    <CrudPage
      titulo="Productos e inventario"
      singular="producto"
      endpoint="productos"
      placeholderBusqueda="Buscar por código, nombre, categoría o código de barras"
      vacio="Aún no hay productos. Agrega el primero para controlar su stock."
      columnas={[
        { key: "codigo", label: "Código" },
        { key: "nombre", label: "Nombre" },
        { key: "categoria", label: "Categoría" },
        {
          key: "codigoBarrasUnidad",
          label: "EAN unidad",
          render: (f) => f.codigoBarrasUnidad || "—",
        },
        {
          key: "ubicacionRackDefecto",
          label: "Rack",
          render: (f) => f.ubicacionRackDefecto?.codigo || "—",
        },
        { key: "precio", label: "Precio", align: "right", render: (f) => fmtMoney(f.precio) },
        {
          key: "stock",
          label: "Stock",
          align: "right",
          render: (f) => (
            <>
              {f.stock}
              {f.stock <= f.stockMinimo && <span className="tag warn">Stock bajo</span>}
            </>
          ),
        },
        { key: "activo", label: "Estado", render: (f) => <Estado activo={f.activo} /> },
      ]}
      campos={[
        { name: "codigo", label: "Código (SKU)", required: true },
        { name: "categoria", label: "Categoría" },
        { name: "nombre", label: "Nombre", required: true, full: true },
        { name: "precio", label: "Precio (sin IVA)", type: "number", required: true, min: 0, step: "0.01" },
        { name: "stock", label: "Stock actual", type: "number", min: 0, step: "1" },
        { name: "stockMinimo", label: "Avisar cuando el stock llegue a", type: "number", min: 0, step: "1" },
        { name: "activo", label: "Producto activo", type: "checkbox" },
        { name: "codigoBarrasUnidad", label: "Código de barras unidad (EAN-12)" },
        { name: "codigoBarrasCaja", label: "Código de caja interna (EAN-13)" },
        { name: "codigoBarrasMaster", label: "Código de cartón máster (EAN-14)" },
        { name: "unidadesPorCaja", label: "Unidades por caja", type: "number", min: 1, step: "1" },
        { name: "unidadesPorMaster", label: "Unidades por cartón máster", type: "number", min: 1, step: "1" },
        {
          name: "ubicacionRackDefecto",
          label: "Rack por defecto (WMS)",
          type: "select",
          full: true,
          placeholder: "— Sin asignar —",
          options: racks.map((r) => ({ value: r._id, label: `${r.codigo} (${r.estado})` })),
        },
      ]}
    />
  );
}
