import dotenv from 'dotenv'
import { Sequelize } from 'sequelize'

import { SQL_DB_DIALECT } from '../config/const'
import definePlayers from './models/Players'
import definePlayerReferrals from './models/PlayerReferrals'
import defineTasks from './models/Tasks'
import definePlayerTasks from './models/PlayerTasks'

dotenv.config()

const sequelize = new Sequelize(
	process.env.SQL_DB_NAME as string,
	process.env.SQL_DB_USER as string,
	process.env.SQL_DB_PASSWORD as string,
	{
		dialect: SQL_DB_DIALECT,
		host: process.env.SQL_DB_HOST,
		logging: false,
		...(process.env.NODE_ENV === 'production' && {
			dialectOptions: {
				socketPath: `${process.env.SQL_DB_HOST}/.s.PGSQL.5432`
			}
		})
	}
)

sequelize.authenticate()
	.then(() => {
		console.log('Successful connection to the database')
	})
	.catch((error) => {
		console.error(`Database connection error: ${error}`)
	})

// Инициализация моделей
const Players = definePlayers(sequelize)
const PlayerReferrals = definePlayerReferrals(sequelize)
const Tasks = defineTasks(sequelize)
const PlayerTasks = definePlayerTasks(sequelize)

const db = {
	sequelize,
	Sequelize,
	Players,
	PlayerReferrals,
	Tasks,
	PlayerTasks
}

export default db
export { sequelize }