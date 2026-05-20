import { describe, expect, it } from 'bun:test'
import { createApp } from '../../../src/create-app'
import { signInRouter } from '../../../src/routes/sign-in'
import { SIWE_MESSAGE, SIWE_SIGNATURE } from '../../helpers'

const testApp = createApp()
testApp.route('/', signInRouter)

describe('POST /sign-in', () => {
    it('returns 422 when message is missing', async () => {
        const res = await testApp.request('/', {
            method: 'POST',
            body: JSON.stringify({ signature: SIWE_SIGNATURE }),
            headers: { 'content-type': 'application/json' },
        })

        expect(res.status).toBe(422)
    })

    it('returns 422 when signature is missing', async () => {
        const res = await testApp.request('/', {
            method: 'POST',
            body: JSON.stringify({ message: SIWE_MESSAGE }),
            headers: { 'content-type': 'application/json' },
        })

        expect(res.status).toBe(422)
    })

    it('returns 401 on invalid signature', async () => {
        const res = await testApp.request('/', {
            method: 'POST',
            body: JSON.stringify({ message: SIWE_MESSAGE, signature: 'bad signature' }),
            headers: { 'content-type': 'application/json' },
        })

        expect(res.status).toBe(401)
    })

    it('returns 200 with JWT and account on valid signature', async () => {
        const res = await testApp.request('/', {
            method: 'POST',
            body: JSON.stringify({ message: SIWE_MESSAGE, signature: SIWE_SIGNATURE }),
            headers: { 'content-type': 'application/json' },
        })
        const body = await res.json() as Record<string, unknown>

        expect(res.status).toBe(200)
        expect(body.accessToken).toBeString()
        expect(body.account).toBeDefined()
    })
})
