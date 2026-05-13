import { Router } from 'express'
import { SiweMessage } from 'siwe'

const messageRouter = Router()

messageRouter.get('/', (request, response) => {

    if (!request.query.address || !request.query.chainId || !request.query.origin) {
        response.status(422).send('Request must contain 3 mandatory arguments: _address_, _chainId_, and _origin_.')

        return
    }

    const { origin, address, chainId } = request.query
    const decodedOrigin = decodeURIComponent(origin as string)

    try {
        const siweMessage = new SiweMessage({
            domain: new URL(decodedOrigin).host,
            address: decodeURIComponent(address as string),
            statement: 'Sign-In With Ethereum Demo',
            uri: decodedOrigin,
            version: '1',
            chainId: Number(decodeURIComponent(chainId as string)),
        })

        response.send(siweMessage.prepareMessage())
    }
    catch (err: any) {
        console.error(err)
        response.status(422).send(err.message)
    }
})

export { messageRouter }
