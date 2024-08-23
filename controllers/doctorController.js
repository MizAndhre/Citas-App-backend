//crear controladores para las diferentes rutas

import generarJWT from "../helpers/generarJWT.js";
import Admin from "../models/Admin.js";
import Cita from "../models/Cita.js";
import Doctor from "../models/Doctor.js";

import bcrypt from "bcrypt";
import Usuario from "../models/Usuario.js";
import HistorialCita from "../models/HistorialCita.js";

const registrar = async (req, res) => {
	const { email, password } = req.body;

	//Revisar si el doctor ya está registrado/existe
	const existeUsuario = await Doctor.findOne({ email });
	if (existeUsuario) {
		const error = new Error("Doctor ya registrado");
		return res.status(400).json({ msg: error.message });
	}

	try {
		//Hashear la password antes de enviarla
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		req.body.password = hashedPassword;

		//Guardar la información del form en una variable
		const doctor = new Doctor(req.body);
		//Guardar el doctor en la BD
		const doctorGuardado = await doctor.save();

		//Enviar email [tentativo]
		//! Enviar Notificacion al ADMIN
		const adminUser = await Admin.findOne();
		const unseenNotif = adminUser.unseenNotif;
		unseenNotif.push({
			type: "nuevo-registro-doctor",
			msg: `${doctorGuardado.nombre} se ha registrado como doctor`,
			data: {
				doctorId: doctorGuardado._id,
				name: doctorGuardado.nombre,
			},
			onClickPath: "/admin/perfil/lista-doctores",
		});
		await Admin.findByIdAndUpdate(adminUser._id, { unseenNotif });

		//Enviar la información del doctor como JSON
		res.json(doctorGuardado);
	} catch (error) {
		console.log("Error al registrar", error);
	}
};

const login = async (req, res) => {
	const { email, password } = req.body;

	//Comprobar que el doctor exite
	const doctor = await Doctor.findOne({ email });
	if (!doctor) {
		const error = new Error("Doctor no registrado");
		return res.status(400).json({ msg: error.message });
	}

	//comparar las password para ver si coinciden
	const compararPassword = await bcrypt.compare(password, doctor.password);
	//Revisar el password
	if (compararPassword) {
		// Enviar la info del usuario como respuesta para guardarla en el frontend
		res.json({
			_id: doctor._id,
			nombre: doctor.nombre,
			email: doctor.email,
			especialidad: doctor.especialidad,
			role: doctor.role,
			horaInicio: doctor.horaInicio,
			horaFinal: doctor.horaFinal,
			estado: doctor.estado,
			seenNotif: doctor.seenNotif,
			unseenNotif: doctor.unseenNotif,
			token: generarJWT(doctor.id, doctor.role),
		});
	} else {
		const error = new Error("La contraseña es incorrecta");
		return res.status(403).json({ msg: error.message });
	}
};

const perfil = (req, res) => {
	const { doctor } = req;
	res.json(doctor);
};

const marcarLeidos = async (req, res) => {
	const { _id } = req.body;

	try {
		const doctor = await Doctor.findOne({ _id });
		const unseenNotif = doctor.unseenNotif;
		const seenNotif = doctor.seenNotif;

		seenNotif.push(...unseenNotif);
		doctor.unseenNotif = [];
		doctor.seenNotif = seenNotif;

		const actualizarDoctor = await doctor.save();

		res.json({ msg: "Notificaciones marcadas como leída correctamente" });

		// console.log(admin, "ADMIN");
	} catch (e) {
		const error = new Error("Error al marcar como leídos");
		return res.status(403).json({ msg: error.message });
	}
};

const eliminarNotificaciones = async (req, res) => {
	const { _id } = req.body;

	try {
		const doctor = await Doctor.findOne({ _id });
		// doctor.unseenNotif = [];
		doctor.seenNotif = [];

		const actualizarDoctor = await doctor.save();

		res.json({ msg: "Notificaciones eliminadas correctamente" });
	} catch (e) {
		const error = new Error("Error al eliminar");
		return res.status(403).json({ msg: error.message });
	}
};

const actualizarPerfil = async (req, res) => {
	const doctor = await Doctor.findById(req.params.id);
	if (!doctor) {
		const error = new Error("Hubo un error");
		return res.status(400).json({ msg: error.message });
	}

	const { email } = req.body;
	if (doctor.email !== req.body.email) {
		const existeEmail = await Doctor.findOne({ email });
		if (existeEmail) {
			const error = new Error("Email ya está en uso");
			return res.status(400).json({ msg: error.message });
		}
	}

	try {
		doctor.nombre = req.body.nombre;
		doctor.email = req.body.email;
		doctor.especialidad = req.body.especialidad;
		doctor.horaInicio = req.body.horaInicio;
		doctor.horaFinal = req.body.horaFinal;

		const doctorActualizado = await doctor.save();
		res.json(doctorActualizado);
	} catch (error) {
		console.log(error);
	}
};

