import { Hono } from 'hono'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../db/db'
import { account } from '../db/schema'
import { zValidator } from '../middleware/z-validator'
import { type ContextTypes, jwtMiddleware } from '../middleware/jwt'

const accountSchema = z.object({
    username: z.string().max(50).optional().nullable(),
    bio: z.string().max(500).optional().nullable(),
})

export const accountRouter = new Hono<ContextTypes>()

accountRouter.use(jwtMiddleware)

accountRouter.get('/', async ctx => {

    const accounts = await db.select()
        .from(account)
        .where(eq(account.address, ctx.get('jwtPayload').sub))

    return ctx.json(accounts[0] ?? null)
})

accountRouter.post('/', zValidator('json', accountSchema), async ctx => {

    const address = ctx.get('jwtPayload').sub
    const { username, bio } = ctx.req.valid('json')

    const accounts = await db.insert(account)
        .values({ address, username, bio })
        .onConflictDoUpdate({
            target: account.address,
            set: { username, bio },
        })
        .returning()

    return ctx.json(accounts[0])
})
