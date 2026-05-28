import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import { createSiweMessage, generateSiweNonce } from 'viem/siwe'
import type { Hex } from 'viem'
import { zValidator } from '../middleware/z-validator'

const messageSchema = z.object({
    address: z.string().startsWith('0x'),
    chainId: z.string(),
    origin: z.string(),
})

export const messageRouter = new Hono()

messageRouter.get('/', zValidator('query', messageSchema), ctx => {

    const { origin, address, chainId } = ctx.req.valid('query')
    const decodedOrigin = decodeURIComponent(origin)

    try {
        const siweMessage = createSiweMessage({
            domain: new URL(decodedOrigin).host,
            address: decodeURIComponent(address) as Hex,
            statement: 'Sign-In With Ethereum Demo',
            uri: decodedOrigin,
            version: '1',
            chainId: Number(decodeURIComponent(chainId)),
            nonce: generateSiweNonce(),
        })

        return ctx.text(siweMessage)
    }
    catch (err: any) {
        console.error(err)

        throw new HTTPException(422, { message: err.message })
    }
})
