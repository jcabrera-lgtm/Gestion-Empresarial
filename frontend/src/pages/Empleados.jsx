import CrudPage, { Estado } from "../components/CrudPage.jsx";
import { fmtDate, fmtMoney } from "../format.js";

export default function Empleados() {
  return (
    <CrudPage
      titulo="Empleados"
      singular="empleado"
      endpoint="empleados"
      placeholderBusqueda="Buscar por nombre, cargo o departamento"
      vacio="Aún no hay empleados registrados."
      columnas={[
        { key: "nombre", label: "Nombre" },
        { key: "cargo", label: "Cargo" },
        { key: "departamento", label: "Departamento" },
        { key: "salario", label: "Salario", align: "right", render: (f) => (f.salario == null ? "—" : fmtMoney(f.salario)) },
        { key: "fechaIngreso", label: "Ingreso", render: (f) => fmtDate(f.fechaIngreso) },
        { key: "activo", label: "Estado", render: (f) => <Estado activo={f.activo} /> },
      ]}
      campos={[
        { name: "nombre", label: "Nombre completo", required: true, full: true },
        { name: "cargo", label: "Cargo" },
        { name: "departamento", label: "Departamento" },
        { name: "email", label: "Correo", type: "email" },
        { name: "telefono", label: "Teléfono", type: "tel" },
        { name: "salario", label: "Salario mensual", type: "number", min: 0, step: "0.01" },
        { name: "fechaIngreso", label: "Fecha de ingreso", type: "date" },
        { name: "activo", label: "Empleado activo", type: "checkbox" },
      ]}
    />
  );
}
