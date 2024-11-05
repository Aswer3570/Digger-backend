import { createHash, randomBytes } from 'crypto'
const voucherCodes = require('voucher-code-generator')

// Функция генерирующая реферальный код
export async function referralCodeGenerator(): Promise<string> {
	try {
		const referralCode: string[] = voucherCodes.generate({
			prefix: 'r_'
		})

		return referralCode[0]
	} catch (error) {
		throw error
	}
}

export function generateMD5Hash(): string {
	const randomString = randomBytes(16).toString('hex')

	return createHash('md5').update(randomString).digest('hex')
}

export function toUTC(dateStr: Date): Date {
	const date = new Date(dateStr)

	return new Date(date.getTime())
}