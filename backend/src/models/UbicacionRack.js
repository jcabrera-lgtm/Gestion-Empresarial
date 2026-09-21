import mongoose from "mongoose";

export const AREAS = ["A1", "A2", "A3", "A4"];

// Matriz de ubicación física del WMS: [Bodega] > [Área] > [Pasillo] > [Rack] > [Bin].
// El campo "codigo" es el identificador legible (el que lleva el QR físico del rack,
// por ejemplo "PRINCIPAL-A1-PAS-02-RACK-04-1") y se genera automáticamente a partir de los demás.
const ubicacionRackSchema = new mongoose.Schema(
  {
    bodega: {
      type: String,
      required: [true, "La bodega/sede es obligatoria"],
      trim: true,
      uppercase: true,
      default: "PRINCIPAL",
    },
    // N° de área dentro de la bodega (A1, A2, A3 o A4).
    area: {
      type: String,
      required: [true, "El N° de área es obligatorio"],
      trim: true,
      uppercase: true,
      enum: { values: AREAS, message: "N° de área inválido (usa A1, A2, A3 o A4)" },
    },
    pasillo: {
      type: String,
      required: [true, "El pasillo es obligatorio"],
      trim: true,
      uppercase: true,
    },
    rack: {
      type: String,
      required: [true, "El rack es obligatorio"],
      trim: true,
      uppercase: true,
    },
    bin: {
      type: String,
      required: [true, "El bin/posición es obligatorio"],
      trim: true,
      uppercase: true,
    },
    // Identificador legible y único del rack, generado automáticamente. Es el valor
    // que se codifica en el QR físico que el Replaneador escanea para confirmar carga.
    codigo: { type: String, unique: true, uppercase: true },
    capacidadMaxima: { type: Number, min: [0, "La capacidad no puede ser negativa"] },
    // Estado operativo de la posición dentro del flujo de reubicación guiada.
    estado: {
      type: String,
      enum: {
        values: ["libre", "ocupado", "bloqueado"],
        message: "Estado inválido (usa libre, ocupado o bloqueado)",
      },
      default: "libre",
    },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Evita duplicar la misma posición física dentro de una misma bodega.
ubicacionRackSchema.index({ bodega: 1, area: 1, pasillo: 1, rack: 1, bin: 1 }, { unique: true });

const armarCodigo = ({ bodega, area, pasillo, rack, bin }) =>
  [bodega, area, pasillo, rack, bin].map((v) => String(v).trim().toUpperCase()).join("-");

ubicacionRackSchema.pre("validate", function construirCodigo() {
  if (this.bodega && this.area && this.pasillo && this.rack && this.bin) {
    this.codigo = armarCodigo(this);
  }
});

// La edición (PUT) usa findByIdAndUpdate, que no dispara el hook anterior:
// se recalcula el código también ahí para que el QR siempre refleje la ubicación.
ubicacionRackSchema.pre("findOneAndUpdate", function recalcularCodigo() {
  const u = this.getUpdate() ?? {};
  const d = u.$set ?? u;
  if (d.bodega && d.area && d.pasillo && d.rack && d.bin) {
    d.codigo = armarCodigo(d);
  }
});

export default mongoose.model("UbicacionRack", ubicacionRackSchema);
