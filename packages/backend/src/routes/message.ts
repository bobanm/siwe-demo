import { Router } from 'express'
import { SiweMessage } from 'siwe'

const messageRouter = Router()

messageRouter.get('/', (request, response) => {

    if (!request.query.address || !request.query.chainId || !request.query.domain) {
        response.status(422).send('Request must contain 3 mandatory arguments: _address_, _chainId_, and _domain_.')

        return
    }

    const { domain, address, chainId } = request.query
    const decodedDomain = decodeURIComponent(domain as string)

    const siweMessage = new SiweMessage({
        domain: decodedDomain,
        address: decodeURIComponent(address as string),
        statement: 'Sign-In With Ethereum Demo',
        uri: `https://${decodedDomain}`,
        version: '1',
        chainId: Number(decodeURIComponent(chainId as string)),
    })

    response.send(siweMessage.prepareMessage())
})

export { messageRouter }
