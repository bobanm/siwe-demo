import type { DrizzleD1Database } from 'drizzle-orm/d1'
import type * as schema from './schema'

export let db: DrizzleD1Database<typeof schema>

export function setDb(instance: DrizzleD1Database<typeof schema>) {

    db ??= instance
}
