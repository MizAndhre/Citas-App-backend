import express from "express";

//se importan las funciones del archivo adminController
import {
	registrar,
	login,
	perfil,
	marcarLeidos,
	eliminarNotificaciones,
	obtenerPacientes,
	obtenerDoctores,
	cambiarEstadoDoctor,
	obtenerCitasTerminadas,
} from "../controllers/adminController.js";
import checkAuth from "../middleware/authMiddleware.js";

const router = express.Router();

//Rutas públicas
router.post("/", registrar);
router.post("/login", login);

//Ruta Privada
router.get("/perfil", checkAuth, perfil);

//Rutas notificaciones
router.post("/marcar-leidos", checkAuth, marcarLeidos);
router.post("/eliminar-notificaciones", checkAuth, eliminarNotificaciones);

//Rutas manejo de doctores y pacientes
router.get("/obtener-pacientes", checkAuth, obtenerPacientes);
router.get("/obtener-doctores", checkAuth, obtenerDoctores);
router.post("/cambiar-estado-doctores", checkAuth, cambiarEstadoDoctor);

//Ruta hisotorial de citas
router.get("/obtener-citas-terminadas/", checkAuth, obtenerCitasTerminadas);

export default router;
