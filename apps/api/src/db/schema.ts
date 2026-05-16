import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const account = sqliteTable('account', {
    address: text().primaryKey(),
    username: text().unique(),
    bio: text(),
})

export const post = sqliteTable('post', {
    id: integer().primaryKey({ autoIncrement: true }),
    address: text().notNull(),
    timestamp: integer().default(sql`(unixepoch())`).notNull(),
    content: text().notNull(),
})
