import mongoose from "mongoose";

// import generarId from "../helpers/generarID.js";

const usuarioSchema = new mongoose.Schema(
	{
		nombre: {
			type: String,
			trim: true,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		telefono: {
			type: String,
			trim: true,
			default: null,
		},
		genero: {
			type: String,
			trim: true,
			default: null,
		},
		role: {
			type: String,
			default: "usuario",
		},
		token: {
			type: String,
			default: null,
		},
		seenNotif: {
			type: Array,
			default: [],
		},
		unseenNotif: {
			type: Array,
			default: [],
		},
	},
	{
		timestamps: true,
	}
);

//registrarlo en mongoose
const Usuario = mongoose.model("Usuario", usuarioSchema);
export default Usuario;
