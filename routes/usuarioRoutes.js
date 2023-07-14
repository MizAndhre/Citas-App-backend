import express from "express";

//se importan las funciones del archivo usuarioController
import {
	registrar,
	perfil,
	login,
	marcarLeidos,
	obtenerDoctoresAprobados,
	eliminarNotificaciones,
	actualizarPerfil,
	obtenerDoctorId,
	programarCita,
	comprobarCita,
	obtenerCitas,
	eliminarCita,
	cancelarCitaAprobada,
	obtenerCitasTerminadas,
} from "../controllers/usuarioController.js";
import checkAuth from "../middleware/authMiddleware.js";

const router = express.Router();

//Rutas públicas
router.post("/", registrar);
router.post("/login", login);

//Ruta Privadas del Perfil Paciente
router.get("/perfil", checkAuth, perfil);
router.put("/perfil/:id", checkAuth, actualizarPerfil);

//Ruta de las notificaciones
router.post("/marcar-leidos", checkAuth, marcarLeidos);
router.post("/eliminar-notificaciones", checkAuth, eliminarNotificaciones);

//Rutas de los doctores aprobados
router.get("/obtener-doctores-aprobados", checkAuth, obtenerDoctoresAprobados);
router.get("/obtener-doctor-id/:id", checkAuth, obtenerDoctorId);

//Rutas de las citas
router.post("/programar-cita", checkAuth, programarCita);
router.post("/comprobar-cita", checkAuth, comprobarCita);
router.get("/obtener-citas/", checkAuth, obtenerCitas);
router.post("/eliminar-cita/", checkAuth, eliminarCita);
router.post("/cancelar-cita-aprobada/", checkAuth, cancelarCitaAprobada);
router.get("/obtener-citas-terminadas/", checkAuth, obtenerCitasTerminadas);

export default router;
