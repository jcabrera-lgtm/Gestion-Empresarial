import CrudPage, { Estado } from "../components/CrudPage.jsx";

export default function Clientes() {
  return (
    <CrudPage
      titulo="Clientes"
      singular="cliente"
      endpoint="clientes"
      placeholderBusqueda="Buscar por nombre, cédula/RUC o correo"
      vacio="Aún no hay clientes. Crea el primero para poder registrar ventas."
      columnas={[
        { key: "nombre", label: "Nombre" },
        { key: "identificacion", label: "Cédula / RUC" },
        { key: "email", label: "Correo" },
        { key: "telefono", label: "Teléfono" },
        { key: "activo", label: "Estado", render: (f) => <Estado activo={f.activo} /> },
      ]}
      campos={[
        { name: "nombre", label: "Nombre o razón social", required: true, full: true },
        { name: "identificacion", label: "Cédula / RUC" },
        { name: "telefono", label: "Teléfono", type: "tel" },
        { name: "email", label: "Correo", type: "email", full: true },
        { name: "direccion", label: "Dirección", full: true },
        { name: "activo", label: "Cliente activo", type: "checkbox" },
      ]}
    />
  );
}
