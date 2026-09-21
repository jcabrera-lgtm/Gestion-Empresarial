import UbicacionRack from "../models/UbicacionRack.js";
import Producto from "../models/Producto.js";
import { crudRouter } from "./crud.js";

export default crudRouter(UbicacionRack, {
  searchFields: ["codigo", "bodega", "area", "pasillo", "rack"],
  canDelete: async (id) =>
    (await Producto.exists({ ubicacionRackDefecto: id }))
      ? "No se puede eliminar: hay productos con esta posición como rack por defecto."
      : null,
});
