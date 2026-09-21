import mongoose from "mongoose";

const productoSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: [true, "El código es obligatorio"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    nombre: { type: String, required: [true, "El nombre es obligatorio"], trim: true },
    categoria: { type: String, trim: true },
    precio: {
      type: Number,
      required: [true, "El precio es obligatorio"],
      min: [0, "El precio no puede ser negativo"],
    },
    stock: { type: Number, default: 0, min: [0, "El stock no puede ser negativo"] },
    stockMinimo: { type: Number, default: 0, min: [0, "El stock mínimo no puede ser negativo"] },
    activo: { type: Boolean, default: true },

    // --- Identificación multinivel de códigos de barras (evolución V2.0 WMS) ---
    // Unidad individual: código de producto para POS, app comercial y picking (EAN-12).
    codigoBarrasUnidad: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // permite muchos productos sin este código sin chocar por duplicado
      set: (v) => (v === "" ? undefined : v),
      match: [/^\d{12}$/, "El código de unidad (EAN-12) debe tener 12 dígitos"],
    },
    // Caja interna / sub-empaque de distribución, con trazabilidad de lote (EAN-13).
    codigoBarrasCaja: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      set: (v) => (v === "" ? undefined : v),
      match: [/^\d{13}$/, "El código de caja (EAN-13) debe tener 13 dígitos"],
    },
    // Cartón máster del fabricante, escaneado por surtidores y receptores en volumen (EAN-14).
    codigoBarrasMaster: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      set: (v) => (v === "" ? undefined : v),
      match: [/^\d{14}$/, "El código de cartón máster (EAN-14) debe tener 14 dígitos"],
    },
    // Factores de conversión entre niveles de empaque.
    unidadesPorCaja: { type: Number, default: 1, min: [1, "Debe ser al menos 1 unidad"] },
    unidadesPorMaster: { type: Number, default: 1, min: [1, "Debe ser al menos 1 unidad"] },

    // Ubicación por defecto sugerida al replaneador en el WMS (Fase 2: App Pocket).
    ubicacionRackDefecto: { type: mongoose.Schema.Types.ObjectId, ref: "UbicacionRack" },
  },
  { timestamps: true }
);

export default mongoose.model("Producto", productoSchema);
