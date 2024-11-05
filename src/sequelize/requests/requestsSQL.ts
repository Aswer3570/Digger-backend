import { Transaction } from 'sequelize'

import wrapperPlayers from '../wrappers/wrapperPlayers'
import wrapperPlayerReferrals from '../wrappers/wrapperPlayerReferrals'
import wrapperTasks from '../wrappers/wrapperTasks'
import wrapperPlayerTasks from '../wrappers/wrapperPlayerTasks'
import {
	IPlayers,
	IPlayersCreate,
	IPlayerReferralCreate,
	IPlayerReferral,
	IGetPlayerData,
	ITasks,
	IPlayerTasks,
	ITaskUpdateData,
	IPlayerTasksCreate,
	IPlayersUpdate
} from '../../config/interfaces'
import { referralCodeGenerator, generateMD5Hash } from '../../functions/functions'
import { setDataFromRedis, getDataRedis } from '../../redis/requests/requestsRedis'
import { getPlayerFriendsAndSaveRadis } from '../../requests/requestsAuthorizationAndRegistration'

const wrapperPlayer = new wrapperPlayers()
const wrapperPlayerReferral = new wrapperPlayerReferrals()
const wrapperTask = new wrapperTasks()
const wrapperPlayerTask = new wrapperPlayerTasks()

// Функция получения конкретного игрока из таблицы Players
export async function getPlayerDataFromSQL(searchConditions: { telegramId?: number, uniqueReferralCode?: string }): Promise<IPlayers | null> {
	try {
		const result = await wrapperPlayer.findOne({
			where: searchConditions
		})
		if (!result) return null

		return result.get()
	} catch (error) {
		throw error
	}
}

// Функция регистрации нового игрока в таблицу Players
export async function playersRegistration(telegramId: number, telegramNickname: string | undefined, telegramFirstName: string, transaction: Transaction): Promise<IPlayers> {
	const playerData: IPlayersCreate = {
		telegramId: telegramId,
		lastAddress: generateMD5Hash(),
		uniqueReferralCode: await referralCodeGenerator(),
		telegramNickname: telegramNickname,
		telegramFirstName: telegramFirstName
	}

	try {
		const newPlayer = await wrapperPlayer.create(playerData, { transaction })

		return newPlayer.toJSON() as IPlayers
	} catch (error) {
		throw error
	}
}

// Регистрация нового игрока в таблицу PlayerReferrals
async function playerReferralsRegistration(inviterTelegramId: number, invitedTelegramId: number, reward: number, telegramFirstName: string, transaction: Transaction): Promise<IPlayerReferral> {
	const friendsData: IPlayerReferralCreate = {
		inviterTelegramId: Number(inviterTelegramId),
		invitedTelegramId: invitedTelegramId,
		reward: reward,
		invitedFirstName: telegramFirstName
	}

	try {
		const newPlayerReferral = await wrapperPlayerReferral.create(friendsData, { transaction })

		return newPlayerReferral.toJSON() as IPlayerReferral
	} catch (error) {
		throw error
	}
}

// Функция поиска игрока кто пригласил
export async function playerReferralsRegistrationInvite(telegramId: number, uniqueReferralCode: string, reward: number, telegramFirstName: string, transaction: Transaction): Promise<IPlayerReferral | null> {
	try {
		const playerGetResult = await getPlayerDataFromSQL({ uniqueReferralCode: uniqueReferralCode })
		if (!playerGetResult) return null

		await issuingAttemptsForInvitation(playerGetResult, playerGetResult.telegramId, reward)

		await getPlayerFriendsAndSaveRadis(playerGetResult.telegramId, telegramFirstName, reward, uniqueReferralCode)

		return playerReferralsRegistration(playerGetResult.telegramId, telegramId, reward, telegramFirstName, transaction)
	} catch (error) {
		throw error
	}
}

