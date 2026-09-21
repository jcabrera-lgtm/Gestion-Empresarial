import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import ErrorBox from "../components/ErrorBox.jsx";
import { fmtCompact, fmtDateTime, fmtMoney, mesCorto, mesLargo } from "../format.js";
import { CLASE, ETIQUETA } from "./Ventas.jsx";

export default function Dashboard() {
  const [d, setD] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/dashboard").then(setD).catch(setError);
  }, []);

  if (error) return <ErrorBox error={error} />;
  if (!d) return <p className="empty">Cargando…</p>;

  const max = Math.max(...d.ventasPorMes.map((m) => m.total), 1);

  return (
    <>
      <div className="page-head">
        <h1>Resumen</h1>
      </div>

      <section className="hero">
        <div className="hero-main">
          <p className="muted">Vendido en {mesLargo()}</p>
          <p className="hero-figure">{fmtMoney(d.ventasMes.total)}</p>
          <p>
            {d.ventasMes.cantidad} {d.ventasMes.cantidad === 1 ? "venta registrada" : "ventas registradas"} este mes.
          </p>
          <p>
            {d.pendientes.cantidad === 0
              ? "No tienes cobros pendientes."
              : `${d.pendientes.cantidad} ${d.pendientes.cantidad === 1 ? "venta espera" : "ventas esperan"} cobro por ${fmtMoney(d.pendientes.total)}.`}
          </p>
        </div>

        <div className="bars" role="img" aria-label="Ventas de los últimos seis meses">
          {d.ventasPorMes.map((m, i) => (
            <div
              className={i === d.ventasPorMes.length - 1 ? "bar-col current" : "bar-col"}
              key={m.mes}
              title={`${mesCorto(m.mes)}: ${fmtMoney(m.total)} en ${m.cantidad} ventas`}
            >
              <span className="bar-value">{fmtCompact(m.total)}</span>
              <div className="bar-track">
                <div className="bar" style={{ height: `${m.total > 0 ? Math.max((m.total / max) * 100, 3) : 0}%` }} />
              </div>
              <span className="bar-label">{mesCorto(m.mes)}</span>
            </div>
          ))}
        </div>
      </section>

      <dl className="strip">
        <div>
          <dt>Clientes activos</dt>
          <dd>{d.conteos.clientes}</dd>
        </div>
        <div>
          <dt>Productos activos</dt>
          <dd>{d.conteos.productos}</dd>
        </div>
        <div>
          <dt>Empleados activos</dt>
          <dd>{d.conteos.empleados}</dd>
        </div>
      </dl>

      <div className="two-col">
        <section>
          <h2>Productos por reponer</h2>
          {d.stockBajo.length === 0 ? (
            <p className="empty">Todo el inventario está sobre su mínimo.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th className="num">Stock</th>
                    <th className="num">Mínimo</th>
                  </tr>
                </thead>
                <tbody>
                  {d.stockBajo.map((p) => (
                    <tr key={p._id}>
                      <td>{p.nombre}</td>
                      <td className="num">{p.stock}</td>
                      <td className="num">{p.stockMinimo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="more">
            <Link to="/productos">Ver inventario</Link>
          </p>
        </section>

        <section>
          <h2>Últimas ventas</h2>
          {d.ultimasVentas.length === 0 ? (
            <p className="empty">Aún no hay ventas registradas.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Cliente</th>
                    <th className="num">Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {d.ultimasVentas.map((v) => (
                    <tr key={v._id} title={fmtDateTime(v.createdAt)}>
                      <td>{v.numero}</td>
                      <td>{v.cliente?.nombre ?? "—"}</td>
                      <td className="num">{fmtMoney(v.total)}</td>
                      <td>
                        <span className={`tag ${CLASE[v.estado]}`}>{ETIQUETA[v.estado]}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="more">
            <Link to="/ventas">Ver todas las ventas</Link>
          </p>
        </section>
      </div>
    </>
  );
}
