import { drizzle } from 'drizzle-orm/bun-sqlite'
import * as schema from './schema'
import { DB_PATH } from '../config'

export const db = drizzle(DB_PATH, { schema })
