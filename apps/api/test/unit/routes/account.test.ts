import { describe, expect, it } from 'bun:test'
import { createApp } from '../../../src/create-app'
import { generateToken, TEST_ADDRESS } from '../../helpers'

// Dynamic import is required so that mock.module() runs before the module is loaded.
// Static imports are hoisted and evaluated before any top-level code, which would
// cause the module to be cached before mocks are registered.
const { accountRouter } = await import('../../../src/routes/account')
const testApp = createApp()
testApp.route('/', accountRouter)

describe('GET /account', () => {
    it('returns null for an unknown address', async () => {
        const token = await generateToken()
        const res = await testApp.request('/', {
            headers: { authorization: `Bearer ${token}` },
        })
        const body = await res.json()

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
        })
        let body = await createRes.json()

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
        })
        body = await updateRes.json()

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
        })

        const res = await testApp.request('/', {
            headers: { authorization: `Bearer ${token}` },
        })
        const body = await res.json()

        expect(body.address).toBe(TEST_ADDRESS)
        expect(body.username).toBe('bob')
    })
})
