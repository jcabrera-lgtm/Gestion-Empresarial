import { Router } from "express";
import Cliente from "../models/Cliente.js";
import Producto from "../models/Producto.js";
import Empleado from "../models/Empleado.js";
import Venta from "../models/Venta.js";

const router = Router();
const TZ = "America/Guayaquil";

router.get("/", async (req, res) => {
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const desde = new Date(inicioMes);
  desde.setMonth(desde.getMonth() - 5);

  const [clientes, productos, empleados, mesActual, pendientes, stockBajo, ultimas, porMes] =
    await Promise.all([
      Cliente.countDocuments({ activo: true }),
      Producto.countDocuments({ activo: true }),
      Empleado.countDocuments({ activo: true }),
      Venta.aggregate([
        { $match: { estado: { $ne: "anulada" }, createdAt: { $gte: inicioMes } } },
        { $group: { _id: null, total: { $sum: "$total" }, cantidad: { $sum: 1 } } },
      ]),
      Venta.aggregate([
        { $match: { estado: "pendiente" } },
        { $group: { _id: null, total: { $sum: "$total" }, cantidad: { $sum: 1 } } },
      ]),
      Producto.find({ activo: true, $expr: { $lte: ["$stock", "$stockMinimo"] } })
        .sort({ stock: 1 })
        .limit(8),
      Venta.find().sort({ createdAt: -1 }).limit(6).populate("cliente", "nombre"),
      Venta.aggregate([
        { $match: { estado: { $ne: "anulada" }, createdAt: { $gte: desde } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt", timezone: TZ } },
            total: { $sum: "$total" },
            cantidad: { $sum: 1 },
          },
        },
      ]),
    ]);

  // Completa con 0 los meses sin ventas para que el gráfico siempre muestre 6.
  const meses = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(desde);
    d.setMonth(desde.getMonth() + i);
    const clave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const dato = porMes.find((m) => m._id === clave);
    meses.push({ mes: clave, total: dato?.total ?? 0, cantidad: dato?.cantidad ?? 0 });
  }

  res.json({
    conteos: { clientes, productos, empleados },
    ventasMes: { total: mesActual[0]?.total ?? 0, cantidad: mesActual[0]?.cantidad ?? 0 },
    pendientes: { total: pendientes[0]?.total ?? 0, cantidad: pendientes[0]?.cantidad ?? 0 },
    stockBajo,
    ultimasVentas: ultimas,
    ventasPorMes: meses,
  });
});

export default router;
