import mongoose from "mongoose";

//1. Funcion async para esperar la conexión a la BD

const conectarDB = async () => {
	//Try/Catch por si hay error en la conexion
	try {
		//connect metodo de mongoose para conectarse a BD
		const db = await mongoose.connect(process.env.MONGO_URI, {
			//objeto de configuracion
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		const url = `${db.connection.host}:${db.connection.port}`;
		console.log(`MongoDB contectado en ${url}`);
	} catch (error) {
		console.log(`Error ${error.message}`);
		process.exit(1); //Imprime mensaje de error
	}
};

export default conectarDB;