import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
	{
		nombre: {
			type: String,
			required: true,
			trim: true,
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
		especialidad: {
			type: String,
			required: true,
			trim: true,
		},
		horaInicio: {
			type: String,
			required: true,
		},
		horaFinal: {
			type: String,
			required: true,
		},
		token: {
			type: String,
			default: null,
		},
		role: {
			type: String,
			default: "doctor",
		},
		estado: {
			type: String,
			default: "pendiente",
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

//registrarlo en mongo
const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
