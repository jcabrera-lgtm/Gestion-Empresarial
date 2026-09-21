export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function errorHandler(err, req, res, next) {
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Revisa los datos ingresados",
      detalles: Object.values(err.errors).map((e) => e.message),
    });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ error: "Identificador o valor inválido" });
  }
  if (err.code === 11000) {
    const campo = Object.keys(err.keyPattern ?? {})[0] ?? "valor";
    return res.status(409).json({ error: `Ya existe un registro con ese ${campo}` });
  }
  const status = err.status ?? 500;
  if (status === 500) console.error(err);
  res.status(status).json({
    error: status === 500 ? "Error interno del servidor" : err.message,
  });
}
