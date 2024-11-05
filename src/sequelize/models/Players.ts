import { Sequelize, DataTypes } from 'sequelize'

export default function (sequelize: Sequelize) {
	return sequelize.define('Players', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		telegramId: {
			type: DataTypes.INTEGER,
			unique: true
		},
		attempts: {
			type: DataTypes.INTEGER
		},
		lastGameDate: {
			type: DataTypes.DATE
		},
		lastAddress: {
			type: DataTypes.STRING(255)
		},
		registrationDate: {
			type: DataTypes.DATE
		},
		uniqueReferralCode: {
			type: DataTypes.STRING(255)
		},
		telegramNickname: {
			type: DataTypes.STRING(255)
		},
		telegramFirstName: {
			type: DataTypes.STRING(255)
		},
		maximumAttempts: {
			type: DataTypes.INTEGER
		},
		ban: {
			type: DataTypes.BOOLEAN
		},
		compressedWif: {
			type: DataTypes.STRING(255)
		},
		uncompressedWif: {
			type: DataTypes.STRING(255)
		},
		rawPrivateKey: {
			type: DataTypes.STRING(255)
		},
		gameOver: {
			type: DataTypes.BOOLEAN
		}
	}, {
		timestamps: false,
		tableName: 'Players'
	})
}