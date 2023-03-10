const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Appointment = require("./Appointment");
const Roles = require("./Roles");

const Customer = sequelize.define(
	"Customer",
	{
		username: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		refreshToken: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		custId: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
	},
	{
		freezeTableName: true,
	}
);

Customer.belongsToMany(Roles, { through: "UserRoles" });
Roles.belongsToMany(Customer, { through: "UserRoles" });
Customer.hasMany(Appointment, {
	foreignKey: "custId",
});
Appointment.belongsTo(Customer, {
	foreignKey: "custId",
});
module.exports = Customer;
