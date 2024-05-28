import { Router } from 'express'
import { Account } from '../entities/account'

const accountRouter = Router()

accountRouter.get('/', async (request, response) => {

    const account = await Account.findOneBy({ address: request.headers['x-address'] as string })
    response.send(account)
})

accountRouter.post('/', async (request, response) => {

    const address = request.headers['x-address'] as string
    const { username, bio } = request.body

    const account = await Account.findOrCreate(address)
    account.username = username
    account.bio = bio
    await account.save()
    response.send(account)
})

export { accountRouter }
