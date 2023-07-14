import mongoose from "mongoose";

const historialCitaSchema = new mongoose.Schema(
	{
		citaId: {
			type: String,
			required: true,
		},
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
			type: String,
			required: true,
		},
		motivo: {
			type: String,
			default: null,
		},
		estado: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

//guardarlo en mongo
const HistorialCita = mongoose.model("HistorialCita", historialCitaSchema);
export default HistorialCita;
