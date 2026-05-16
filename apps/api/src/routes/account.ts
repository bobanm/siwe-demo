import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db } from '../db/db'
import { account } from '../db/schema'
import { ContextTypes, jwtMiddleware } from '../middleware/jwt'

export const accountRouter = new Hono<ContextTypes>()

accountRouter.use(jwtMiddleware)

accountRouter.get('/', async ctx => {

    const accounts = await db.select()
        .from(account)
        .where(eq(account.address, ctx.get('jwtPayload').sub))

    return ctx.json(accounts[0] ?? null)
})

accountRouter.post('/', async ctx => {

    const address = ctx.get('jwtPayload').sub
    const { username, bio } = await ctx.req.json()

    const accounts = await db.insert(account)
        .values({ address, username, bio })
        .onConflictDoUpdate({
            target: account.address,
            set: { username, bio },
        })
        .returning()

    return ctx.json(accounts[0])
})
