import { useEffect, useRef, useState } from "react";
import { api } from "../api.js";

/**
 * Buscador tipear/escanear reutilizable (el mismo patrón que ya usa Productos).
 * - Si el texto es un código exacto (SKU, EAN-12/13/14) y el usuario presiona Enter
 *   o un lector de código de barras "escribe + Enter", resuelve contra
 *   GET /productos/escaneo/:codigo y confirma directo (empaque + factor incluidos).
 * - Mientras se escribe, sugiere coincidencias parciales (código, nombre, categoría)
 *   contra GET /productos?q= para que también sirva como buscador normal.
 *
 * onSeleccionar(producto, { empaque, factorUnidades }) se llama al elegir.
 */
export default function BuscadorProducto({ onSeleccionar, placeholder, soloActivos = true }) {
  const [texto, setTexto] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const debounce = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => () => clearTimeout(debounce.current), []);

  function cambiar(valor) {
    setTexto(valor);
    setError(null);
    clearTimeout(debounce.current);
    if (!valor.trim()) {
      setSugerencias([]);
      setAbierto(false);
      return;
    }
    debounce.current = setTimeout(async () => {
      try {
        const resultados = await api.get(`/productos?q=${encodeURIComponent(valor.trim())}`);
        setSugerencias(soloActivos ? resultados.filter((p) => p.activo) : resultados);
        setAbierto(true);
      } catch {
        // Silencioso mientras se escribe; el error real se muestra al confirmar.
      }
    }, 200);
  }

  function elegir(producto, empaque = "unidad", factorUnidades = 1) {
    onSeleccionar(producto, { empaque, factorUnidades });
    setTexto("");
    setSugerencias([]);
    setAbierto(false);
    setError(null);
    inputRef.current?.focus();
  }

  async function confirmar(e) {
    e.preventDefault();
    const codigo = texto.trim();
    if (!codigo) return;

    // Si ya hay una única sugerencia visible, se comporta como si la hubieras elegido
    // (cubre el caso de escribir el nombre completo y presionar Enter).
    if (sugerencias.length === 1 && abierto) {
      elegir(sugerencias[0]);
      return;
    }

    setCargando(true);
    setError(null);
    try {
      const { producto, empaque, factorUnidades } = await api.get(
        `/productos/escaneo/${encodeURIComponent(codigo)}`
      );
      if (soloActivos && !producto.activo) {
        setError(`"${producto.nombre}" está inactivo`);
      } else {
        elegir(producto, empaque, factorUnidades);
      }
    } catch {
      setError("Código no reconocido. Elige una opción de la lista o revisa el código.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="buscador-producto">
      <form onSubmit={confirmar}>
        <input
          ref={inputRef}
          type="search"
          value={texto}
          onChange={(e) => cambiar(e.target.value)}
          onFocus={() => sugerencias.length > 0 && setAbierto(true)}
          onBlur={() => setTimeout(() => setAbierto(false), 150)}
          placeholder={placeholder ?? "Escanear o escribir código, nombre o categoría"}
          autoComplete="off"
        />
        <button type="submit" className="btn ghost" disabled={cargando || !texto.trim()}>
          {cargando ? "Buscando…" : "Agregar"}
        </button>
      </form>

      {abierto && sugerencias.length > 0 && (
        <ul className="buscador-sugerencias">
          {sugerencias.map((p) => (
            <li key={p._id}>
              <button type="button" onMouseDown={() => elegir(p)}>
                <strong>{p.codigo}</strong> — {p.nombre}
                <span className="muted"> (stock {p.stock})</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="buscador-error">{error}</p>}
    </div>
  );
}
