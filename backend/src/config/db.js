import mongoose from "mongoose";

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

// Mongo puede tardar unos segundos en arrancar dentro de Docker: reintentamos.
export async function connectDB(uri, intentos = 10) {
  for (let i = 1; i <= intentos; i++) {
    try {
      await mongoose.connect(uri);
      console.log("MongoDB conectado");
      return;
    } catch (err) {
      console.error(`MongoDB: intento ${i}/${intentos} falló (${err.message})`);
      await esperar(3000);
    }
  }
  throw new Error("No se pudo conectar a MongoDB");
}
