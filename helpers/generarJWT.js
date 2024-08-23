import jwt from "jsonwebtoken";

//se envia el id y role del usuario
// se da una palabra secreta para jsonwebtoken
// se establece la expiracion 
const generarJWT = (id, role) => {
	return jwt.sign({ id, role }, process.env.JWT_SECRET, {
		expiresIn: "30d",
	});
};

export default generarJWT;
