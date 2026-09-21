import mongoose from "mongoose";

const Counter = mongoose.model(
  "Counter",
  new mongoose.Schema({ _id: String, seq: { type: Number, default: 0 } })
);

// Devuelve el siguiente número de una secuencia (p. ej. "venta").
export async function nextSequence(nombre) {
  const c = await Counter.findByIdAndUpdate(
    nombre,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return c.seq;
}
