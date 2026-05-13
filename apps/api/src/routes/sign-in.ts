import { Router } from 'express'
import { SiweMessage } from 'siwe'
import { sign } from 'jsonwebtoken'
import { Account } from '../entities/account'
import { SECRET } from '../config'

const signInRouter = Router()

signInRouter.post('/', async (request, response) => {

    if (!request.body.message || !request.body.signature) {
        response.status(422).send({ error: 'Request must contain 2 mandatory arguments: _message_ and _signature_.' })

        return
    }

    const { message, signature } = request.body
    const siweMessage = new SiweMessage(message)

    try {
        const result = await siweMessage.verify({ signature })

        if (result.success) {
            const account = await Account.findOrCreate(siweMessage.address)
            const accessToken = sign({ address: siweMessage.address }, SECRET, { expiresIn: '1h' })

            response.send({ accessToken, account })
        }
    }
    catch (error) {
        console.error('Error verifying SIWE message:', error)
        response.status(401).send({ error: 'Invalid signature' })
    }
})

export { signInRouter }
