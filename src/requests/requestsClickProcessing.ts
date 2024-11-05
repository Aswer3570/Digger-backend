import { ISocketPlayerClicked, IGetPlayerData } from '../config/interfaces'
import { getDataRedis, setDataFromRedis } from '../redis/requests/requestsRedis'
import { getPlayerDataFromSQL } from '../sequelize/requests/requestsSQL'
import { toUTC } from '../functions/functions'
import { KEY_967, getVictoryMessage, CLICK_PROCESSING_ERROR } from '../config/const'
import { sendMessageToUser } from '../telegraf/requestsTelegraf'

export async function clickProcessing({ telegramId, attempts, lastAddress, compressedWif, uncompressedWif, rawPrivateKey, lastGameDate }: ISocketPlayerClicked): Promise<IGetPlayerData> {
	try {
		let playerData: IGetPlayerData | null

		playerData = await getDataRedis(`player:${telegramId}`)
		if (!playerData) {
			playerData = await getPlayerDataFromSQL({ telegramId: telegramId })
			if (!playerData) {
				throw new Error(CLICK_PROCESSING_ERROR)
			}
		}

		playerData.ban = cheaterCheck(playerData, attempts, lastGameDate)
		playerData.attempts = attempts
		playerData.lastAddress = lastAddress
		playerData.compressedWif = compressedWif
		playerData.uncompressedWif = uncompressedWif
		playerData.rawPrivateKey = rawPrivateKey
		playerData.lastGameDate = lastGameDate
		playerData.gameOver = await bitcoinKeyVerification(telegramId, lastAddress, compressedWif, uncompressedWif, rawPrivateKey)

		const updatePlayerData = {
			attempts: playerData.attempts,
			maximumAttempts: playerData.maximumAttempts,
			lastAddress: playerData.lastAddress,
			compressedWif: playerData.compressedWif,
			uncompressedWif: playerData.uncompressedWif,
			rawPrivateKey: playerData.rawPrivateKey,
			ban: playerData.ban,
			lastGameDate: playerData.lastGameDate,
			gameOver: playerData.gameOver,
			referralCode: playerData.referralCode
		}

		await setDataFromRedis(`player:${telegramId}`, updatePlayerData)

		return updatePlayerData
	} catch (error) {
		throw error
	}
}

function cheaterCheck(playerData: IGetPlayerData, attempts: number, lastGameDate: Date): boolean {
	if (playerData && playerData.attempts >= attempts) {
		const playerUTCDate = toUTC(lastGameDate)
		const serverUTCDate = new Date()

		if (playerUTCDate.getTime() === serverUTCDate.getTime()) {
			return true
		}
	}

	return false
}

async function bitcoinKeyVerification(telegramId: number, lastAddress: string, compressedWif: string, uncompressedWif: string, rawPrivateKey: string): Promise<boolean> {
	if (KEY_967 === lastAddress) {
		const messageOfVictory: string = getVictoryMessage(lastAddress, compressedWif, uncompressedWif, rawPrivateKey)

		// Отправляем этому игроку сообщение в бота с ключами
		await sendMessageToUser(telegramId, messageOfVictory)

		return true
	}

	return false
}