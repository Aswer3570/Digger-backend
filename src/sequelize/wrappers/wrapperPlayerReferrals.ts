import { CreateOptions, FindOptions } from 'sequelize'

import db from '..'
import { IPlayerReferralCreate } from '../../config/interfaces'

const PlayerReferrals = db.PlayerReferrals

export default class wrapperPlayerReferrals {	
	async create(data: IPlayerReferralCreate, options?: CreateOptions) {
		try {
			return await PlayerReferrals.create(data, options)
		} catch (error) {
			throw error
		}
	}

	async findAllWithUserReferrals(options: FindOptions) {
		try {
			const playersReferrals = await PlayerReferrals.findAll({
				...options
			})
			
			return playersReferrals
		} catch (error) {
			throw error
		}
	}
}