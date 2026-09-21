import { Router } from "express";
import Producto from "../models/Producto.js";
import Venta from "../models/Venta.js";
import { crudRouter } from "./crud.js";
import { HttpError } from "../middleware/errorHandler.js";

const router = Router();

// Búsqueda escrita universal / escaneo: recibe lo que sea (SKU, EAN, CODE128 o
// GTIN-14, tecleado o desde lector) y resuelve el producto y el empaque exacto
// que corresponde a ese código. Debe ir antes del CRUD genérico (que usa "/:id").
router.get("/escaneo/:codigo", async (req, res) => {
  const codigo = req.params.codigo.trim();
  if (!codigo) throw new HttpError(400, "Código vacío");

  const producto = await Producto.findOne({
    $or: [
      { codigo: codigo.toUpperCase() },
      { codigoBarrasUnidad: codigo },
      { codigoBarrasCaja: codigo },
      { codigoBarrasMaster: codigo },
    ],
  }).populate({ path: "ubicacionRackDefecto", select: "codigo bodega estado" });
  if (!producto) throw new HttpError(404, "Código no reconocido en el sistema");

  let empaque = "sku";
  let factor = 1;
  if (producto.codigoBarrasMaster === codigo) {
    empaque = "master";
    factor = producto.unidadesPorMaster;
  } else if (producto.codigoBarrasCaja === codigo) {
    empaque = "caja";
    factor = producto.unidadesPorCaja;
  } else if (producto.codigoBarrasUnidad === codigo) {
    empaque = "unidad";
    factor = 1;
  }

  res.json({ producto, empaque, factorUnidades: factor });
});

router.use(
  "/",
  crudRouter(Producto, {
    searchFields: ["codigo", "nombre", "categoria", "codigoBarrasUnidad", "codigoBarrasCaja", "codigoBarrasMaster"],
    populate: { path: "ubicacionRackDefecto", select: "codigo bodega estado" },
    canDelete: async (id) =>
      (await Venta.exists({ "items.producto": id }))
        ? "No se puede eliminar: el producto aparece en ventas. Márcalo como inactivo."
        : null,
  })
);

export default router;
