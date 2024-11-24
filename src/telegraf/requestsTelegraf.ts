import dotenv from 'dotenv'
import { Telegraf } from 'telegraf'

import { Chat } from 'telegraf/typings/core/types/typegram'
import { TELEGRAM_LINK } from '../config/const'

dotenv.config()

const bot = new Telegraf(process.env.BOT_TOKEN as string)

export async function getTelegramUserData(link: string): Promise<Chat> {
	return await bot.telegram.getChat(link)
}

export async function sendMessageToUser(telegramId: number, message: string): Promise<void> {
	try {
		await bot.telegram.sendMessage(telegramId, message)

		console.log('Winning message sent to player')
	} catch (error) {
		throw error
	}
}

export function isTelegramLink(url: string): boolean {
	return url.startsWith(TELEGRAM_LINK)
}

export function parseTelegramUrl(url: string): string {
	const channelName = url.replace(/.*\/([^\/]+)$/, '@$1')

	return channelName
}

export async function getChatId(link: string): Promise<{ success: boolean, error?: string, chatId?: number }> {
	try {
		const user = await getTelegramUserData(link)

		return { success: true, chatId: user.id }
	} catch (error) {
		if (error instanceof Error) {
			return {
				success: false,
				error: error.message
			}
		}

		return {
			success: false,
			error: 'Unknown error occurred'
		}
	}
}

export async function checkingTelegramSubscription(channelId: number, telegramId: number): Promise<{ subscribed: boolean, error?: string }> {
	try {
		const member = await bot.telegram.getChatMember(channelId, telegramId)

		if (['member', 'administrator', 'creator'].includes(member.status)) {
			return { subscribed: true }
		} else {
			return { subscribed: false }
		}
	} catch (error) {
		if (error instanceof Error) {
			return {
				subscribed: false,
				error: error.message
			}
		}

		return {
			subscribed: false,
			error: 'Unknown error occurred'
		}
	}
}