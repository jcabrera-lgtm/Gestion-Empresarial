import CrudPage from "../components/CrudPage.jsx";

const AREAS = ["A1", "A2", "A3", "A4"].map((a) => ({ value: a, label: a }));

const ESTADOS = [
  { value: "libre", label: "Libre" },
  { value: "ocupado", label: "Ocupado" },
  { value: "bloqueado", label: "Bloqueado" },
];

export default function UbicacionesRack() {
  return (
    <CrudPage
      titulo="Ubicaciones de rack (WMS)"
      singular="rack"
      endpoint="ubicaciones-rack"
      labelKey="codigo"
      placeholderBusqueda="Buscar por código, bodega, área, pasillo o rack"
      vacio="Aún no hay racks registrados. Crea el primero para empezar a ubicar productos."
      columnas={[
        { key: "codigo", label: "Código (QR)" },
        { key: "bodega", label: "Bodega" },
        { key: "area", label: "N° de área" },
        { key: "pasillo", label: "Pasillo" },
        { key: "rack", label: "Rack" },
        { key: "bin", label: "Bin" },
        {
          key: "estado",
          label: "Estado",
          render: (f) => (
            <span className={`tag ${f.estado === "libre" ? "ok" : f.estado === "bloqueado" ? "off" : "warn"}`}>
              {ESTADOS.find((e) => e.value === f.estado)?.label ?? f.estado}
            </span>
          ),
        },
      ]}
      campos={[
        { name: "bodega", label: "Bodega / Sede", required: true },
        { name: "area", label: "N° de área", type: "select", options: AREAS, required: true, placeholder: "— Selecciona —" },
        { name: "pasillo", label: "Pasillo", required: true },
        { name: "rack", label: "Rack", required: true },
        { name: "bin", label: "Bin / Posición", required: true },
        { name: "capacidadMaxima", label: "Capacidad máxima (unidades)", type: "number", min: 0, step: "1" },
        { name: "estado", label: "Estado", type: "select", options: ESTADOS, defaultValue: "libre" },
        { name: "activo", label: "Ubicación activa", type: "checkbox" },
      ]}
    />
  );
}