const obtenerCitasSolicitud = async (req, res) => {
	const { _id } = req.doctor;

	try {
		// Buscar las citas con el ID del doctor y el estado de "pendiente"
		const citas = await Cita.find({ doctorId: _id, estado: "pendiente" }).sort({ fecha: 1 });
		// Enviar como respuesta del objeto de citas
		res.json(citas);
	} catch (error) {
		console.log("Error al obtener citas", error);
	}
};

const cambiarEstadoCita = async (req, res) => {
	try {
		// Recibe el ID de la cita y el estado a cambiar
		const { _id, estado } = req.body;
		// Busca la cita y actualiza el estado
		const cita = await Cita.findByIdAndUpdate(_id, {
			estado,
		});

		// Enviar NOTIF al Paciente sobre la cuenta
		const paciente = await Usuario.findOne({ _id: cita.usuarioId });
		const unseenNotif = paciente.unseenNotif;
		unseenNotif.push({
			type: "estado-cita-cambiado",
			msg: `Su cita con ${cita.doctorInfo.nombre} ha sido ${estado}`,
			onClickPath: "/paciente/perfil/ver-citas",
		});
		await paciente.save();
		// Envia mensaje de exito
		res.json({ msg: "Cita actualizada correctamente" });
	} catch (error) {
		const e = new Error("Error al cambiar el estado de la cita");
		return res.status(400).json({ msg: e.message });
	}
};

const obtenerCitasAprobadas = async (req, res) => {
	const { _id } = req.doctor;

	try {
		const citas = await Cita.find({ doctorId: _id, estado: "aceptada" }).sort({ fecha: 1 });

		const fechaHoy = new Date();

		const fechaHoyFormat = fechaHoy.toISOString().split("T")[0];
		const citasHoy = await Cita.find({
			fecha: new Date(fechaHoyFormat),
			estado: "aceptada",
		}).sort({ fecha: 1 });

		// Obtener el primer día de la semana
		const primerDiaSemana = new Date(fechaHoy);
		primerDiaSemana.setDate(fechaHoy.getDate() - fechaHoy.getDay());
		// Obtener el último día de la semana
		const ultimoDiaSemana = new Date(fechaHoy);
		ultimoDiaSemana.setDate(primerDiaSemana.getDate() + 6);
		// Filtrar las citas por la semana actual
		const citasSemana = await Cita.find({
			fecha: {
				$gte: primerDiaSemana,
				$lte: ultimoDiaSemana,
			},
			estado: "aceptada",
		}).sort({ fecha: 1 });

		// Obtener el primer día del mes
		const primerDiaMes = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth(), 1);
		// Obtener el último día del mes
		const ultimoDiaMes = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth() + 1, 0);
		// Filtrar las citas por el mes actual
		const citasMes = await Cita.find({
			fecha: {
				$gte: primerDiaMes,
				$lte: ultimoDiaMes,
			},
			estado: "aceptada",
		}).sort({ fecha: 1 });

		res.json({ citas, citasHoy, citasSemana, citasMes });
	} catch (error) {
		console.log("Error al obtener citas", error);
	}
};

const cambiarEstadoCitaAprobadas = async (req, res) => {
	try {
		// Obtiene el ID dela cita y el Estado a cambiar
		const { _id, estado } = req.body;
		//  Busca la cita y actualiza el estado
		const cita = await Cita.findByIdAndUpdate(_id, {
			estado,
		});

		// Como ya fue aprobada, crea una instancia en la BD HistorialCita
		const historial = new HistorialCita({
			citaId: _id,
			usuarioId: cita.usuarioId,
			doctorId: cita.doctorId,
			usuarioInfo: cita.usuarioInfo,
			doctorInfo: cita.doctorInfo,
			fecha: cita.fecha,
			hora: cita.hora,
			motivo: cita.motivo,
			estado,
		});
		await historial.save();

		// Enviar NOTIF al Paciente sobre el cambio de esta de la cita
		const paciente = await Usuario.findOne({ _id: cita.usuarioId });
		const unseenNotif = paciente.unseenNotif;
		unseenNotif.push({
			type: "estado-cita-aprobada-cambiado",
			msg: `Su cita con ${cita.doctorInfo.nombre} ha sido ${estado}`,
			onClickPath: "/paciente/perfil/historial-citas",
		});
		await paciente.save();
		// Enviar al frontend un mensaje de exito
		res.json({ msg: "Cita actualizada correctamente" });
	} catch (error) {
		const e = new Error("Error al cambiar el estado de la cita");
		return res.status(400).json({ msg: e.message });
	}
};

const obtenerCitasTerminadas = async (req, res) => {
	const { _id } = req.doctor;

	try {
		const citas = await HistorialCita.find({ doctorId: _id }).sort({ fecha: 1 });

		res.json(citas);
	} catch (error) {
		console.log("Error al obtener citas", error);
	}
};

export {
	registrar,
	perfil,
	login,
	marcarLeidos,
	eliminarNotificaciones,
	actualizarPerfil,
	obtenerCitasSolicitud,
	cambiarEstadoCita,
	obtenerCitasAprobadas,
	cambiarEstadoCitaAprobadas,
	obtenerCitasTerminadas,
};
