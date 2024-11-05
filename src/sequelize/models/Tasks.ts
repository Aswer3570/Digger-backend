import { Sequelize, DataTypes } from 'sequelize'

export default function (sequelize: Sequelize) {
	return sequelize.define('Tasks', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		title: {
			type: DataTypes.STRING(255),
		},
		icon: {
			type: DataTypes.STRING(255),
		},
		price: {
			type: DataTypes.NUMBER,
		},
		premium: {
			type: DataTypes.BOOLEAN,
		},
		url: {
			type: DataTypes.STRING(255)
		},
		numberExecutions: {
			type: DataTypes.NUMBER,
		},
		show: {
			type: DataTypes.BOOLEAN,
		},
		type: {
			type: DataTypes.STRING(255),
		},
		parameters: {
			type: DataTypes.NUMBER,
		}
	}, {
		timestamps: false,
		tableName: 'Tasks'
	})
}