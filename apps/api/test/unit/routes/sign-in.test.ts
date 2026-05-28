import { createApp } from '../../../src/create-app'
import { signInRouter } from '../../../src/routes/sign-in'
import { SIWE_MESSAGE, SIWE_SIGNATURE } from '../../helpers'
import { env } from 'cloudflare:workers'

const testApp = createApp()
testApp.route('/', signInRouter)

describe('POST /sign-in', () => {
    it('returns 422 when message is missing', async () => {
        const res = await testApp.request('/', {
            method: 'POST',
            body: JSON.stringify({ signature: SIWE_SIGNATURE }),
            headers: { 'content-type': 'application/json' },
        }, env)

        expect(res.status).toBe(422)
    })

    it('returns 422 when signature is missing', async () => {
        const res = await testApp.request('/', {
            method: 'POST',
            body: JSON.stringify({ message: SIWE_MESSAGE }),
            headers: { 'content-type': 'application/json' },
        }, env)

        expect(res.status).toBe(422)
    })

    it('returns 401 on invalid signature', async () => {
        const res = await testApp.request('/', {
            method: 'POST',
            body: JSON.stringify({ message: SIWE_MESSAGE, signature: '0x-bad-signature' }),
            headers: { 'content-type': 'application/json' },
        }, env)

        expect(res.status).toBe(401)
    })

    it('returns 200 with JWT and account on valid signature', async () => {
        const res = await testApp.request('/', {
            method: 'POST',
            body: JSON.stringify({ message: SIWE_MESSAGE, signature: SIWE_SIGNATURE }),
            headers: { 'content-type': 'application/json' },
        }, env)
        const body = await res.json() as Record<string, unknown>

        expect(res.status).toBe(200)
        expect(body.accessToken).toBeTypeOf('string')
        expect(body.account).toBeDefined()
    })
})