// Функция выдачи приза тому кто пригласил
async function issuingAttemptsForInvitation(playerResult: IPlayers, telegramId: number, reward: number): Promise<void> {
	try {
		const getInvitedPlayerData = await getDataRedis(`player:${telegramId}`)
		if (getInvitedPlayerData) {
			getInvitedPlayerData.maximumAttempts = getInvitedPlayerData.maximumAttempts + reward

			await setDataFromRedis(`player:${telegramId}`, getInvitedPlayerData)
		} else {
			const playerData: IGetPlayerData = {
				attempts: playerResult.attempts,
				maximumAttempts: playerResult.maximumAttempts + reward,
				lastAddress: playerResult.lastAddress,
				compressedWif: playerResult.compressedWif,
				uncompressedWif: playerResult.uncompressedWif,
				rawPrivateKey: playerResult.rawPrivateKey,
				ban: playerResult.ban,
				lastGameDate: playerResult.lastGameDate,
				gameOver: playerResult.gameOver,
				referralCode: playerResult.uniqueReferralCode
			}

			await setDataFromRedis(`player:${telegramId}`, playerData)
		}
	} catch (error) {
		throw error
	}
}

// Функция получения данных из таблицы PlayerReferrals
export async function getAllPlayerReferralFromSQL(telegramId: number): Promise<IPlayerReferral[] | null> {
	try {
		const results = await wrapperPlayerReferral.findAllWithUserReferrals({
			where: {
				inviterTelegramId: telegramId
			}
		})

		if (results && results.length > 0) {
			return results.map(result => result.get({ plain: true }))
		} else {
			return null
		}
	} catch (error) {
		throw error
	}
}

// Функция получения данных из таблицы Tasks
export async function getAllTasksFromSQL(): Promise<ITasks[] | null> {
	try {
		const results = await wrapperTask.findAll()

		if (results && results.length > 0) {
			return results.map(result => result.get({ plain: true }))
		} else {
			return null
		}
	} catch (error) {
		throw error
	}
}

// Функция получения данных из таблицы PlayerTasks
export async function getAllPlayerTasksFromSQL(telegramId: number): Promise<IPlayerTasks[] | null> {
	try {
		const results = await wrapperPlayerTask.findAllWithPlayerTasks({
			where: {
				telegramId: telegramId
			}
		})

		if (results && results.length > 0) {
			return results.map(result => result.get({ plain: true }))
		} else {
			return null
		}
	} catch (error) {
		throw error
	}
}

// Функция обновления numberExecutions в таблице Tasks
export async function updateTasksInSQL(id: number, transaction: Transaction, updateData: ITaskUpdateData): Promise<void> {
	const taskData: Partial<ITaskUpdateData> = {}

	Object.entries(updateData).forEach(([key, value]) => {
		if (value !== undefined) {
			taskData[key as keyof ITaskUpdateData] = value
		}
	})

	const where = {
		where: {
			id: id
		},
		transaction: transaction
	}

	try {
		await wrapperTask.update(taskData, where)
	} catch (error) {
		throw error
	}
}

// Функция записи данных таски и пользователя в таблицу PlayerTasks
export async function createPlayerTask(telegramId: number, taskId: number, transaction: Transaction): Promise<IPlayerTasks> {
	const userTaskData: IPlayerTasksCreate = {
		telegramId: telegramId,
		taskId: taskId
	}

	try {
		const newUserTask = await wrapperPlayerTask.create(userTaskData, { transaction })

		const userTask = newUserTask.toJSON() as IPlayerTasks

		return userTask
	} catch (error) {
		throw error
	}
}

// Функция обновления данных в таблице Players
export async function updatePlayersDataInSQL(identifierType: 'telegramId', identifierValue: number, transaction: Transaction, updateData: IPlayersUpdate): Promise<void> {
	const playerData: Partial<IPlayersUpdate> = {}

	Object.entries(updateData).forEach(([key, value]) => {
		if (value !== undefined) {
			playerData[key as keyof IPlayersUpdate] = value
		}
	})

	const where = {
		where: {
			[identifierType]: identifierValue
		},
		transaction: transaction
	}

	try {
		await wrapperPlayer.update(playerData, where)
	} catch (error) {
		throw error
	}
}