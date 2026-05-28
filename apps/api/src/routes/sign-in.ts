import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import { type JWTPayload } from 'hono/utils/jwt/types'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import { verifyMessage, type Hex } from 'viem'
import { parseSiweMessage } from 'viem/siwe'
import { eq } from 'drizzle-orm'
import { db } from '../db/db'
import { account } from '../db/schema'
import { zValidator } from '../middleware/z-validator'
import type { Bindings } from '../types'

const signInSchema = z.object({
    message: z.string(),
    signature: z.string().startsWith('0x'),
})

export const signInRouter = new Hono<{ Bindings: Bindings }>()

signInRouter.post('/', zValidator('json', signInSchema), async ctx => {

    const { message, signature } = ctx.req.valid('json')

    try {
        const address = parseSiweMessage(message).address!

        if (!await verifyMessage({ address, message, signature: signature as Hex })) {

            throw new HTTPException(401, { message: 'Invalid SIWE signature' })
        }

        let accounts = await db.select()
            .from(account)
            .where(eq(account.address, address))

        if (accounts.length === 0) {
            accounts = await db.insert(account)
                .values({ address })
                .returning()
        }

        const claims: JWTPayload = {
            sub: address,
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 2, // The token expires in 2 hours
        }
        const accessToken = await sign(claims, ctx.env.SECRET)

        return ctx.json({ accessToken, account: accounts[0] })
    }
    catch (err) {
        const errMsg = 'Error verifying SIWE message:'
        console.error(errMsg, err)

        throw new HTTPException(401, { message: errMsg })
    }
})
