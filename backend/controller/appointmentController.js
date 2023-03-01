//create an appointment using the customers id
const { Op } = require("sequelize");
const Appointment = require("../model/Appointment");
const newAppointmentSchema = require("../validationjoi/appointments/newAppointment");
const availableTimeSchema = require("../validationjoi/appointments/getAvailableAppointments");
const { DateTime } = require("luxon");
const Customer = require("../model/Customer");
const HairStyle = require("../model/HairStyle");
const updateAppointment = require("../validationjoi/appointments/updateAppointment");

function validateTime(time, date) {
	const currentDate = new Date().toISOString().substring(0, 10);
	date = new Date(date).toISOString().substring(0, 10);
	// console.log(time, date, currentDate, parseInt(time) > DateTime.now().hour);
	let timeValid;
	if (date <= currentDate) {
		timeValid =
			time >= "08:00" &&
			time <= "22:00" &&
			date >= currentDate &&
			parseInt(time) > DateTime.now().hour;
	} else {
		timeValid = time >= "08:00" && time <= "22:00" && date >= currentDate;
	}
	return timeValid;
}

async function handleCreateAppointMent(req, res) {
	const custId = req.params.custId;

	try {
		const validCustomer = await Customer.findByPk(custId);
		if (validCustomer) {
			const { value, error } = newAppointmentSchema.validate(req.body);

			if (error) {
				return res.status(400).json({ message: error.message });
			}
			console.log(value);
			const timeValid = validateTime(value.time, value.date);

			if (!timeValid)
				return res
					.status(400)
					.json({ message: "invalid appointment time" });

			//check if user already has appointment on that date (1 user 1 appointment per day)
			const appointment = await Appointment.findOne({
				where: {
					[Op.and]: [{ custId: custId }, { date: value.date }],
				},
			});

			if (appointment) {
				return res.status(400).json({
					message:
						"appointment date is not available, you cant create more than one appointment per day",
				});
			}

			//check if time and date is available
			const foundAppointment = await Appointment.findOne({
				where: {
					[Op.and]: [
						{ time: value.time },
						{ date: value.date },
						{ cancelled: false },
					],
				},
			});

			if (foundAppointment)
				return res
					.status(400)
					.json({ message: "appointment date is not available" });
			const result = await Appointment.create({
				...value,
				custId,
			});
			return res.json({
				result,
				message: "successfully created anappointment",
				foundAppointment: appointment,
			});
		} else {
			return res.status(400).json({ message: "invalid customer id" });
		}
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
}

//get all appointments belonging to a customer
async function handleGetAllCustomerAppointMent(req, res) {
	const custId = req.params.custId;

	//check if its a valid customer id
	try {
		const validCustomer = await Customer.findByPk(custId);
		if (validCustomer) {
			const result = await Appointment.findAll({
				where: {
					custId,
				},
			});

			return res.json({ custId, result });
		} else {
			return res.json({ message: "invalid customer id" }).status(400);
		}
	} catch (error) {
		return res.json({ error: error.message }).status(500);
	}
}

async function handleUpdateAppointment(req, res) {
	//validate harstyle id
	//validate customer id
	//validate date
	//validate time

	const appointmentId = req.params.appointmentId;
	// updatereq.body;
	const { value, error } = updateAppointment.validate(req.body);

	if (error) {
		return res.json({ message: error.message }).status(400);
	}

	try {
		//check valid appointment id
		const result = await Appointment.findByPk(appointmentId);
		console.log("FOOunndddddd APPOINTMENTTTSSSS !!!!!!!!!!!!1", result);
		if (result) {
			const timeValid = validateTime(value.time, value.date);

			if (!timeValid)
				return res
					.json({ message: "invalid appointment time" })
					.status(400);
			console.log(value, "asdadadasd=======11111110000000000");
			const validHairstyle = await HairStyle.findByPk(value.hairStyleId);
			const validCustomerId = await Customer.findByPk(value.custId);
			if (validHairstyle && validCustomerId) {
				// return res.json({ message: "good data" });

				//check if time and date is available
				const foundAppointment = await Appointment.findOne({
					where: {
						[Op.and]: [
							{ time: value.time },
							{ date: value.date },
							{ cancelled: false },
						],
					},
				});

				if (foundAppointment)
					return res
						.json({ message: "appointment date is not available" })
						.status(400);

				await Appointment.update(
					{
						...value,
					},
					{
						where: {
							appointmentId: appointmentId,
						},
					}
				);
			} else {
				return res
					.json({ message: "invalid hairstyle or customer id" })
					.status(400);
			}
		} else {
			return res.json({ message: "invalid appointment id" }).status(400);
		}
	} catch (error) {
		return res.json({ error: error.message }).status(500);
	}

	return res.json({ value, error });
}

async function handleDeleteAppointment(req, res) {
	const appointmentId = req.params.appointmentId;

	try {
		const result = await Appointment.findByPk(appointmentId);

		console.log(result);
		if (result) {
			await Appointment.destroy({
				where: {
					appointmentId: appointmentId,
				},
			});
			return res.json({ message: "Appointment deleted successfull" });
		} else {
			return res
				.status(400)
				.json({ message: `Appointment ID ${appointmentId} not found` });
		}
	} catch (error) {
		return res.json({ error: error.message }).status(500);
	}
}

function validAvalilableTime(time, date) {
	//all times less than current date and time are invalid

	date = new Date(date).toISOString().substring(0, 10);
	const currentDate = new Date().toISOString().substring(0, 10);
	const timeNotValid =
		DateTime.now().hour >= parseInt(time) && currentDate >= date;

	return timeNotValid;
}

// Single page application, is a site that has a single page with dynamic contents based on the URL (and other things).
async function handleGetAvailableTime(req, res) {
	//remember to increase month by 1 for valid date
	const { date } = req.params;
	const { value, error } = availableTimeSchema.validate({ date });

	if (error) {
		return res.status(400).json({ message: error.message });
	}
	const times = {
		"07:00:00": true,
		"08:00:00": true,
		"09:00:00": true,
		"10:00:00": true,
		"11:00:00": true,
		"12:00:00": true,
		"13:00:00": true,
		"14:00:00": true,
		"15:00:00": true,
		"16:00:00": true,
		"17:00:00": true,
		"18:00:00": true,
		"19:00:00": true,
	};
	const result = await Appointment.findAll({
		attributes: ["time"],
		where: {
			date: date,
			cancelled: false,
			completed: false,
		},
	});

	for (let i = 0; i < result.length; i++) {
		times[result[i].time] = false;
	}

	const times2 = { ...times };

	for (let time in times2) {
		if (validAvalilableTime(time.slice(0, 5), date)) {
			//checks if its not valid
			times2[time] = false;
		} else {
			if (times2[time] !== false) {
				times2[time] = true;
			}
		}
	}

	res.json({ date, value, message: error?.message, times: times2 });
}

async function handleGetAppointmentInfo(req, res) {
	const appointmentId = req.params.appointmentId;
	try {
		const result = await Appointment.findByPk(appointmentId);

		console.log(result);
		if (result) {
			const result = await Appointment.findByPk(appointmentId);
			return res.json({ result });
		} else {
			return res
				.status(400)
				.json({ message: `Appointment ID ${appointmentId} not found` });
		}
	} catch (error) {
		return res.json({ error: error.message }).status(500);
	}
}

module.exports = {
	handleCreateAppointMent,
	handleGetAllCustomerAppointMent,
	handleUpdateAppointment,
	handleDeleteAppointment,
	handleGetAvailableTime,
	handleGetAppointmentInfo,
};
