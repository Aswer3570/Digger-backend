import dotenv from 'dotenv'
import express from 'express'
import http from 'http'
import cors from 'cors'
import { Server } from 'socket.io'

import gameSocket from './sockets/gameSocket'

const app = express()
const server = http.createServer(app)
export const io = new Server(server, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST']
	}
})

dotenv.config()
app.use(cors())
app.use(express.json())

// Инициализация сокетов
gameSocket(io)

const PORT: number = Number(process.env.PORT) || 8080
const URL: string = process.env.NODE_ENV === 'production' ? '127.0.0.1' : ''
server.listen(PORT, URL, () => {
	console.log(`Listening on: ${URL}:${PORT}`)
})