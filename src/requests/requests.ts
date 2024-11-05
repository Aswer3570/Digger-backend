import {
	ISocketGetPlayerData,
	IGetPlayerData,
	ISocketPlayerClicked,
	IPlayerFriendsRedis,
	ITasks
} from '../config/interfaces'
import { getDataRedis, scanDataRedis } from '../redis/requests/requestsRedis'
import { handlePlayerRetrievalInSQL } from './requestsAuthorizationAndRegistration'
import { clickProcessing } from './requestsClickProcessing'
import { getFriendsList } from './requestsPlayerReferrals'
import { getTasksList, getCompletedTasksList, completedCheckTask } from './requestsTasks'
import { updateAttempts } from './requestsFunctions'
import {
	GET_PLAYER_DATA_ERROR,
	PLAYER_CLICKED_ERROR,
	GET_FRIENDS_ERROR,
	GET_TASKS_ERROR,
	GET_COMPLETED_TASKS_ERROR,
	CHECK_TASKS_ERROR
} from '../config/const'

export async function getPlayerData({ telegramId, inviteCode, premium }: ISocketGetPlayerData): Promise<IGetPlayerData | { error: string }> {
	try {
		const playerRedisData: IGetPlayerData = await getDataRedis(`player:${telegramId}`)
		if (playerRedisData) return updateAttempts(playerRedisData)

		const playerSQLData = await handlePlayerRetrievalInSQL(telegramId, inviteCode, premium)

		return updateAttempts(playerSQLData)
	} catch (error) {
		console.error(error)

		return { error: GET_PLAYER_DATA_ERROR }
	}
}

export async function playerClicked({ telegramId, attempts, lastAddress, compressedWif, uncompressedWif, rawPrivateKey, lastGameDate }: ISocketPlayerClicked): Promise<IGetPlayerData | { error: string }> {
	try {
		return await clickProcessing({ telegramId, attempts, lastAddress, compressedWif, uncompressedWif, rawPrivateKey, lastGameDate })
	} catch (error) {
		console.error(error)

		return { error: PLAYER_CLICKED_ERROR }
	}
}

export async function getFriends(telegramId: number): Promise<IPlayerFriendsRedis | { error: string } | []> {
	try {
		const listInvitedFriends: IPlayerFriendsRedis = await getDataRedis(`friends:${telegramId}`)
		if (listInvitedFriends) return listInvitedFriends

		return await getFriendsList(telegramId)
	} catch (error) {
		console.error(error)

		return { error: GET_FRIENDS_ERROR }
	}
}

export async function getTasks(): Promise<ITasks[] | { error: string } | []> {
	try {
		let allTasksData: ITasks[] = []

		const tasksListFromRedis = await scanDataRedis('task:*')
		if (!tasksListFromRedis || tasksListFromRedis.length === 0) {
			return allTasksData = await getTasksList()
		}

		for (const task of tasksListFromRedis) {
			const taskData: ITasks = await getDataRedis(task)
			if (taskData.numberExecutions! > 0 && taskData.show !== false) {
				allTasksData.push(taskData)
			}
		}

		return allTasksData
	} catch (error) {
		console.error(error)

		return { error: GET_TASKS_ERROR }
	}
}

export async function getCompletedTasks(telegramId: number): Promise<number[] | { error: string } | []> {
	try {
		const listCompletedTasks: number[] = await getDataRedis(`completedTasks:${telegramId}`)
		if (listCompletedTasks) return listCompletedTasks

		return await getCompletedTasksList(telegramId)
	} catch (error) {
		console.error(error)

		return { error: GET_COMPLETED_TASKS_ERROR }
	}
}

export async function checkTask(telegramId: number, taskId: number, premium: boolean, actualAttempts: number | null): Promise<{ completed: boolean, taskId: number } | { error: string }> {
	try {
		return await completedCheckTask(telegramId, taskId, premium, actualAttempts)
	} catch (error) {
		console.error(error)

		return { error: CHECK_TASKS_ERROR }
	}
}