import { IGetPlayerData } from '../config/interfaces'

export function updateAttempts(playerData: IGetPlayerData): IGetPlayerData {
	if (playerData.ban || playerData.gameOver) return playerData

	if (!playerData.lastGameDate) {
		return {
			...playerData,
			attempts: playerData.maximumAttempts
		}
	}

	const currentDate: Date = new Date()
	const lastGameDate: Date = new Date(playerData.lastGameDate)
	const timeElapsedInSeconds: number = Math.floor((currentDate.getTime() - lastGameDate.getTime()) / 1000)

	let newAttempts: number = playerData.attempts + timeElapsedInSeconds

	if (playerData.attempts <= playerData.maximumAttempts) {
		newAttempts = Math.min(newAttempts, playerData.maximumAttempts)
	} else {
		newAttempts = playerData.attempts
	}

	return {
		...playerData,
		attempts: newAttempts
	}
}