export interface ISocketGetPlayerData {
	telegramId: number
	inviteCode: string | null
	premium: boolean
}

export interface IGetPlayerData {
	attempts: number
	maximumAttempts: number
	lastAddress: string | null
	compressedWif: string | null
	uncompressedWif: string | null
	rawPrivateKey: string | null
	ban: boolean
	lastGameDate: Date | null
	gameOver: boolean
	referralCode: string
}

export interface IPlayerFriendsRedis {
	referralCode: string,
	friends: { name: string, invitationDate: Date, reward: number }[]
}

export interface ISocketPlayerClicked {
	telegramId: number
	attempts: number
	lastAddress: string
	compressedWif: string
	uncompressedWif: string
	rawPrivateKey: string
	lastGameDate: Date
}

export interface IPlayers {
	id: number
	telegramId: number
	attempts: number
	lastGameDate: Date | null
	lastAddress: string
	registrationDate: Date
	uniqueReferralCode: string
	telegramNickname: string | undefined
	telegramFirstName: string
	maximumAttempts: number
	ban: boolean
	compressedWif: string | null
	uncompressedWif: string | null
	rawPrivateKey: string | null
	gameOver: boolean
	referralCode: IGetPlayerData["referralCode"]
}

export interface IPlayersCreate extends Omit<IPlayers, 'id' | 'attempts' | 'lastGameDate' | 'registrationDate' | 'maximumAttempts' | 'ban' | 'compressedWif' | 'uncompressedWif' | 'rawPrivateKey' | 'gameOver' | 'referralCode'> {}

export interface IPlayersUpdate {
	attempts: number
	maximumAttempts: number
	lastAddress: string
	compressedWif: string
	uncompressedWif: string
	rawPrivateKey: string
	lastGameDate: Date
}

export interface IPlayerReferral {
	id: number,
	inviterTelegramId: number,
	invitedTelegramId: number,
	invitationDate: Date
	reward: number
	invitedFirstName: string
}

export interface IPlayerReferralCreate extends Omit<IPlayerReferral, 'id' | 'invitationDate'> {}

export interface ISocketGetFriends {
	telegramId: number
}

export interface ITasks {
	id: number
	title: string
	icon: string
	price: number
	premium: boolean
	url: string | null
	numberExecutions: number
	show?: boolean
	type: 'link' | 'games_streak'
	parameters?: number | null
}

export interface ITaskUpdateData {
	numberExecutions: number
}

export interface IPlayerTasks {
	id: number
	telegramId: number
	taskId: number
	dateCompletion: Date
}

export interface IPlayerTasksCreate extends Omit<IPlayerTasks, 'id' | 'dateCompletion'> {}

export interface ISocketGetCompletedTasks {
	telegramId: number
}

export interface ISocketCheckTask {
	telegramId: number
	taskId: number
	premium: boolean
	actualAttempts: number | null
}