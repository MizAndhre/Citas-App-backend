import mongoose from "mongoose";

const citaSchema = new mongoose.Schema(
	{
		usuarioId: {
			type: String,
			required: true,
		},
		doctorId: {
			type: String,
			required: true,
		},
		usuarioInfo: {
			type: Object,
			required: true,
		},
		doctorInfo: {
			type: Object,

			required: true,
		},
		fecha: {
			type: Date,
			required: true,
		},
		hora: {
			type: Date,
			required: true,
		},
		motivo: {
			type: String,
			default: null,
		},
		estado: {
			type: String,
			required: true,
			default: "pendiente",
		},
	},
	{
		timestamps: true,
	}
);

//registrarlo en mongo
const Cita = mongoose.model("Cita", citaSchema);
export default Cita;
