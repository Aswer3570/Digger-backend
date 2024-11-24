import { Transaction } from 'sequelize'

import {
	getAllTasksFromSQL,
	getAllPlayerTasksFromSQL,
	updateTasksInSQL,
	createPlayerTask
} from '../sequelize/requests/requestsSQL'
import { setDataFromRedis, getDataRedis } from '../redis/requests/requestsRedis'
import { ITasks, IPlayers } from '../config/interfaces'
import {
	isTelegramLink,
	parseTelegramUrl,
	getChatId,
	checkingTelegramSubscription
} from '../telegraf/requestsTelegraf'
import { sequelize } from '../sequelize/index'
import {
	COMPLETED_CHECK_TASK_GET_SPECIFIC_TASK_ERROR,
	COMPLETED_CHECK_TASK_GET_PLAYER_DATA_ERROR,
	COMPLETED_CHECK_TASK_NUMBER_OF_ACTIVATIONS_ERROR,
	COMPLETED_CHECK_TASK_GET_COMPLETED_TASKS_ERROR,
	COMPLETED_CHECK_TASK_CHECK_PREMIUM_STATUS_ERROR,
	COMPLETED_CHECK_TASK_IS_TASK_COMPLETED_RESULT_ERROR,
	COMPLETED_CHECK_TASK_RESULT_CREATE_PLAYER_TASK_ERROR,
	IS_TASK_COMPLETED_ERROR
} from '../config/const'

export async function getTasksList(): Promise<ITasks[] | []> {
	try {
		const allTasksInSQL = await getAllTasksFromSQL()
		if(!allTasksInSQL) return []

		const selectedFields = allTasksInSQL.reduce<ITasks[]>((acc, task) => {
			if (task.numberExecutions! > 0 && task.show !== false) {
				acc.push({
					id: task.id,
					title: task.title,
					icon: task.icon,
					price: task.price,
					premium: task.premium,
					url: task.url,
					type: task.type,
					numberExecutions: task.numberExecutions
				})
			}

			return acc
		}, [])

		for (const task of selectedFields) {
			await setDataFromRedis(`task:${task.id}`, task)
		}

		return selectedFields
	} catch (error) {
		throw error
	}
}

export async function getCompletedTasksList(telegramId: number): Promise<number[] | []> {
	try {
		let completedTasks: number[] = []

		const allPlayerTasksInSQL = await getAllPlayerTasksFromSQL(telegramId)
		if (allPlayerTasksInSQL) {
			completedTasks = allPlayerTasksInSQL.map(task => Number(task.taskId))
		}

		await setDataFromRedis(`completedTasks:${telegramId}`, completedTasks)

		return completedTasks
	} catch (error) {
		throw error
	}
}

// Функция проверки премиум-статуса задачи
function checkPremiumStatus(premium: boolean, getSpecificTaskPremium: boolean): boolean {
	if (premium) {
		return true
	}

	return !getSpecificTaskPremium
}

export async function completedCheckTask(telegramId: number, taskId: number, premium: boolean, actualAttempts: number | null): Promise<{ completed: boolean, taskId: number, description?: string }> {
	let transaction: Transaction | undefined

	try {
		const getSpecificTask: ITasks = await getDataRedis(`task:${taskId}`)
		if (!getSpecificTask) return { completed: false, taskId: taskId, description: COMPLETED_CHECK_TASK_GET_SPECIFIC_TASK_ERROR }

		const getPlayerData: IPlayers = await getDataRedis(`player:${telegramId}`)
		if (!getPlayerData) return { completed: false, taskId: taskId, description: COMPLETED_CHECK_TASK_GET_PLAYER_DATA_ERROR }

		// Проверяем количество активаций
		if (getSpecificTask.numberExecutions <= 0) {
			return {
				completed: false,
				taskId: taskId,
				description: COMPLETED_CHECK_TASK_NUMBER_OF_ACTIVATIONS_ERROR
			}
		}

		// Проверяем выполнено ли задание уже до этого
		const getCompletedTasks: number[] = await getDataRedis(`completedTasks:${telegramId}`)
		if (getCompletedTasks.includes(taskId)) {
			throw new Error(COMPLETED_CHECK_TASK_GET_COMPLETED_TASKS_ERROR)
		}

		// Проверить есть ли Premium и у игрока и у задания
		if (!checkPremiumStatus(premium, getSpecificTask.premium)) {
			return {
				completed: false,
				taskId: taskId,
				description: COMPLETED_CHECK_TASK_CHECK_PREMIUM_STATUS_ERROR
			}
		}

		// Проверка теперь самого задания
		const isTaskCompletedResult = await isTaskCompleted(getSpecificTask, telegramId)
		if (!isTaskCompletedResult.completed) {
			return { completed: false, taskId: taskId, description: COMPLETED_CHECK_TASK_IS_TASK_COMPLETED_RESULT_ERROR }
		}

		// Выдать приз игроку
		getPlayerData.attempts = actualAttempts ? actualAttempts : getPlayerData.attempts + getSpecificTask.price
		await setDataFromRedis(`player:${telegramId}`, getPlayerData)

		// Поместить id таски в таблицу Redis что она выполнена
		getCompletedTasks.push(taskId)
		await setDataFromRedis(`completedTasks:${telegramId}`, getCompletedTasks)

		// Отнять -1 у таски количество активаций
		getSpecificTask.numberExecutions = getSpecificTask.numberExecutions - 1
		await setDataFromRedis(`task:${taskId}`, getSpecificTask)

		transaction = await sequelize.transaction()

		// Записать в SQL выполненую таску
		await updateTasksInSQL(taskId, transaction, { numberExecutions: getSpecificTask.numberExecutions })

		// Добавить запись PlayerTask
		const resultCreatePlayerTask = await createPlayerTask(telegramId, taskId, transaction)
		if (!resultCreatePlayerTask) {
			return { completed: false, taskId: taskId, description: COMPLETED_CHECK_TASK_RESULT_CREATE_PLAYER_TASK_ERROR }
		}

		await transaction.commit()

		return { completed: true, taskId: taskId }
	} catch (error) {
		if (transaction) await transaction.rollback()

		throw error
	}
}

async function isTaskCompleted(getSpecificTask: ITasks, telegramId: number): Promise<{ completed: boolean, taskId: number, description?: string }> {
	try {
		if (getSpecificTask.type === 'link') {
			if (isTelegramLink(getSpecificTask.url as string)) {
				const parseTelegramURL = parseTelegramUrl(getSpecificTask.url as string)
				const telegramResourceId = await getChatId(parseTelegramURL as string)

				if (telegramResourceId.success) {
					const resultCheckingTelegramSubscription = await checkingTelegramSubscription(telegramResourceId.chatId as number, telegramId)

					if (!resultCheckingTelegramSubscription.subscribed) {
						return { completed: false, taskId: getSpecificTask.id, description: IS_TASK_COMPLETED_ERROR }
					}
				}
			}
		}

		return { completed: true, taskId: getSpecificTask.id }
	} catch (error) {
		throw error
	}
}