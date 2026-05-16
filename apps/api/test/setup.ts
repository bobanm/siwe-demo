import { mock, beforeEach } from 'bun:test'
import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import { join } from 'path'
import * as schema from '../src/db/schema'

// Suppress app console output during tests
console.log = () => {}
console.error = () => {}

// Single shared in-memory DB for all tests
const sqlite = new Database(':memory:')
export const testDb = drizzle({ client: sqlite, schema })
migrate(testDb, { migrationsFolder: join(import.meta.dir, '../drizzle') })

// Install the db mock once -- all test files share the same instance
mock.module('../src/db/db', () => ({ db: testDb }))

// Truncate all tables before each test for isolation
beforeEach(async () => {
    await testDb.delete(schema.post)
    await testDb.delete(schema.account)
})

// Make testDb available globally so test files don't need to import setup.ts
;(globalThis as any).testDb = testDb
