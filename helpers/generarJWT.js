import jwt from "jsonwebtoken";

const generarJWT = (id, role) => {
	return jwt.sign({ id, role }, process.env.JWT_SECRET, {
		expiresIn: "30d",
	});
};

export default generarJWT;
