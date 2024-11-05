import { redisClient } from '../index'

// Функция получения данных из Redis
export async function getDataRedis(key: string): Promise<any | null> {
	try {
		const getRedisData = await redisClient.get(key)
		if (!getRedisData) return null

		return JSON.parse(getRedisData)
	} catch (error) {
		throw error
	}
}

// Функция записи данных в Redis
export async function setDataFromRedis(key: string, data: any): Promise<void> {
	const multi = redisClient.multi()

	try {
		multi.set(key, JSON.stringify(data))

		await multi.exec()

		console.log(`Data is written to Redis`)
	} catch (error) {
		await multi.discard()

		throw error
	}
}

export async function scanDataRedis(pattern: string): Promise<string[] | null> {
	let cursor = '0'
	let keys: string[] = []

	do {
		const [newCursor, foundKeys] = await redisClient.scan(cursor, 'MATCH', pattern)
		keys = keys.concat(foundKeys)
		cursor = newCursor
	} while (cursor !== '0')

	return keys
}