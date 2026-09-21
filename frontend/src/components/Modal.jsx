import { useEffect, useRef } from "react";

// Usa el <dialog> nativo: gestiona foco, Escape y capa superior sin código extra.
export default function Modal({ title, onClose, children, wide = false }) {
  const ref = useRef(null);

  useEffect(() => {
    const dlg = ref.current;
    if (dlg && !dlg.open) dlg.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      className={wide ? "modal wide" : "modal"}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose(); // clic en el fondo
      }}
    >
      <header className="modal-head">
        <h2>{title}</h2>
        <button type="button" className="btn ghost" onClick={onClose}>
          Cerrar
        </button>
      </header>
      {children}
    </dialog>
  );
}
