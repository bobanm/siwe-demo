import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import { type JWTPayload } from 'hono/utils/jwt/types'
import { HTTPException } from 'hono/http-exception'
import { SiweMessage } from 'siwe'
import { eq } from 'drizzle-orm'
import { db } from '../db/db'
import { account } from '../db/schema'
import { SECRET } from '../config'

export const signInRouter = new Hono()

signInRouter.post('/', async ctx => {

    const { message, signature } = await ctx.req.json()

    if (!message || !signature) {

        throw new HTTPException(422, { message: 'Request must contain 2 mandatory arguments: message and signature.' })
    }

    try {
        const siweMessage = new SiweMessage(message)
        // By default, siweMessage.verify will throw if verification fails
        await siweMessage.verify({ signature })

        let accounts = await db.select()
            .from(account)
            .where(eq(account.address, siweMessage.address))

        if (accounts.length === 0) {
            accounts = await db.insert(account)
                .values({ address: siweMessage.address })
                .returning()
        }

        const claims: JWTPayload = {
            sub: siweMessage.address,
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 2, // The token expires in 2 hours
        }
        const accessToken = await sign(claims, SECRET)

        return ctx.json({ accessToken, account: accounts[0] })
    }
    catch (err) {
        const errMsg = 'Error verifying SIWE message:'
        console.error(errMsg, err)

        throw new HTTPException(401, { message: errMsg })
    }
})
