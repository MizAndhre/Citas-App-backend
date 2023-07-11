//crear controladores para las diferentes rutas

import generarJWT from "../helpers/generarJWT.js";
import Cita from "../models/Cita.js";
import Doctor from "../models/Doctor.js";
import HistorialCita from "../models/HistorialCita.js";
import Usuario from "../models/Usuario.js";

import bcrypt from "bcrypt";

const registrar = async (req, res) => {
	// res.send("Desde API Veterinarios CONTROLLER"); para enviar algo a la web

	// res.json({ msg: "Registrando usuario..." });
	const { email, password } = req.body;

	//Revisar si el usuario ya está registrado/existe
	const existeUsuario = await Usuario.findOne({ email });
	if (existeUsuario) {
		const error = new Error("Usuario ya registrado");
		return res.status(400).json({ msg: error.message });
	}

	try {
		//Hashear la password antes de enviarla
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		req.body.password = hashedPassword;

		//Guardar la información del form en una variable
		const usuario = new Usuario(req.body);
		//Guardar el usuario en la BD
		const usuarioGuardado = await usuario.save();

		//Enviar email [tentativo]

		//Enviar la información del usuario como JSON
		res.json(usuarioGuardado);
		// console.log(usuarioGuardado);
	} catch (error) {
		console.log("Error al registrar", error);
	}
};

const login = async (req, res) => {
	const { email, password } = req.body;

	//Comprobar que el usuario exite
	const usuario = await Usuario.findOne({ email });
	if (!usuario) {
		const error = new Error("Paciente no registrado");
		return res.status(400).json({ msg: error.message });
	}

	//comparar las password para ver si coinciden
	const compararPassword = await bcrypt.compare(password, usuario.password);
	//Revisar el password
	if (compararPassword) {
		// console.log("enviar password", usuario);
		res.json({
			_id: usuario._id,
			nombre: usuario.nombre,
			email: usuario.email,
			role: usuario.role,
			seenNotif: usuario.seenNotif,
			unseenNotif: usuario.unseenNotif,
			token: generarJWT(usuario.id, usuario.role),
		});
	} else {
		const error = new Error("La contraseña es incorrecta");
		return res.status(403).json({ msg: error.message });
	}
};

const perfil = (req, res) => {
	const { usuario } = req;

	res.json(usuario);
};

const marcarLeidos = async (req, res) => {
	const { _id } = req.body;

	try {
		const paciente = await Usuario.findOne({ _id });

		const unseenNotif = paciente.unseenNotif;

		const seenNotif = paciente.seenNotif;

		seenNotif.push(...unseenNotif);
		paciente.unseenNotif = [];
		paciente.seenNotif = seenNotif;

		const actualizarPaciente = await paciente.save();

		res.json({ msg: "Notificaciones marcadas como leída correctamente" });
	} catch (e) {
		const error = new Error("Error al marcar como leídos");
		return res.status(403).json({ msg: error.message });
	}
};

const eliminarNotificaciones = async (req, res) => {
	const { _id } = req.body;

	try {
		const paciente = await Usuario.findOne({ _id });
		paciente.seenNotif = [];

		const actualizarPaciente = await paciente.save();

		res.json({ msg: "Notificaciones eliminadas correctamente" });
	} catch (e) {
		const error = new Error("Error al eliminar");
		return res.status(403).json({ msg: error.message });
	}
};

const actualizarPerfil = async (req, res) => {
	const paciente = await Usuario.findById(req.params.id);
	if (!paciente) {
		const error = new Error("Hubo un error");
		return res.status(400).json({ msg: error.message });
	}

	const { email } = req.body;
	if (paciente.email !== req.body.email) {
		const existeEmail = await Usuario.findOne({ email });
		if (existeEmail) {
			const error = new Error("Email ya está en uso");
			return res.status(400).json({ msg: error.message });
		}
	}

	try {
		paciente.nombre = req.body.nombre;
		paciente.email = req.body.email;
		paciente.genero = req.body.genero;
		paciente.telefono = req.body.telefono;

		const pacienteActualizado = await paciente.save();
		res.json(pacienteActualizado);
	} catch (error) {
		console.log(error);
	}
};

const obtenerDoctoresAprobados = async (req, res) => {
	try {
		const doctores = await Doctor.find({ estado: "aprobada" }).select(
			"-password -__v -token -unseenNotif -seenNotif"
		);
		// console.log(doctores);
		res.json(doctores);
	} catch (error) {
		console.log("Error al obtener doctores", error);
	}
};

