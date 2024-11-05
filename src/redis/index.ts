import Redis from 'ioredis'
import dotenv from 'dotenv'

dotenv.config()

export const redisClient = new Redis({
	host: process.env.REDIS_URL,
	port: Number(process.env.REDIS_PORT),
	password: process.env.REDIS_PASSWORD
})

// Обработка ошибок и успешного подключения
redisClient.on('error', error => console.log(error))
redisClient.on('connect', () => console.log('Connection to Redis successfully established'))