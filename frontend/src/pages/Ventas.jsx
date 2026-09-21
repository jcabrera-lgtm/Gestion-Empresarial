import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import Modal from "../components/Modal.jsx";
import ErrorBox from "../components/ErrorBox.jsx";
import FiltroProductoVenta from "../components/FiltroProductoVenta.jsx";
import { fmtDateTime, fmtMoney } from "../format.js";

export const ETIQUETA = { pendiente: "Pendiente de cobro", pagada: "Pagada", anulada: "Anulada" };
export const CLASE = { pendiente: "warn", pagada: "ok", anulada: "off" };

function NuevaVenta({ onCreada, onCancelar }) {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [iva, setIva] = useState(0.15);
  const [cliente, setCliente] = useState("");
  const [lineas, setLineas] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.get("/clientes"), api.get("/productos"), api.get("/config")])
      .then(([c, p, cfg]) => {
        setClientes(c.filter((x) => x.activo));
        setProductos(p); // incluye inactivos: el panel de filtro necesita poder mostrar Estado = Inactivo
        setIva(cfg.iva);
      })
      .catch(setError);
  }, []);

  const porId = useMemo(() => new Map(productos.map((p) => [p._id, p])), [productos]);

  const subtotal = lineas.reduce((suma, l) => {
    const p = porId.get(l.producto);
    return suma + (p ? p.precio * (Number(l.cantidad) || 0) : 0);
  }, 0);
  const valorIva = subtotal * iva;

  // Cartón máster equivalente: cada producto define cuántas unidades trae su
  // cartón máster (unidadesPorMaster). Es solo informativo, no editable.
  const mastersDe = (l) => (Number(l.cantidad) || 0) / (porId.get(l.producto)?.unidadesPorMaster || 1);
  const totalMasters = lineas.reduce((suma, l) => suma + mastersDe(l), 0);

  const editarCantidad = (i, cantidad) =>
    setLineas((prev) => prev.map((l, idx) => (idx === i ? { ...l, cantidad } : l)));

  const quitarLinea = (i) => setLineas((prev) => prev.filter((_, idx) => idx !== i));

  // Panel de filtro (Código/Nombre/Categoría/Precio/Stock/Estado): única forma de
  // agregar productos al carrito. Si el producto ya estaba, suma la cantidad.
  function agregarDesdeFiltro(producto, cantidad) {
    setError(null);
    const cant = Math.max(1, Number(cantidad) || 1);
    setLineas((prev) => {
      const idx = prev.findIndex((l) => l.producto === producto._id);
      if (idx >= 0) {
        const actualizado = [...prev];
        actualizado[idx] = { ...actualizado[idx], cantidad: Number(actualizado[idx].cantidad || 0) + cant };
        return actualizado;
      }
      return [...prev, { producto: producto._id, cantidad: cant }];
    });
  }

  async function enviar(e) {
    e.preventDefault();
    if (lineas.length === 0) {
      setError(new Error("Busca y agrega al menos un producto arriba"));
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      const items = lineas.map((l) => ({ producto: l.producto, cantidad: Number(l.cantidad) }));
      await api.post("/ventas", { cliente, items });
      onCreada();
    } catch (err) {
      setError(err);
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="modal-body">
      <label className="field">
        <span>Cliente</span>
        <select value={cliente} onChange={(e) => setCliente(e.target.value)} required>
          <option value="">Selecciona un cliente</option>
          {clientes.map((c) => (
            <option key={c._id} value={c._id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </label>

      <div className="field full">
        <span>Buscar producto por columna (código, nombre, categoría, precio, stock, estado)</span>
      </div>
      <FiltroProductoVenta productos={productos} onAgregar={agregarDesdeFiltro} />

      <div className="lines">
        {lineas.length === 0 && (
          <p className="empty small">Aún no has agregado productos. Búscalos arriba y usa "Agregar producto".</p>
        )}
        {lineas.map((l, i) => {
          const p = porId.get(l.producto);
          const masters = mastersDe(l);
          const conMaster = (p?.unidadesPorMaster || 1) > 1;
          return (
            <div className="line" key={l.producto}>
              <div className="field grow">
                <span>Producto</span>
                <div className="line-producto">
                  {p ? `${p.codigo} - ${p.nombre} (stock ${p.stock})` : "Producto no encontrado"}
                </div>
              </div>
              <label className="field qty">
                <span>Cantidad</span>
                <input
                  type="number"
                  min="1"
                  max={p?.stock}
                  step="1"
                  value={l.cantidad}
                  onChange={(e) => editarCantidad(i, e.target.value)}
                  required
                />
              </label>
              {conMaster && (
                <div className="field master">
                  <span>Cartón máster</span>
                  <div className="caja-resultado">
                    <strong>{masters.toFixed(2)}</strong>
                    <small>{p.unidadesPorMaster} uds/cartón</small>
                  </div>
                </div>
              )}
              <div className="line-total num">{p ? fmtMoney(p.precio * (Number(l.cantidad) || 0)) : "—"}</div>
              <button type="button" className="btn link danger" onClick={() => quitarLinea(i)}>
                Quitar
              </button>
            </div>
          );
        })}
      </div>

      <dl className="totals">
        {totalMasters > 0 && (
          <div>
            <dt>Cartones máster en esta venta</dt>
            <dd>{totalMasters.toFixed(2)}</dd>
          </div>
        )}
        <div>
          <dt>Subtotal</dt>
          <dd>{fmtMoney(subtotal)}</dd>
        </div>
        <div>
          <dt>IVA ({Math.round(iva * 100)}%)</dt>
          <dd>{fmtMoney(valorIva)}</dd>
        </div>
        <div className="grand">
          <dt>Total a cobrar</dt>
          <dd>{fmtMoney(subtotal + valorIva)}</dd>
        </div>
      </dl>

      <ErrorBox error={error} />
      <div className="modal-actions">
        <button type="button" className="btn ghost" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="btn primary" disabled={guardando}>
          {guardando ? "Registrando…" : "Registrar venta"}
        </button>
      </div>
    </form>
  );
}

function Detalle({ venta }) {
  return (
    <div className="modal-body">
      <p className="muted">
        {venta.cliente?.nombre} - {fmtDateTime(venta.createdAt)}
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th className="num">Cantidad</th>
              <th className="num">Precio</th>
              <th className="num">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {venta.items.map((it) => (
              <tr key={it.producto}>
                <td>
                  {it.nombre} <span className="muted">({it.codigo})</span>
                </td>
                <td className="num">{it.cantidad}</td>
                <td className="num">{fmtMoney(it.precioUnitario)}</td>
                <td className="num">{fmtMoney(it.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <dl className="totals">
        <div>
          <dt>Subtotal</dt>
          <dd>{fmtMoney(venta.subtotal)}</dd>
        </div>
        <div>
          <dt>IVA</dt>
          <dd>{fmtMoney(venta.iva)}</dd>
        </div>
        <div className="grand">
          <dt>Total</dt>
          <dd>{fmtMoney(venta.total)}</dd>
        </div>
      </dl>
    </div>
  );
}

export default function Ventas() {
  const [ventas, setVentas] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [error, setError] = useState(null);
  const [creando, setCreando] = useState(false);
  const [detalle, setDetalle] = useState(null);

  const cargar = useCallback(async () => {
    try {
      setError(null);
      setVentas(await api.get(`/ventas${filtro ? `?estado=${filtro}` : ""}`));
    } catch (err) {
      setError(err);
    }
  }, [filtro]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function cambiarEstado(venta, estado) {
    if (
      estado === "anulada" &&
      !window.confirm(`¿Anular la venta ${venta.numero}? Los productos volverán al inventario.`)
    )
      return;
    try {
      await api.patch(`/ventas/${venta._id}/estado`, { estado });
      cargar();
    } catch (err) {
      setError(err);
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Ventas</h1>
        <button className="btn primary" onClick={() => setCreando(true)}>
          Nueva venta
        </button>
      </div>

      <div className="toolbar">
        <label className="inline">
          Mostrar
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="">Todas las ventas</option>
            <option value="pendiente">Pendientes de cobro</option>
            <option value="pagada">Pagadas</option>
            <option value="anulada">Anuladas</option>
          </select>
        </label>
      </div>

      <ErrorBox error={error} />

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Número</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th className="num">Total</th>
              <th>Estado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {ventas?.map((v) => (
              <tr key={v._id}>
                <td>{v.numero}</td>
                <td>{fmtDateTime(v.createdAt)}</td>
                <td>{v.cliente?.nombre ?? "—"}</td>
                <td className="num">{fmtMoney(v.total)}</td>
                <td>
                  <span className={`tag ${CLASE[v.estado]}`}>{ETIQUETA[v.estado]}</span>
                </td>
                <td className="actions">
                  <button className="btn link" onClick={() => setDetalle(v)}>
                    Ver detalle
                  </button>
                  {v.estado === "pendiente" && (
                    <button className="btn link" onClick={() => cambiarEstado(v, "pagada")}>
                      Marcar como pagada
                    </button>
                  )}
                  {v.estado !== "anulada" && (
                    <button className="btn link danger" onClick={() => cambiarEstado(v, "anulada")}>
                      Anular
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {ventas === null && !error && <p className="empty">Cargando…</p>}
        {ventas?.length === 0 && (
          <p className="empty">
            {filtro
              ? "No hay ventas con este estado."
              : "Todavía no hay ventas. Registra la primera con “Nueva venta”."}
          </p>
        )}
      </div>

      {creando && (
        <Modal title="Nueva venta" wide onClose={() => setCreando(false)}>
          <NuevaVenta
            onCancelar={() => setCreando(false)}
            onCreada={() => {
              setCreando(false);
              cargar();
            }}
          />
        </Modal>
      )}

      {detalle && (
        <Modal title={`Venta ${detalle.numero}`} wide onClose={() => setDetalle(null)}>
          <Detalle venta={detalle} />
        </Modal>
      )}
    </>
  );
}
