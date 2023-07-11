import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";
import Doctor from "../models/Doctor.js";
import Admin from "../models/Admin.js";

const checkAuth = async (req, res, next) => {
	let token;

	if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
		try {
			token = req.headers.authorization.split(" ")[1];

			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			// console.log(decoded);

			if (decoded.role === "usuario") {
				req.usuario = await Usuario.findById(decoded.id).select("-password -token");
			} else if (decoded.role === "doctor") {
				req.doctor = await Doctor.findById(decoded.id).select("-password -token");
			} else if (decoded.role === "admin") {
				req.admin = await Admin.findById(decoded.id).select("-password -token");
			}
			// console.log("Paso Auth");
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
