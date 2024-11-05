import { Dialect } from 'sequelize'

export const SQL_DB_DIALECT: Dialect = "postgres"

export const IS_PREMIUM: number = 200
export const NO_PREMIUM: number = 100

export const KEY_967: string = "12ib7dApVFvg82TXKycWBNpN8kFyiAN1dr"

export function getVictoryMessage(lastAddress: string, compressedWif: string, uncompressedWif: string, rawPrivateKey: string): string {
	const VICTORY_MESSAGE: string = `
		Wow! You won! Welcome to the billionaires club!

		Your keys to access your wallet:
		lastAddress: {lastAddress}
		compressedWif: {compressedWif}
		uncompressedWif: {uncompressedWif}
		rawPrivateKey: {rawPrivateKey}

		If you have any questions, let me know, I will help: @aswer3570

		P.S. It would be great if you could throw us a percentage)
	`
	
	return VICTORY_MESSAGE
		.replace('{lastAddress}', lastAddress)
		.replace('{compressedWif}', compressedWif)
		.replace('{uncompressedWif}', uncompressedWif)
		.replace('{rawPrivateKey}', rawPrivateKey)
}

export const GET_PLAYER_DATA_ERROR: string = "Could not get player data from Redis or SQL DB"

export const PLAYER_CLICKED_ERROR: string = "An error occurred while processing player clicks"

export const GET_FRIENDS_ERROR: string = "Couldn't get friends list"

export const GET_TASKS_ERROR: string = "Couldn't get tasks list"

export const GET_COMPLETED_TASKS_ERROR: string = "Could not get all completed tasks"

export const CHECK_TASKS_ERROR: string = "Unable to check the task completion"

export const CLICK_PROCESSING_ERROR: string = "Couldn't find such a player"

export const GET_FRIENDS_LIST_ERROR: string = "Couldn't find such a player"

export const COMPLETED_CHECK_TASK_GET_SPECIFIC_TASK_ERROR: string = "Couldn't find such a task"

export const COMPLETED_CHECK_TASK_GET_PLAYER_DATA_ERROR: string = "There is no such player"

export const COMPLETED_CHECK_TASK_NUMBER_OF_ACTIVATIONS_ERROR: string = "The task can no longer be completed"

export const COMPLETED_CHECK_TASK_GET_COMPLETED_TASKS_ERROR: string = "This task has already been completed"

export const COMPLETED_CHECK_TASK_CHECK_PREMIUM_STATUS_ERROR: string = "You do not have a premium subscription to complete this task"

export const COMPLETED_CHECK_TASK_IS_TASK_COMPLETED_RESULT_ERROR: string = "An error occurred while executing the task"

export const COMPLETED_CHECK_TASK_RESULT_CREATE_PLAYER_TASK_ERROR: string = "Could not add entry to playerTasks"

export const IS_TASK_COMPLETED_ERROR: string = "No subscription"