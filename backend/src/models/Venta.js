import mongoose from "mongoose";

export const ESTADOS = ["pendiente", "pagada", "anulada"];

const itemSchema = new mongoose.Schema(
  {
    producto: { type: mongoose.Schema.Types.ObjectId, ref: "Producto", required: true },
    codigo: String,
    nombre: String,
    cantidad: { type: Number, required: true, min: 1 },
    precioUnitario: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const ventaSchema = new mongoose.Schema(
  {
    numero: { type: String, unique: true, required: true },
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: "Cliente", required: true },
    items: {
      type: [itemSchema],
      validate: [(v) => v.length > 0, "La venta necesita al menos un producto"],
    },
    subtotal: { type: Number, required: true },
    iva: { type: Number, required: true },
    total: { type: Number, required: true },
    estado: { type: String, enum: ESTADOS, default: "pendiente" },
  },
  { timestamps: true }
);

export default mongoose.model("Venta", ventaSchema);
