var express = require("express");
var router = express.Router();
var equiposController = require("../controllers/equipos.controller");
var auth = require("../middlewares/auth");
var uploadEquipo = require("../middlewares/uploadEquipo");
var roles = require("../middlewares/roles");

// Obtener todos los equipos
router.get("/", equiposController.obtenerEquipos);

// Buscar equipos por código de barras (PAS)
router.get("/buscar", auth, equiposController.buscarPorCodigoBarras);

// Buscar equipos con unidades disponibles (PAS) ← AÑADIR AQUÍ
router.get("/disponibles", auth, roles.soloPAS, equiposController.buscarEquiposDisponibles);

// Buscar unidad por código de barras
router.get('/unidad/:codigo', auth, roles.soloPAS, equiposController.buscarUnidadPorCodigo);

// Gestión (solo PAS)
router.get("/:id", auth, roles.soloPAS, equiposController.obtenerEquipoPorId);

router.post(
  "/",
  auth,
  roles.soloPAS,
  uploadEquipo.single("foto"),
  equiposController.crearEquipo
);

// Subir imagen a equipo existente
router.post(
  "/:id/imagen",
  auth,
  roles.soloPAS,
  uploadEquipo.single("foto"),
  equiposController.subirImagenEquipo
);

router.put("/:id", auth, roles.soloPAS, equiposController.actualizarEquipo);
router.delete("/:id", auth, roles.soloPAS, equiposController.eliminarEquipo);

module.exports = router;