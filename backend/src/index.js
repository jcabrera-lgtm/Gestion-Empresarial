import express from "express";
import { connectDB } from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import clientes from "./routes/clientes.js";
import productos from "./routes/productos.js";
import empleados from "./routes/empleados.js";
import ventas, { IVA_RATE } from "./routes/ventas.js";
import dashboard from "./routes/dashboard.js";
import ubicacionesRack from "./routes/ubicacionesRack.js";
import UbicacionRack from "./models/UbicacionRack.js";

const PORT = process.env.PORT ?? 3000;
const MONGO_URI = process.env.MONGO_URI ?? "mongodb://localhost:27017/gestion";

const app = express();
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.get("/api/config", (req, res) => res.json({ iva: IVA_RATE }));

app.use("/api/dashboard", dashboard);
app.use("/api/clientes", clientes);
app.use("/api/productos", productos);
app.use("/api/empleados", empleados);
app.use("/api/ventas", ventas);
app.use("/api/ubicaciones-rack", ubicacionesRack);

app.use("/api", (req, res) => res.status(404).json({ error: "Ruta no encontrada" }));
app.use(errorHandler);

await connectDB(MONGO_URI);
// Reemplaza el índice único antiguo (que incluía "altura") por el nuevo (con "area").
await UbicacionRack.syncIndexes();
app.listen(PORT, () => console.log(`API escuchando en el puerto ${PORT}`));
