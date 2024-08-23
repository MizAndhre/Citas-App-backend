import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";
import Doctor from "../models/Doctor.js";
import Admin from "../models/Admin.js";

const checkAuth = async (req, res, next) => {
	let token;

	// toma los headers de la request que se hacer
	// si existe el header de authorization y si empieza con "Bearer" continua la funcion
	if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
		try {
			token = req.headers.authorization.split(" ")[1];
			// Decodifica el token y lo asigna a la variable decoded
			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			// determina que usuario es por el role
			// y crea un parametro segun usuario en el request
			if (decoded.role === "usuario") {
				req.usuario = await Usuario.findById(decoded.id).select("-password -token");
			} else if (decoded.role === "doctor") {
				req.doctor = await Doctor.findById(decoded.id).select("-password -token");
			} else if (decoded.role === "admin") {
				req.admin = await Admin.findById(decoded.id).select("-password -token");
			}
			// Pasa al siguiente middleware, es decir la siguiente funcion
			return next();
		} catch (error) {
			const e = new Error("Token no válido");
			return res.status(403).json({ msg: e.message });
		}
	}

	if (!token) {
		const error = new Error("Token no válido o inexistente");
		res.status(403).json({ msg: error.message });
	}
	next();
};

export default checkAuth;
