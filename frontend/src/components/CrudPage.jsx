import { useCallback, useEffect, useState } from "react";
import { api } from "../api.js";
import Modal from "./Modal.jsx";
import ErrorBox from "./ErrorBox.jsx";

function valorInicial(campo, registro) {
  const v = registro?.[campo.name];
  if (campo.type === "checkbox") return v ?? true;
  if (campo.type === "date") return v ? String(v).slice(0, 10) : "";
  if (campo.type === "select") return v?._id ?? v ?? campo.defaultValue ?? "";
  return v ?? "";
}

function construirPayload(campos, valores) {
  const payload = {};
  for (const c of campos) {
    const v = valores[c.name];
    if (c.type === "checkbox") payload[c.name] = Boolean(v);
    else if (c.type === "number") {
      if (v !== "") payload[c.name] = Number(v);
    } else if (c.type === "date") {
      if (v) payload[c.name] = v;
    } else if (c.type === "select") {
      payload[c.name] = v || null;
    } else payload[c.name] = v;
  }
  return payload;
}

function Formulario({ campos, registro, onGuardar, onCancelar }) {
  const [valores, setValores] = useState(() =>
    Object.fromEntries(campos.map((c) => [c.name, valorInicial(c, registro)]))
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const cambiar = (c, e) =>
    setValores((prev) => ({
      ...prev,
      [c.name]: c.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  async function enviar(e) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      await onGuardar(construirPayload(campos, valores));
    } catch (err) {
      setError(err);
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="modal-body">
      <div className="form-grid">
        {campos.map((c) =>
          c.type === "checkbox" ? (
            <label key={c.name} className="check full">
              <input type="checkbox" checked={valores[c.name]} onChange={(e) => cambiar(c, e)} />
              {c.label}
            </label>
          ) : c.type === "select" ? (
            <label key={c.name} className={c.full ? "field full" : "field"}>
              <span>{c.label}</span>
              <select value={valores[c.name]} required={c.required} onChange={(e) => cambiar(c, e)}>
                <option value="">{c.placeholder ?? "— Sin asignar —"}</option>
                {(c.options ?? []).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label key={c.name} className={c.full ? "field full" : "field"}>
              <span>{c.label}</span>
              <input
                type={c.type ?? "text"}
                value={valores[c.name]}
                required={c.required}
                min={c.min}
                step={c.step}
                onChange={(e) => cambiar(c, e)}
              />
            </label>
          )
        )}
      </div>
      <ErrorBox error={error} />
      <div className="modal-actions">
        <button type="button" className="btn ghost" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="btn primary" disabled={guardando}>
          {guardando ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}

/**
 * Pantalla CRUD reutilizable: tabla con búsqueda + formulario en ventana.
 * columnas: [{ key, label, align?, render?(fila) }]
 * campos:   [{ name, label, type?, required?, min?, step?, full? }]
 */
export default function CrudPage({
  titulo,
  singular,
  endpoint,
  labelKey = "nombre",
  columnas,
  campos,
  placeholderBusqueda,
  vacio,
}) {
  const [filas, setFilas] = useState(null);
  const [q, setQ] = useState("");
  const [error, setError] = useState(null);
  const [editando, setEditando] = useState(null); // null = cerrado, {} = nuevo, fila = editar

  const cargar = useCallback(async () => {
    try {
      setError(null);
      setFilas(await api.get(`/${endpoint}?q=${encodeURIComponent(q)}`));
    } catch (err) {
      setError(err);
    }
  }, [endpoint, q]);

  useEffect(() => {
    const t = setTimeout(cargar, 250); // espera a que termines de escribir
    return () => clearTimeout(t);
  }, [cargar]);

  async function guardar(payload) {
    if (editando._id) await api.put(`/${endpoint}/${editando._id}`, payload);
    else await api.post(`/${endpoint}`, payload);
    setEditando(null);
    cargar();
  }

  async function eliminar(fila) {
    if (!window.confirm(`¿Eliminar ${singular} "${fila[labelKey]}"? Esta acción no se puede deshacer.`))
      return;
    try {
      await api.del(`/${endpoint}/${fila._id}`);
      cargar();
    } catch (err) {
      setError(err);
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>{titulo}</h1>
        <button className="btn primary" onClick={() => setEditando({})}>
          Nuevo {singular}
        </button>
      </div>

      <div className="toolbar">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholderBusqueda}
          aria-label="Buscar"
        />
      </div>

      <ErrorBox error={error} />

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columnas.map((c) => (
                <th key={c.key} className={c.align === "right" ? "num" : undefined}>
                  {c.label}
                </th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {filas?.map((f) => (
              <tr key={f._id}>
                {columnas.map((c) => (
                  <td key={c.key} className={c.align === "right" ? "num" : undefined}>
                    {c.render ? c.render(f) : (f[c.key] ?? "—")}
                  </td>
                ))}
                <td className="actions">
                  <button className="btn link" onClick={() => setEditando(f)}>
                    Editar
                  </button>
                  <button className="btn link danger" onClick={() => eliminar(f)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filas === null && !error && <p className="empty">Cargando…</p>}
        {filas?.length === 0 && (
          <p className="empty">{q ? "Ningún resultado coincide con tu búsqueda." : vacio}</p>
        )}
      </div>

      {editando && (
        <Modal
          title={editando._id ? `Editar ${singular}` : `Nuevo ${singular}`}
          onClose={() => setEditando(null)}
        >
          <Formulario
            campos={campos}
            registro={editando._id ? editando : null}
            onGuardar={guardar}
            onCancelar={() => setEditando(null)}
          />
        </Modal>
      )}
    </>
  );
}

export function Estado({ activo }) {
  return <span className={activo ? "tag ok" : "tag off"}>{activo ? "Activo" : "Inactivo"}</span>;
}
