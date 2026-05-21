import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import { type JWTPayload } from 'hono/utils/jwt/types'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import { SiweMessage } from 'siwe'
import { eq } from 'drizzle-orm'
import { db } from '../db/db'
import { account } from '../db/schema'
import { zValidator } from '../middleware/z-validator'
import { SECRET } from '../config'

const signInSchema = z.object({
    message: z.string(),
    signature: z.string(),
})

export const signInRouter = new Hono()

signInRouter.post('/', zValidator('json', signInSchema), async ctx => {

    const { message, signature } = ctx.req.valid('json')

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
