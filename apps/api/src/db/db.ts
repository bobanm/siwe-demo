import { homedir } from 'node:os'
import { join } from 'node:path'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import * as schema from './schema'

const dbPath = join(homedir(), 'siwe', 'siwe.sqlite')
export const db = drizzle(dbPath, { schema })
