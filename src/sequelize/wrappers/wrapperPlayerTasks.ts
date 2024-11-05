import { FindOptions, CreateOptions } from 'sequelize'

import db from '..'
import { IPlayerTasksCreate } from '../../config/interfaces'

const PlayerTasks = db.PlayerTasks

export default class wrapperPlayerTasks {
	async findAllWithPlayerTasks(options: FindOptions) {
		try {
			const playerTasks = await PlayerTasks.findAll({
				...options
			})
			
			return playerTasks
		} catch (error) {
			throw error
		}
	}

	async create(data: IPlayerTasksCreate, options?: CreateOptions) {
		try {
			return await PlayerTasks.create(data, options)
		} catch (error) {
			throw error
		}
	}
}