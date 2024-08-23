// usuarioController.test.js
import request from "supertest";
import app from "../../index.js";
import mongoose from "mongoose";
import Usuario from "../../models/Usuario.js";
import dotenv from "dotenv";
import Doctor from "../../models/Doctor.js";
import Cita from "../../models/Cita.js";

// !Configuración del entorno de pruebas
// Antes de las pruebas, conectar a base de datos de prueba
beforeAll(async () => {
	try {
		//connect metodo de mongoose para conectarse a BD
		const db = await mongoose.connect(process.env.MONGO_URI_PRUEBA, {
			//objeto de configuracion
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
	} catch (error) {
		console.log(`Error ${error.message}`);
		process.exit(1); //Imprime mensaje de error
	}
});

// Después de las pruebas, desconectar BD de prueba
// y eliminar los datos de la colección Usuarios
afterAll(async () => {
	await Usuario.deleteMany({});
	await Doctor.deleteMany({});
	await Cita.deleteMany({});
	await mongoose.disconnect();
});

let doctorIdRes;
let tokenPaciente;

// Define usuario de prueba
const nuevoUsuario = {
	nombre: "May Hurtado",
	email: "may@correo.com",
	password: "123456",
};

// Define doctor de prueba
const nuevoDoctor = {
	nombre: "Doctor Gonzalo",
	email: "doctor@correo.com",
	password: "123456",
	especialidad: "Cardiologia",
	horaInicio: "08:30",
	horaFinal: "15:30",
};

// ! Descripción de las pruebas
describe("Registro e Inicio de Sesión => usuario Paciente", () => {
	// Prueba para el controlador de registro de usuario
	it("Debería registrar un usuario correctamente", async () => {
		const response = await request(app).post("/api/usuarios/").send(nuevoUsuario);
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty("_id");
		expect(response.body).toHaveProperty("role", "usuario");
		expect(response.body.nombre).toBe(nuevoUsuario.nombre);
		expect(response.body.email).toBe(nuevoUsuario.email);
	});

	// Prueba para el controlador de registro de usuario con usuario ya registrado
	it("Debería devolver un error cuando un usuario ya está registrado", async () => {
		const response = await request(app).post("/api/usuarios/").send(nuevoUsuario);
		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("msg", "Usuario ya registrado");
	});

	// Prueba para el controlador de inicio de sesión de usuario
	it("Debería iniciar sesión correctamente con credenciales válidas", async () => {
		const usuarioPrueba = { email: "may@correo.com", password: "123456" };
		const response = await request(app).post("/api/usuarios/login").send(usuarioPrueba);
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty("_id");
		expect(response.body).toHaveProperty("role", "usuario");
		expect(response.body.nombre).toBe(nuevoUsuario.nombre);
		expect(response.body.email).toBe(nuevoUsuario.email);
		expect(response.body).toHaveProperty("token");

		tokenPaciente = response.body.token;
	});

	// Prueba para el controlador de inicio de sesión de usuario con contraseña incorrecta
	it("Debería devolver un error al iniciar sesión con contraseña incorrecta", async () => {
		const usuarioPrueba = { email: "may@correo.com", password: "passwordFalsa" };
		const response = await request(app).post("/api/usuarios/login").send(usuarioPrueba);
		expect(response.status).toBe(403);
		expect(response.body).toHaveProperty("msg", "La contraseña es incorrecta");
	});

	// Prueba para el controlador de inicio de sesión de usuario con usuario no registrado
	it("Debería devolver un error al intentar iniciar sesión con un usuario no registrado", async () => {
		const usuarioPrueba = { email: "usuariofalso@correo.com", password: "123456" };
		const response = await request(app).post("/api/usuarios/login").send(usuarioPrueba);
		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("msg", "Paciente no registrado");
	});
});

// ! Descripción de las pruebas
describe("Registro e Inicio de Sesión => usuario Doctor", () => {
	// Prueba para el controlador de registro de usuario
	it("Debería registrar un doctor correctamente", async () => {
		const response = await request(app).post("/api/doctores/").send(nuevoDoctor);
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty("_id");
		expect(response.body).toHaveProperty("role", "doctor");
		expect(response.body.nombre).toBe(nuevoDoctor.nombre);
		expect(response.body.email).toBe(nuevoDoctor.email);

		doctorIdRes = response.body._id;
	});

	// Prueba para el controlador de registro de doctor con doctor ya registrado
	it("Debería devolver un error cuando un doctor ya está registrado", async () => {
		const response = await request(app).post("/api/doctores/").send(nuevoDoctor);
		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("msg", "Doctor ya registrado");
	});

	// Prueba para el controlador de inicio de sesión de usuario
	it("Debería iniciar sesión correctamente con credenciales válidas", async () => {
		const usuarioPrueba = { email: "doctor@correo.com", password: "123456" };
		const response = await request(app).post("/api/doctores/login").send(usuarioPrueba);
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty("_id");
		expect(response.body).toHaveProperty("role", "doctor");
		expect(response.body.nombre).toBe(nuevoDoctor.nombre);
		expect(response.body.email).toBe(nuevoDoctor.email);
		expect(response.body).toHaveProperty("token");
	});

	// Prueba para el controlador de inicio de sesión de usuario con contraseña incorrecta
	it("Debería devolver un error al iniciar sesión con contraseña incorrecta", async () => {
		const usuarioPrueba = { email: "doctor@correo.com", password: "passwordFalsa" };
		const response = await request(app).post("/api/doctores/login").send(usuarioPrueba);
		expect(response.status).toBe(403);
		expect(response.body).toHaveProperty("msg", "La contraseña es incorrecta");
	});

	// Prueba para el controlador de inicio de sesión de usuario con usuario no registrado
	it("Debería devolver un error al intentar iniciar sesión con un usuario no registrado", async () => {
		const usuarioPrueba = { email: "doctorfalso@correo.com", password: "123456" };
		const response = await request(app).post("/api/doctores/login").send(usuarioPrueba);
		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("msg", "Doctor no registrado");
	});
});


describe("Controladores de citas", () => {
	describe("Comprobar la Disponibilidad de la Cita y Programar Cita", () => {
		// Suponemos que no hay citas previas para el doctor con el doctorId especificado
		const doctorId = doctorIdRes; // Doctor ID de ejemplo
		const fecha = "2023-07-31"; // Fecha de ejemplo
		const hora = "14:00"; // Hora de ejemplo
		const fechaHora = `${fecha} ${hora}`;
		const horaFormateada = new Date(fechaHora);

		it('Debería retornar "Cita disponible" si no hay citas para el doctor en la fecha y hora especificadas', async () => {
			const response = await request(app)
				.post("/api/usuarios/comprobar-cita")
				.set("Authorization", `Bearer ${tokenPaciente}`)
				.send({ doctorId, fecha, hora: horaFormateada });

			expect(response.status).toBe(200);
			expect(response.body).toEqual({ msg: "Cita disponible" });
		});
	});
});

// it("Debería programar una cita correctamente y enviar notificación al doctor", async () => {
//     // Datos de la nueva cita
//     const nuevaCitaData = {
//         doctorId,
//         usuarioInfo,
//         fecha,
//         hora: horaFormateada,
//         motivo: "Dolor de estomago",
//     };

//     const response = await request(app)
//         .post("/api/usuarios/programar-cita")
//         .set("Authorization", `Bearer ${tokenPaciente}`)
//         .send(nuevaCitaData);

//     // expect(response.status).toBe(200);
//     expect(response.body).toHaveProperty("_id");

//     // Verificar que la cita se haya guardado correctamente en la base de datos
//     const citaGuardada = await Cita.findById(response.body._id);
//     expect(citaGuardada).toMatchObject(nuevaCitaData);

//     // Verificar que se haya enviado la notificación al doctor
//     const doctorActualizado = await Doctor.findById(doctorId);
//     expect(doctorActualizado.unseenNotif).toHaveLength(1);
//     expect(doctorActualizado.unseenNotif[0].type).toBe("nueva-solicitud-cita");
// });

// it('Debería retornar "Cita no disponible" si ya hay una cita para el doctor en la fecha y hora especificadas', async () => {
// 	// Suponemos que ya hay una cita previa para el doctor con el doctorId especificado
// 	const doctorId = doctorIdRes; // Doctor ID de ejemplo
// 	const fecha = "2023-07-19"; // Fecha de ejemplo
// 	const hora = "14:30"; // Hora de ejemplo (esta hora ya estaría ocupada)
// 	const fechaHora = `${fecha} ${hora}`;
// 	const horaFormateada = new Date(fechaHora);

// 	// Insertar una cita previa para simular la ocupación
// 	const citaPrevia = new Cita({ doctorId, fecha, horaFormateada });
// 	await citaPrevia.save();

// 	const response = await request(app)
// 		.post("/api/usuarios/comprobar-cita")
// 		.send({ doctorId, fecha, hora });

// 	expect(response.status).toBe(400);
// 	expect(response.body).toEqual({ msg: "Cita no disponible" });
// });



