const dinero = new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" });

export const fmtMoney = (n) => dinero.format(n ?? 0);

export const fmtDate = (d) =>
  d ? new Intl.DateTimeFormat("es-EC", { dateStyle: "medium" }).format(new Date(d)) : "—";

export const fmtDateTime = (d) =>
  d
    ? new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(new Date(d))
    : "—";

// "2026-09" -> "sep"
export const mesCorto = (ym) =>
  new Intl.DateTimeFormat("es-EC", { month: "short" }).format(new Date(`${ym}-15T12:00:00`));

export const mesLargo = (fecha = new Date()) =>
  new Intl.DateTimeFormat("es-EC", { month: "long", year: "numeric" }).format(fecha);

const compacto = new Intl.NumberFormat("es-EC", { notation: "compact", maximumFractionDigits: 1 });
export const fmtCompact = (n) => compacto.format(n ?? 0);
