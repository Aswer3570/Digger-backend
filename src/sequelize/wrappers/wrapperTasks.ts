import { UpdateOptions } from 'sequelize'

import db from '..'

const Tasks = db.Tasks

export default class wrapperTasks {
	async findAll() {
		try {
			return await Tasks.findAll()
		} catch (error) {
			throw error
		}
	}

	async update(values: object, options: UpdateOptions) {
		try {
			return await Tasks.update(values, options)
		} catch (error) {
			throw error
		}
	}
}