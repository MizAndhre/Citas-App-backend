// console.log("Desde NodeJS");
// Forma antigua de acceder a express
// Activar Type: Modules en Package.JSON
// const express = require("express");

//1. Archivo de conexión del backend
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; //permite acceso a la api

import conectarDB from './config/db.js';

import usuarioRoutes from './routes/usuarioRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

//2. Funcionalidad para crear el servidor
//3. Llamar e iniciar express
const app = express();
//7. configuracion de dotenv/.env
dotenv.config();

//5. use => forma en la que express maneja el routing
//Configuración del middleware
app.use(express.json());
//6. llamar la conexión de la base de datos
conectarDB();

//dominios permitidos ==> CORS
// const dominiosPermitidos = [process.env.FRONTEND_URL];
// const corsOptions = {
// 	origin: function (origin, callback) {
// 		if (dominiosPermitidos.indexOf(origin) !== -1) {
// 			callback(null, true);
// 		} else {
// 			callback(new Error("No permitido por CORS"));
// 		}
// 	},
// };
// app.use(cors(corsOptions));

// Crear las rutas API
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/doctores', doctorRoutes);
app.use('/api/admins', adminRoutes);

//4. Puerto a escuchar para hacer peticiones/funcionar
//Este port se agrega al .env
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log('Servidor funcionando en el puerto:', PORT);
});

export default app;
