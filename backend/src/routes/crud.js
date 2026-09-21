import { Router } from "express";
import { HttpError } from "../middleware/errorHandler.js";

const escapar = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Genera un CRUD completo para un modelo.
 * - searchFields: campos sobre los que actúa ?q=texto
 * - canDelete(id): devuelve un mensaje si NO se puede eliminar, o null si se puede
 * - populate: campo(s) a poblar (mismo formato que .populate() de Mongoose)
 */
export function crudRouter(Model, { searchFields = [], canDelete, populate } = {}) {
  const router = Router();

  router.get("/", async (req, res) => {
    const filtro = {};
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (q && searchFields.length) {
      const rx = new RegExp(escapar(q), "i");
      filtro.$or = searchFields.map((campo) => ({ [campo]: rx }));
    }
    let query = Model.find(filtro).sort({ createdAt: -1 });
    if (populate) query = query.populate(populate);
    res.json(await query);
  });

  router.get("/:id", async (req, res) => {
    let query = Model.findById(req.params.id);
    if (populate) query = query.populate(populate);
    const doc = await query;
    if (!doc) throw new HttpError(404, "Registro no encontrado");
    res.json(doc);
  });

  router.post("/", async (req, res) => {
    const doc = await Model.create(req.body);
    if (populate) await doc.populate(populate);
    res.status(201).json(doc);
  });

  router.put("/:id", async (req, res) => {
    let query = Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (populate) query = query.populate(populate);
    const doc = await query;
    if (!doc) throw new HttpError(404, "Registro no encontrado");
    res.json(doc);
  });

  router.delete("/:id", async (req, res) => {
    if (canDelete) {
      const motivo = await canDelete(req.params.id);
      if (motivo) throw new HttpError(409, motivo);
    }
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) throw new HttpError(404, "Registro no encontrado");
    res.status(204).end();
  });

  return router;
}
