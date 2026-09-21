import mongoose from "mongoose";

const clienteSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: [true, "El nombre es obligatorio"], trim: true },
    identificacion: { type: String, trim: true }, // cédula o RUC
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "El correo no es válido"],
    },
    telefono: { type: String, trim: true },
    direccion: { type: String, trim: true },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Cliente", clienteSchema);