const obtenerDoctorId = async (req, res) => {
	const { id } = req.params;

	try {
		const doctor = await Doctor.find({ _id: id }).select(
			"-password -__v -token -unseenNotif -seenNotif"
		);
		// console.log(doctor);
		res.json(doctor);
	} catch (error) {
		console.log("Error al obtener doctores", error);
	}
};

const comprobarCita = async (req, res) => {
	const { fecha, hora, doctorId } = req.body;

	try {
		const setHora = new Date(hora);
		console.log("sethora ", setHora);

		// Crear un nuevo objeto Date
		const desdeHora = new Date(setHora.getTime());
		// Sumar una hora a la fecha
		desdeHora.setMinutes(desdeHora.getMinutes() - 29);
		console.log("desde Hora", desdeHora);

		// Crear un nuevo objeto Date
		const hastaHora = new Date(setHora.getTime());
		// Restar una hora a la fecha
		hastaHora.setMinutes(hastaHora.getMinutes() + 29);
		console.log(hastaHora);

		const citas = await Cita.find({
			doctorId,
			fecha,
			hora: { $gte: desdeHora, $lte: hastaHora },
		});

		if (citas.length > 0) {
			const error = new Error("Cita no disponible");
			return res.status(400).json({ msg: error.message });
		}

		return res.status(200).json({ msg: "Cita disponible" });
	} catch (error) {
		console.log("Error al comprobar disponibildiad de cita", error);
	}
};

const programarCita = async (req, res) => {
	const { doctorId, usuarioInfo } = req.body;
	console.log(req.body);
	try {
		const nuevaCita = new Cita(req.body);
		await nuevaCita.save();

		//Enviar notificación al doctor
		const doctor = await Doctor.findOne({ _id: doctorId });
		// console.log(doctor);
		doctor.unseenNotif.push({
			type: "nueva-solicitud-cita",
			msg: `Una nueva cita ha sido solicitada por ${usuarioInfo.nombre}`,
			onClickPath: "/doctor/perfil/solicitud-citas",
		});
		await doctor.save();

		res.json(nuevaCita);
		// console.log("actualizado", doctor);
	} catch (error) {
		console.log("Error al programar cita", error);
	}
};

const obtenerCitas = async (req, res) => {
	const { _id } = req.usuario;
	const estados = ["pendiente", "aceptada", "rechazada"];

	try {
		const citas = await Cita.find({ usuarioId: _id, estado: { $in: estados } }).sort({
			fecha: 1,
		});
		res.json(citas);
	} catch (error) {
		console.log("Error al obtener citas", error);
	}
};

const eliminarCita = async (req, res) => {
	try {
		const { _id } = req.body;
		const cita = await Cita.findOneAndDelete({ _id });

		res.json({ msg: "Cita eliminada correctamente" });
	} catch (error) {
		const e = new Error("Error al cambiar el estado de la cita");
		return res.status(400).json({ msg: e.message });
	}
};

const cancelarCitaAprobada = async (req, res) => {
	try {
		const { _id, estado } = req.body;
		const cita = await Cita.findByIdAndUpdate(_id, {
			estado,
		});

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

		// Enviar NOTIF al Paciente sobre la cuenta
		const doctor = await Doctor.findOne({ _id: cita.doctorId });
		const unseenNotif = doctor.unseenNotif;
		unseenNotif.push({
			type: "cita-aprobada-cancelada",
			msg: `Su cita con ${cita.usuarioInfo.nombre} ha sido ${estado}`,
			onClickPath: "/doctor/perfil/historial-citas",
		});
		await doctor.save();

		res.json({ msg: "Cita actualizada correctamente" });
	} catch (error) {
		const e = new Error("Error al cambiar el estado de la cita");
		return res.status(400).json({ msg: e.message });
	}
};

const obtenerHistorialCitas = async (req, res) => {
	const { _id } = req.usuario;

	try {
		const citas = await Cita.find({ usuarioId: _id }).sort({ fecha: 1 });
		// console.log(citas);
		// console.log(doctor);
		res.json(citas);
	} catch (error) {
		console.log("Error al obtener citas", error);
	}
};

const obtenerCitasTerminadas = async (req, res) => {
	const { _id } = req.usuario;

	try {
		const citas = await HistorialCita.find({ usuarioId: _id }).sort({ fecha: 1 });
		// console.log(citas);

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
	actualizarPerfil,
	eliminarNotificaciones,
	obtenerDoctoresAprobados,
	obtenerDoctorId,
	comprobarCita,
	programarCita,
	obtenerCitas,
	eliminarCita,
	cancelarCitaAprobada,
	obtenerHistorialCitas,
	obtenerCitasTerminadas,
};
