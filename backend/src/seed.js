// Carga datos de ejemplo solo si las colecciones están vacías.
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import Cliente from "./models/Cliente.js";
import Producto from "./models/Producto.js";
import Empleado from "./models/Empleado.js";
import UbicacionRack from "./models/UbicacionRack.js";

await connectDB(process.env.MONGO_URI ?? "mongodb://localhost:27017/gestion");

if ((await Cliente.countDocuments()) === 0) {
  await Cliente.insertMany([
    { nombre: "Comercial Andina S.A.", identificacion: "0991234567001", email: "compras@andina.example", telefono: "042555001", direccion: "Av. 9 de Octubre 100, Guayaquil" },
    { nombre: "María Fernanda Ruiz", identificacion: "0912345678", email: "mruiz@example.com", telefono: "0987654321" },
    { nombre: "Distribuidora del Pacífico", identificacion: "0997654321001", email: "ventas@pacifico.example", telefono: "042555002" },
  ]);
}

let rackTeclado = null;
if ((await UbicacionRack.countDocuments()) === 0) {
  const racks = await UbicacionRack.insertMany([
    { bodega: "Principal", pasillo: "PAS-02", rack: "RACK-04", area: "A1", bin: "1", capacidadMaxima: 200, estado: "ocupado" },
    { bodega: "Principal", pasillo: "PAS-02", rack: "RACK-04", area: "A1", bin: "2", capacidadMaxima: 200 },
    { bodega: "Principal", pasillo: "PAS-03", rack: "RACK-08", area: "A2", bin: "1", capacidadMaxima: 150 },
  ]);
  rackTeclado = racks[0];
}

if ((await Producto.countDocuments()) === 0) {
  await Producto.insertMany([
    {
      codigo: "TEC-001",
      nombre: "Teclado inalámbrico",
      categoria: "Periféricos",
      precio: 24.9,
      stock: 40,
      stockMinimo: 10,
      codigoBarrasUnidad: "750123456789",
      codigoBarrasCaja: "7501234567895",
      codigoBarrasMaster: "17501234567892",
      unidadesPorCaja: 12,
      unidadesPorMaster: 48,
      ubicacionRackDefecto: rackTeclado?._id,
    },
    { codigo: "MON-024", nombre: "Monitor 24 pulgadas", categoria: "Pantallas", precio: 139, stock: 12, stockMinimo: 5 },
    { codigo: "PAP-A4", nombre: "Resma de papel A4", categoria: "Oficina", precio: 4.5, stock: 6, stockMinimo: 20 },
    { codigo: "IMP-LSR", nombre: "Impresora láser", categoria: "Impresión", precio: 210, stock: 3, stockMinimo: 3 },
  ]);
}

if ((await Empleado.countDocuments()) === 0) {
  await Empleado.insertMany([
    { nombre: "Carlos Mendoza", cargo: "Gerente de ventas", departamento: "Comercial", email: "cmendoza@empresa.example", salario: 1500, fechaIngreso: "2022-03-01" },
    { nombre: "Ana Villamar", cargo: "Contadora", departamento: "Finanzas", email: "avillamar@empresa.example", salario: 1200, fechaIngreso: "2023-06-15" },
  ]);
}

console.log("Datos de ejemplo listos");
await mongoose.disconnect();
