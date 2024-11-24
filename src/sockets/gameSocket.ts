import { Server, Socket } from 'socket.io'

import {
	ISocketGetPlayerData,
	ISocketPlayerClicked,
	ISocketGetFriends,
	ISocketGetCompletedTasks,
	ISocketCheckTask
} from '../config/interfaces'
import {
	getPlayerData,
	playerClicked,
	getFriends,
	getTasks,
	getCompletedTasks,
	checkTask
} from '../requests/requests'

const gameSocket = (io: Server) => {
	io.on('connection', async (socket: Socket) => {
		console.log('User connected on Websocket')

		// Отдаём данные игрока
		/*
			{
				"telegramId": 35995282,
				"inviteCode": null,
				"premium": false
			}
		*/
		socket.on('getPlayerData', async ({ telegramId, inviteCode = null, premium }: ISocketGetPlayerData) => {
			try {
				const resultPlayerData = await getPlayerData({ telegramId, inviteCode, premium })
				if ('error' in resultPlayerData) return socket.emit('errorMessage', { error: resultPlayerData.error })

				socket.emit('getPlayerData', resultPlayerData)
			} catch (error) {
				socket.emit('errorMessage', { error: 'An error occurred while processing your request' })
			}
		})

		// Обрабатываем клики игрока
		/*
			{
				"telegramId": 35995282,
				"attempts": 290,
				"lastAddress": "12ib7dApVFvg82TXKycWBNpN8kFyiAN1dr",
				"compressedWif": "qweqweqwe",
				"uncompressedWif": "asdasdasd",
				"rawPrivateKey": "zxczxczxc",
				"lastGameDate": "2024-09-30 04:42:34.870732+04"
			}
		*/
		socket.on('playerClicked', async ({ telegramId, attempts, lastAddress, compressedWif, uncompressedWif, rawPrivateKey, lastGameDate }: ISocketPlayerClicked) => {
			try {
				const resultPlayerClicked = await playerClicked({ telegramId, attempts, lastAddress, compressedWif, uncompressedWif, rawPrivateKey, lastGameDate })
				if ('error' in resultPlayerClicked) return socket.emit('errorMessage', { error: resultPlayerClicked.error })

				socket.emit('getPlayerData', resultPlayerClicked)
			} catch (error) {
				socket.emit('errorMessage', { error: 'An error occurred while processing your request' })
			}
		})

		// Возвращаем список приглашённых друзей игроком
		/*
			{
				"telegramId": 35995282
			}
		*/
		socket.on('getFriends', async ({ telegramId }: ISocketGetFriends) => {
			try {
				const resultGetFriends = await getFriends(telegramId)
				if ('error' in resultGetFriends) return socket.emit('errorMessage', { error: resultGetFriends.error })

				socket.emit('getFriends', resultGetFriends)
			} catch (error) {
				socket.emit('errorMessage', { error: 'An error occurred while processing your request' })
			}
		})

		// Возвращаем список всех заданий
		socket.on('getTasks', async () => {
			try {
				const resultGetTasksList = await getTasks()
				if ('error' in resultGetTasksList) return socket.emit('errorMessage', { error: resultGetTasksList.error })

				socket.emit('getTasks', resultGetTasksList)
			} catch (error) {
				socket.emit('errorMessage', { error: 'An error occurred while processing your request' })
			}
		})

		// Возвращаем список выполненых заданий для игрока
		/*
			{
				"telegramId": 35995282
			}
		*/
		socket.on('getCompletedTasks', async ({ telegramId }: ISocketGetCompletedTasks) => {
			try {
				const resultGetCompletedTasks = await getCompletedTasks(telegramId)
				if ('error' in resultGetCompletedTasks) return socket.emit('errorMessage', { error: resultGetCompletedTasks.error })

				socket.emit('getCompletedTasks', resultGetCompletedTasks)
			} catch (error) {
				socket.emit('errorMessage', { error: 'An error occurred while processing your request' })
			}
		})

		// Проверка выполнения задания
		/*
			{
				"telegramId": 35995282,
				"taskId": 1,
				"premium": true,
				"actualAttempts": 762
			}
		*/
		socket.on('checkTask', async ({ telegramId, taskId, premium, actualAttempts }: ISocketCheckTask) => {
			try {
				const resultCheckTask = await checkTask(telegramId, taskId, premium, actualAttempts)
				if ('error' in resultCheckTask) return socket.emit('errorMessage', { error: resultCheckTask.error })

				socket.emit('checkTask', resultCheckTask)
			} catch (error) {
				socket.emit('errorMessage', { error: 'An error occurred while processing your request' })
			}
		})
	})
}

export default gameSocket