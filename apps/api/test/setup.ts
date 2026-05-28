import { beforeAll, beforeEach } from 'vitest'
import { applyD1Migrations } from 'cloudflare:test'
import { env } from 'cloudflare:workers'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from '../src/db/schema'
import { db, setDb } from '../src/db/db'

console.log = () => {}
console.error = () => {}

beforeAll(async () => {
    await applyD1Migrations(env.DB, (env as any).TEST_MIGRATIONS)
    setDb(drizzle(env.DB, { schema }))
})

beforeEach(async () => {
    await db.delete(schema.post)
    await db.delete(schema.account)
})
