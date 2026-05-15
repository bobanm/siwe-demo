import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import { JWTPayload } from 'hono/utils/jwt/types'
import { HTTPException } from 'hono/http-exception'
import { SiweMessage } from 'siwe'
import { Account } from '../entities/account'
import { SECRET } from '../config'

export const signInRouter = new Hono()

signInRouter.post('/', async ctx => {

    let message = '', signature = ''

    try {
        ({ message, signature } = await ctx.req.json())
    }
    catch (err: any) {
        // Gracefully handle malformed JSON
        // TODO: Move this to a shared util function
        if (err instanceof SyntaxError) {

            throw new HTTPException(422, { message: err.message })
        }
    }

    if (!message || !signature) {

        throw new HTTPException(422, { message: 'Request must contain 2 mandatory arguments: message and signature.' })
    }

    try {
        const siweMessage = new SiweMessage(message)
        const result = await siweMessage.verify({ signature })

        if (result.success) {
            const account = await Account.findOrCreate(siweMessage.address)

            const claims: JWTPayload = {
                sub: siweMessage.address,
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 2, // The token expires in 2 hours
            }
            const accessToken = await sign(claims, SECRET)

            return ctx.json({ accessToken, account })
        }
    }
    catch (err) {
        console.error('Error verifying SIWE message:', err)

        throw new HTTPException(401, { message: 'Invalid signature' })
    }
})
