import { Router } from "express";
import mongoose from "mongoose";
import Venta, { ESTADOS } from "../models/Venta.js";
import Cliente from "../models/Cliente.js";
import Producto from "../models/Producto.js";
import { nextSequence } from "../models/Counter.js";
import { HttpError } from "../middleware/errorHandler.js";

export const IVA_RATE = Number(process.env.IVA_RATE ?? 0.15);
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

const TRANSICIONES = {
  pendiente: ["pagada", "anulada"],
  pagada: ["anulada"],
  anulada: [],
};

const POPULATE_CLIENTE = "nombre identificacion";
const router = Router();

router.get("/", async (req, res) => {
  const filtro = {};
  if (ESTADOS.includes(req.query.estado)) filtro.estado = req.query.estado;
  res.json(
    await Venta.find(filtro).sort({ createdAt: -1 }).populate("cliente", POPULATE_CLIENTE)
  );
});

router.get("/:id", async (req, res) => {
  const venta = await Venta.findById(req.params.id).populate("cliente", POPULATE_CLIENTE);
  if (!venta) throw new HttpError(404, "Venta no encontrada");
  res.json(venta);
});

// El cliente solo envía { cliente, items: [{ producto, cantidad }] }.
// Precios, totales e IVA los calcula el servidor.
router.post("/", async (req, res) => {
  const { cliente, items } = req.body ?? {};

  if (!mongoose.isValidObjectId(cliente)) throw new HttpError(400, "Selecciona un cliente");
  if (!Array.isArray(items) || items.length === 0)
    throw new HttpError(400, "Agrega al menos un producto");
  if (!(await Cliente.exists({ _id: cliente }))) throw new HttpError(404, "El cliente no existe");

  // Unifica líneas repetidas del mismo producto.
  const cantidades = new Map();
  for (const it of items) {
    const cantidad = Number(it.cantidad);
    if (!mongoose.isValidObjectId(it.producto) || !Number.isInteger(cantidad) || cantidad < 1)
      throw new HttpError(400, "Cada línea necesita un producto y una cantidad entera mayor a 0");
    const id = String(it.producto);
    cantidades.set(id, (cantidades.get(id) ?? 0) + cantidad);
  }

  const productos = await Producto.find({ _id: { $in: [...cantidades.keys()] } });
  if (productos.length !== cantidades.size) throw new HttpError(404, "Uno de los productos no existe");

  const lineas = productos.map((p) => {
    if (!p.activo) throw new HttpError(409, `El producto "${p.nombre}" está inactivo`);
    const cantidad = cantidades.get(String(p._id));
    return {
      producto: p._id,
      codigo: p.codigo,
      nombre: p.nombre,
      cantidad,
      precioUnitario: p.precio,
      subtotal: round2(p.precio * cantidad),
    };
  });

  // Descuenta stock de forma atómica; si algo falla, devuelve lo ya descontado.
  const descontadas = [];
  let venta;
  try {
    for (const l of lineas) {
      const r = await Producto.updateOne(
        { _id: l.producto, stock: { $gte: l.cantidad } },
        { $inc: { stock: -l.cantidad } }
      );
      if (r.modifiedCount !== 1) throw new HttpError(409, `Stock insuficiente para "${l.nombre}"`);
      descontadas.push(l);
    }

    const subtotal = round2(lineas.reduce((suma, l) => suma + l.subtotal, 0));
    const iva = round2(subtotal * IVA_RATE);
    const numero = `V-${String(await nextSequence("venta")).padStart(6, "0")}`;

    venta = await Venta.create({
      numero,
      cliente,
      items: lineas,
      subtotal,
      iva,
      total: round2(subtotal + iva),
    });
  } catch (err) {
    await Promise.all(
      descontadas.map((l) =>
        Producto.updateOne({ _id: l.producto }, { $inc: { stock: l.cantidad } })
      )
    );
    throw err;
  }

  await venta.populate("cliente", POPULATE_CLIENTE);
  res.status(201).json(venta);
});

router.patch("/:id/estado", async (req, res) => {
  const { estado } = req.body ?? {};
  if (!ESTADOS.includes(estado)) throw new HttpError(400, "Estado inválido");

  const venta = await Venta.findById(req.params.id);
  if (!venta) throw new HttpError(404, "Venta no encontrada");
  if (!TRANSICIONES[venta.estado].includes(estado))
    throw new HttpError(409, `No se puede pasar una venta de ${venta.estado} a ${estado}`);

  // Al anular, el inventario vuelve a su lugar.
  if (estado === "anulada") {
    await Promise.all(
      venta.items.map((i) =>
        Producto.updateOne({ _id: i.producto }, { $inc: { stock: i.cantidad } })
      )
    );
  }

  venta.estado = estado;
  await venta.save();
  await venta.populate("cliente", POPULATE_CLIENTE);
  res.json(venta);
});

export default router;
