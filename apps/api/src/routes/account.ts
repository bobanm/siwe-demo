import { Hono } from 'hono'
import { Account } from '../entities/account'
import { ContextTypes, jwtMiddleware } from '../middleware/jwt'

export const accountRouter = new Hono<ContextTypes>()

accountRouter.use(jwtMiddleware)

accountRouter.get('/', async ctx => {

    const account = await Account.findOneBy({ address: ctx.get('jwtPayload').sub })

    return ctx.json(account)
})

accountRouter.post('/', async ctx => {

    const account = await Account.findOrCreate(ctx.get('jwtPayload').sub)
    const { username, bio } = await ctx.req.json()

    account.username = username
    account.bio = bio
    await account.save()

    return ctx.json(account)
})
