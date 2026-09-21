import mongoose from "mongoose";

const empleadoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: [true, "El nombre es obligatorio"], trim: true },
    cargo: { type: String, trim: true },
    departamento: { type: String, trim: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "El correo no es válido"],
    },
    telefono: { type: String, trim: true },
    salario: { type: Number, min: [0, "El salario no puede ser negativo"] },
    fechaIngreso: { type: Date },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Empleado", empleadoSchema);
