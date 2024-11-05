import { Sequelize, DataTypes } from 'sequelize'

export default function (sequelize: Sequelize) {
	return sequelize.define('PlayerReferrals', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		inviterTelegramId: {
			type: DataTypes.INTEGER
		},
		invitedTelegramId: {
			type: DataTypes.INTEGER
		},
		invitationDate: {
			type: DataTypes.DATE
		},
		reward: {
			type: DataTypes.INTEGER
		},
		invitedFirstName: {
			type: DataTypes.STRING
		}
	}, {
		timestamps: false,
		tableName: 'PlayerReferrals'
	})
}