import express from "express";
import Doctor from "../models/Doctor";

const router = express.Router();

router.get("/obtener-doctores", async (req, res) => {
	try {
		const doctores = await Doctor.find({}).select(
			"-password -__v -token -unseenNotif -seenNotif"
		);

		res.json(doctores);
	} catch (error) {
		console.log("Error al obtener doctores", error);
	}
});

export default router;
