import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { SiweMessage } from 'siwe'

export const messageRouter = new Hono()

messageRouter.get('/', ctx => {

    if (!ctx.req.query('address') || !ctx.req.query('chainId') || !ctx.req.query('origin')) {

        throw new HTTPException(422, { message: 'Request must contain 3 mandatory arguments: address, chainId, and origin.' })
    }

    const { origin, address, chainId } = ctx.req.query()
    const decodedOrigin = decodeURIComponent(origin)

    try {
        const siweMessage = new SiweMessage({
            domain: new URL(decodedOrigin).host,
            address: decodeURIComponent(address as string),
            statement: 'Sign-In With Ethereum Demo',
            uri: decodedOrigin,
            version: '1',
            chainId: Number(decodeURIComponent(chainId as string)),
        })

        return ctx.text(siweMessage.prepareMessage())
    }
    catch (err: any) {
        console.error(err)

        throw new HTTPException(422, { message: err.message })
    }
})
