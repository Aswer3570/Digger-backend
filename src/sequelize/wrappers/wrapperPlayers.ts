import { FindOptions, CreateOptions, UpdateOptions } from 'sequelize'

import db from '..'
import { IPlayersCreate } from '../../config/interfaces'

const Players = db.Players

export default class wrapperPlayers {
	async findOne(id: FindOptions) {
		try {
			return await Players.findOne(id)
		} catch (error) {
			throw error
		}
	}

	async create(data: IPlayersCreate, options?: CreateOptions) {
		try {
			return await Players.create(data, options)
		} catch (error) {
			throw error
		}
	}

	async update(values: object, options: UpdateOptions) {
		try {
			return await Players.update(values, options)
		} catch (error) {
			throw error
		}
	}
}