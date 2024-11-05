/////////////////////////////
// Вызываем раз в 5 минут //
///////////////////////////

import { Transaction } from 'sequelize'

import { sequelize } from '../sequelize/index'
import { scanDataRedis, getDataRedis } from '../redis/requests/requestsRedis'
import { updatePlayersDataInSQL } from '../sequelize/requests/requestsSQL'

// Функция сохранения данных игрока из Redis в SQL БД
async function savePlayersRedisDataOnSQL(): Promise<void> {
	let transaction: Transaction | undefined

	try {
		transaction = await sequelize.transaction()

		const playersKeysRedis = await scanDataRedis('player:*')
		if (!playersKeysRedis) return

		for (let i = 0; i < playersKeysRedis.length; i++) {
			const playerDataRedis = await getDataRedis(playersKeysRedis[i])

			const telegramId: number = parseInt(playersKeysRedis[i].split(":")[1], 10)

			if (playerDataRedis) {
				await updatePlayersDataInSQL(
					'telegramId',
					telegramId,
					transaction,
					{
						attempts: playerDataRedis.attempts,
						maximumAttempts: playerDataRedis.maximumAttempts,
						lastAddress: playerDataRedis.lastAddress,
						compressedWif: playerDataRedis.compressedWif,
						uncompressedWif: playerDataRedis.uncompressedWif,
						rawPrivateKey: playerDataRedis.rawPrivateKey,
						lastGameDate: playerDataRedis.lastGameDate
					}
				)
			}
		}

		await transaction.commit()

		console.log('Data from Redis written to SQl!')
	} catch (error) {
		if (transaction) await transaction.rollback()

		console.error(error)
	}
}

savePlayersRedisDataOnSQL()