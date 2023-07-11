import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
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
	role: {
		type: String,
		default: "admin",
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
});

//registrarlo en mongoose
const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
