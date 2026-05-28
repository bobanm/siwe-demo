import { createApp } from '../../../src/create-app'
import { accountRouter } from '../../../src/routes/account'
import { generateToken, TEST_ADDRESS } from '../../helpers'
import { env } from 'cloudflare:workers'

const testApp = createApp()
testApp.route('/', accountRouter)

describe('GET /account', () => {
    it('returns null for an unknown address', async () => {
        const token = await generateToken()
        const res = await testApp.request('/', {
            headers: { authorization: `Bearer ${token}` },
        }, env)
        const body = await res.json() as Record<string, unknown> | null

        expect(res.status).toBe(200)
        expect(body).toBeNull()
    })
})

describe('POST /account', () => {
    it('creates and updates account', async () => {
        const token = await generateToken()

        const createRes = await testApp.request('/', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ username: 'alice', bio: 'Hello' }),
        }, env)
        let body = await createRes.json() as Record<string, unknown>

        expect(createRes.status).toBe(200)
        expect(body.username).toBe('alice')
        expect(body.bio).toBe('Hello')

        const updateRes = await testApp.request('/', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ username: 'alice2', bio: 'Updated' }),
        }, env)
        body = await updateRes.json() as Record<string, unknown>

        expect(body.username).toBe('alice2')
        expect(body.bio).toBe('Updated')
    })

    it('returns account after creation', async () => {
        const token = await generateToken(TEST_ADDRESS)

        await testApp.request('/', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ username: 'bob', bio: 'Bio' }),
        }, env)

        const res = await testApp.request('/', {
            headers: { authorization: `Bearer ${token}` },
        }, env)
        const body = await res.json() as Record<string, unknown>

        expect(body.address).toBe(TEST_ADDRESS)
        expect(body.username).toBe('bob')
    })
})
