const Joi = require("joi");
const { DateTime } = require("luxon");
// console.log(DateTime.now().toISO());

module.exports = Joi.object({
	date: Joi.date().iso().required().messages({
		"any.required": `date is a required field`,
	}),
	time: Joi.string()
		.regex(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
		.required(),
	hairStyleId: Joi.string().required().messages({
		"string.base": `hairStyleId should be a string`,
		"string.empty": `hairStyleId cannot be an empty`,
		"any.required": `hairStyleId is a required field`,
	}),
}).options({ abortEarly: false });

// {
//     date: {
//         type: DataTypes.DATEONLY,
//         allowNull: false,
//         defaultValue: Date.now(),
//     },
//     time: {
//         type: DataTypes.TIME,
//         allowNull: false,
//     },
//     completed: {
//         type: DataTypes.BOOLEAN,
//         defaultValue: false,
//     },
//     cancelled: {
//         type: DataTypes.BOOLEAN,
//         defaultValue: false,
//     },

//     custId: {
//         type: DataTypes.UUID,
//         allowNull: false,
//         references: {
//             model: "Customer",
//             key: "custId",
//         },
//     },
// },
