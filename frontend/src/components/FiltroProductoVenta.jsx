import { useMemo, useState } from "react";
import { fmtMoney } from "../format.js";

const FILTROS_VACIOS = { codigo: "", nombre: "", categoria: "", precio: "" };

function coincideTexto(valor, filtro) {
  if (!filtro) return true;
  return String(valor ?? "")
    .toLowerCase()
    .includes(filtro.trim().toLowerCase());
}

/**
 * Panel para elegir el producto de una línea de venta filtrando por las mismas
 * columnas de "Productos e inventario" (Código, Nombre, Categoría, Precio por
 * escrito; Stock y Estado como desplegables con opción "por defecto").
 * Una vez elegido el producto y la cantidad, "Agregar producto" lo entrega
 * al carrito mediante onAgregar(producto, cantidad).
 */
export default function FiltroProductoVenta({ productos, onAgregar }) {
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);
  const [stock, setStock] = useState(""); // "" = por defecto, "bajo", "alto"
  const [estado, setEstado] = useState(""); // "" = por defecto, "activo", "inactivo"
  const [elegido, setElegido] = useState(null);
  const [cantidad, setCantidad] = useState(1);

  const hayFiltro = Boolean(
    filtros.codigo || filtros.nombre || filtros.categoria || filtros.precio || stock || estado
  );

  const resultados = useMemo(() => {
    if (!hayFiltro) return [];
    return productos
      .filter((p) => coincideTexto(p.codigo, filtros.codigo))
      .filter((p) => coincideTexto(p.nombre, filtros.nombre))
      .filter((p) => coincideTexto(p.categoria, filtros.categoria))
      .filter((p) => coincideTexto(p.precio, filtros.precio))
      .filter((p) => {
        if (!stock) return true;
        const bajo = p.stock <= p.stockMinimo;
        return stock === "bajo" ? bajo : !bajo;
      })
      .filter((p) => {
        if (!estado) return true;
        return estado === "activo" ? p.activo : !p.activo;
      })
      .slice(0, 8);
  }, [productos, filtros, stock, estado, hayFiltro]);

  function cambiarFiltro(campo, valor) {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
    setElegido(null);
  }

  function elegir(producto) {
    setElegido(producto);
    setCantidad(1);
  }

  function limpiarSeleccion() {
    setElegido(null);
    setCantidad(1);
  }

  function confirmarAgregar() {
    if (!elegido) return;
    onAgregar(elegido, cantidad);
    setElegido(null);
    setCantidad(1);
    setFiltros(FILTROS_VACIOS);
    setStock("");
    setEstado("");
  }

  const bloqueado = !elegido || !elegido.activo || elegido.stock === 0;

  return (
    <div className="filtro-producto-venta">
      <div className="filtro-grid">
        <label className="field">
          <span>Código</span>
          <input
            type="text"
            value={filtros.codigo}
            onChange={(e) => cambiarFiltro("codigo", e.target.value)}
            placeholder="Escribir…"
          />
        </label>
        <label className="field">
          <span>Nombre</span>
          <input
            type="text"
            value={filtros.nombre}
            onChange={(e) => cambiarFiltro("nombre", e.target.value)}
            placeholder="Escribir…"
          />
        </label>
        <label className="field">
          <span>Categoría</span>
          <input
            type="text"
            value={filtros.categoria}
            onChange={(e) => cambiarFiltro("categoria", e.target.value)}
            placeholder="Escribir…"
          />
        </label>
        <label className="field">
          <span>Precio</span>
          <input
            type="text"
            value={filtros.precio}
            onChange={(e) => cambiarFiltro("precio", e.target.value)}
            placeholder="Escribir…"
          />
        </label>
        <label className="field">
          <span>Stock</span>
          <select
            value={stock}
            onChange={(e) => {
              setStock(e.target.value);
              setElegido(null);
            }}
          >
            <option value="">— Por defecto —</option>
            <option value="bajo">Stock bajo</option>
            <option value="alto">Stock alto</option>
          </select>
        </label>
        <label className="field">
          <span>Estado</span>
          <select
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value);
              setElegido(null);
            }}
          >
            <option value="">— Por defecto —</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </label>
      </div>

      {hayFiltro && !elegido && (
        <ul className="filtro-resultados">
          {resultados.map((p) => (
            <li key={p._id}>
              <button type="button" onMouseDown={() => elegir(p)}>
                <strong>{p.nombre}</strong>
                <span className="muted">
                  {" "}
                  — {p.codigo} · {fmtMoney(p.precio)} · stock {p.stock} · {p.activo ? "Activo" : "Inactivo"}
                </span>
              </button>
            </li>
          ))}
          {resultados.length === 0 && <li className="muted sin-resultados">Ningún producto coincide.</li>}
        </ul>
      )}

      <div className="line">
        <div className="field grow">
          <span>Producto</span>
          <div className="line-producto">
            {elegido ? `${elegido.codigo} - ${elegido.nombre}` : "Ningún producto seleccionado"}
          </div>
        </div>
        <label className="field qty">
          <span>Cantidad</span>
          <input
            type="number"
            min="1"
            max={elegido?.stock}
            step="1"
            value={cantidad}
            disabled={!elegido}
            onChange={(e) => setCantidad(e.target.value)}
          />
        </label>
        <button type="button" className="btn link danger" disabled={!elegido} onClick={limpiarSeleccion}>
          Quitar
        </button>
      </div>

      <button type="button" className="btn ghost" disabled={bloqueado} onClick={confirmarAgregar}>
        Agregar producto
      </button>
      {elegido && !elegido.activo && <p className="buscador-error">Este producto está inactivo, no se puede vender.</p>}
      {elegido && elegido.activo && elegido.stock === 0 && (
        <p className="buscador-error">Sin stock disponible para este producto.</p>
      )}
    </div>
  );
}
