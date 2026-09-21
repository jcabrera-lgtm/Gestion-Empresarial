import Empleado from "../models/Empleado.js";
import { crudRouter } from "./crud.js";

export default crudRouter(Empleado, {
  searchFields: ["nombre", "cargo", "departamento", "email"],
});
