import { Transaction } from 'sequelize'

import { IGetPlayerData, IPlayerFriendsRedis } from '../config/interfaces'
import {
	getPlayerDataFromSQL,
	playersRegistration,
	playerReferralsRegistrationInvite,
	getAllPlayerReferralFromSQL
} from '../sequelize/requests/requestsSQL'
import { sequelize } from '../sequelize/index'
import { getTelegramUserData } from '../telegraf/requestsTelegraf'
import { IS_PREMIUM, NO_PREMIUM } from '../config/const'
import { setDataFromRedis, getDataRedis } from '../redis/requests/requestsRedis'

export async function handlePlayerRetrievalInSQL(telegramId: number, inviteCode: string | null, premium: boolean): Promise<IGetPlayerData> {
	try {
		const playerSQLData = await getPlayerDataFromSQL({ telegramId: telegramId })
		if (playerSQLData) {
			const playerSQLDataReady = {
				attempts: playerSQLData.attempts,
				maximumAttempts: playerSQLData.maximumAttempts,
				lastAddress: playerSQLData.lastAddress,
				compressedWif: playerSQLData.compressedWif,
				uncompressedWif: playerSQLData.uncompressedWif,
				rawPrivateKey: playerSQLData.rawPrivateKey,
				ban: playerSQLData.ban,
				lastGameDate: playerSQLData.lastGameDate,
				gameOver: playerSQLData.gameOver,
				referralCode: playerSQLData.uniqueReferralCode
			}

			await setDataFromRedis(`player:${telegramId}`, playerSQLDataReady)

			return playerSQLDataReady
		}

		// Делаем Регистрацию
		const registrationPlayer = await newPlayerRegistration(telegramId, inviteCode, premium)

		// Сохраняем запись в Redis
		await setDataFromRedis(`player:${telegramId}`, registrationPlayer)

		return registrationPlayer
	} catch (error) {
		throw error
	}
}

async function newPlayerRegistration(telegramId: number, inviteCode: string | null, premium: boolean): Promise<IGetPlayerData> {
	let transaction: Transaction | undefined

	try {
		transaction = await sequelize.transaction()

		// Получаем данные игрока из Telegram
		const telegramUserData = await getTelegramUserData(String(telegramId))
		if (telegramUserData.type !== 'private') throw new Error('Invalid user type')

		const telegramNickname: string | undefined = telegramUserData.username
		const telegramFirstName: string = telegramUserData.first_name

		const newPlayerData = await playersRegistration(telegramId, telegramNickname, telegramFirstName, transaction)

		if (inviteCode) {
			const reward = premium ? IS_PREMIUM : NO_PREMIUM

			// Добавляем запись в таблицу PlayerReferrals
			await playerReferralsRegistrationInvite(telegramId, inviteCode, reward, telegramFirstName, transaction)
		}

		await transaction.commit()

		return {
			attempts: newPlayerData.attempts,
			maximumAttempts: newPlayerData.maximumAttempts,
			lastAddress: newPlayerData.lastAddress,
			compressedWif: newPlayerData.compressedWif,
			uncompressedWif: newPlayerData.uncompressedWif,
			rawPrivateKey: newPlayerData.rawPrivateKey,
			ban: newPlayerData.ban,
			lastGameDate: newPlayerData.lastGameDate,
			gameOver: newPlayerData.gameOver,
			referralCode: newPlayerData.uniqueReferralCode
		}
	} catch (error) {
		if (transaction) await transaction.rollback()

		throw error
	}
}

export async function getPlayerFriendsAndSaveRadis(telegramIdInviter: number, telegramFirstName: string, reward: number, uniqueReferralCode: string): Promise<void> {
	try {
		const listInvitedFriends: IPlayerFriendsRedis = await getDataRedis(`friends:${telegramIdInviter}`)
		if (!listInvitedFriends) {
			const listAllInvited = await getAllPlayerReferralFromSQL(telegramIdInviter)
			if (!listAllInvited) {
				const additionalInvitedPlayer = [{
					name: telegramFirstName,
					invitationDate: new Date(new Date().toISOString()),
					reward: reward
				}]

				const result = {
					referralCode: uniqueReferralCode,
					friends: [ ...additionalInvitedPlayer ]
				}

				await setDataFromRedis(`friends:${telegramIdInviter}`, result)
			} else {
				const formattedResults = listAllInvited.map(allInvited => ({
					name: allInvited.invitedFirstName,
					invitationDate: allInvited.invitationDate,
					reward: allInvited.reward
				}))

				const additionalInvitedPlayer = [{
					name: telegramFirstName,
					invitationDate: new Date(new Date().toISOString()),
					reward: reward
				}]

				const result = {
					referralCode: uniqueReferralCode,
					friends: [...formattedResults, ...additionalInvitedPlayer]
				}

				await setDataFromRedis(`friends:${telegramIdInviter}`, result)
			}
		} else {
			listInvitedFriends.friends.push({
				name: telegramFirstName,
				invitationDate: new Date(new Date().toISOString()),
				reward: reward
			})

			await setDataFromRedis(`friends:${telegramIdInviter}`, listInvitedFriends)
		}
	} catch (error) {
		throw error
	}
}