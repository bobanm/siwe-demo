import { homedir } from 'node:os'
import { join } from 'node:path'

// For development purposes only. Never commit secrets to a repo.
// In production, move the secret to an appropriate secret storage.
export const SECRET = 'banks are broke, fiat is a scam'

export const DB_PATH = join(homedir(), 'siwe.sqlite')
