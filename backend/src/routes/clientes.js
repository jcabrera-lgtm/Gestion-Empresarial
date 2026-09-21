import Cliente from "../models/Cliente.js";
import Venta from "../models/Venta.js";
import { crudRouter } from "./crud.js";

export default crudRouter(Cliente, {
  searchFields: ["nombre", "identificacion", "email"],
  canDelete: async (id) =>
    (await Venta.exists({ cliente: id }))
      ? "No se puede eliminar: el cliente tiene ventas registradas. Márcalo como inactivo."
      : null,
});
