import express from "express";

import {
	registrar,
	login,
	perfil,
	marcarLeidos,
	eliminarNotificaciones,
	actualizarPerfil,
	obtenerCitasSolicitud,
	cambiarEstadoCita,
	obtenerCitasAprobadas,
	cambiarEstadoCitaAprobadas,
	obtenerCitasTerminadas,
} from "../controllers/doctorController.js";
import checkAuth from "../middleware/authMiddleware.js";

const router = express.Router();

//Rutas públicas
router.post("/", registrar);
router.post("/login", login);

//Ruta Privada
router.get("/perfil", checkAuth, perfil);

router.post("/marcar-leidos", checkAuth, marcarLeidos);
router.post("/eliminar-notificaciones", checkAuth, eliminarNotificaciones);

router.put("/perfil/:id", checkAuth, actualizarPerfil);

router.get("/obtener-citas-solicitadas/", checkAuth, obtenerCitasSolicitud);
router.post("/cambiar-estado-citas", checkAuth, cambiarEstadoCita);
router.get("/obtener-citas-aprobadas/", checkAuth, obtenerCitasAprobadas);
router.post("/cambiar-estado-citas-aprobadas", checkAuth, cambiarEstadoCitaAprobadas);

router.get("/obtener-citas-aprobadas-semana/", checkAuth, obtenerCitasAprobadas);

router.get("/obtener-citas-terminadas/", checkAuth, obtenerCitasTerminadas);

export default router;
