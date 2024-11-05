import { getAllPlayerReferralFromSQL, getPlayerDataFromSQL } from '../sequelize/requests/requestsSQL'
import { IPlayerFriendsRedis, IPlayers } from '../config/interfaces'
import { getDataRedis, setDataFromRedis } from '../redis/requests/requestsRedis'
import { GET_FRIENDS_LIST_ERROR } from '../config/const'

export async function getFriendsList(telegramId: number): Promise<IPlayerFriendsRedis> {
	try {
		let playerData: IPlayers |null

		// Получаем игрока
		playerData = await getDataRedis(`player:${telegramId}`)
		if (!playerData) {
			playerData = await getPlayerDataFromSQL({ telegramId: telegramId })
			if (!playerData) throw new Error(GET_FRIENDS_LIST_ERROR)
		}

		const referralCode = playerData.referralCode ? playerData.referralCode : playerData.uniqueReferralCode

		const listAllInvited = await getAllPlayerReferralFromSQL(telegramId)
		if (!listAllInvited) {
			return {
				referralCode: referralCode,
				friends: []
			}
		}

		const formattedResults = listAllInvited.map(allInvited => ({
			name: allInvited.invitedFirstName,
			invitationDate: allInvited.invitationDate,
			reward: allInvited.reward
		}))

		const result = {
			referralCode: referralCode,
			friends: [ ...formattedResults ]
		}

		await setDataFromRedis(`friends:${telegramId}`, result)

		return result
	} catch (error) {
		throw error
	}
}