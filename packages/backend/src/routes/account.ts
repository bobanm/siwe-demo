import { Router } from 'express'
import { Account } from '../entities/account'

const accountRouter = Router()

accountRouter.get('/', async (request, response) => {

    const account = await Account.findOneBy({ address: request.query.address as string })
    response.send(account)
})

accountRouter.post('/', async (request, response) => {

    if (!request.body.address) {
        response.status(422).send({ error: 'Request must contain 1 mandatory argument: _address_.' })

        return
    }

    // TODO: validate that the address provided in the request corresponds to the address in the session

    const { address, username, bio } = request.body

    const account = await Account.findOrCreate(address)
    account.username = username
    account.bio = bio
    await account.save()
    response.send(account)
})

export { accountRouter }
