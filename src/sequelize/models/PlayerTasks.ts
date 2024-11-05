import { Sequelize, DataTypes } from 'sequelize'

export default function (sequelize: Sequelize) {
	return sequelize.define('PlayerTasks', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		telegramId: {
			type: DataTypes.NUMBER,
		},
		taskId: {
			type: DataTypes.NUMBER,
		},
		dateCompletion: {
			type: DataTypes.DATE,
		}
	}, {
		timestamps: false,
		tableName: 'PlayerTasks'
	})
}