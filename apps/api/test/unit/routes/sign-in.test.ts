import { describe, expect, it } from 'bun:test'
import { SIWE_MESSAGE, SIWE_SIGNATURE } from '../../helpers'

// Dynamic import is required so that mock.module() runs before the module is loaded.
// Static imports are hoisted and evaluated before any top-level code, which would
// cause the module to be cached before mocks are registered.
const { signInRouter } = await import('../../../src/routes/sign-in')

describe('POST /sign-in', () => {
    it('returns 422 when message is missing', async () => {
        const res = await signInRouter.request('/', {
            method: 'POST',
            body: JSON.stringify({ signature: SIWE_SIGNATURE }),
            headers: { 'content-type': 'application/json' },
        })

        expect(res.status).toBe(422)
    })

    it('returns 422 when signature is missing', async () => {
        const res = await signInRouter.request('/', {
            method: 'POST',
            body: JSON.stringify({ message: SIWE_MESSAGE }),
            headers: { 'content-type': 'application/json' },
        })

        expect(res.status).toBe(422)
    })

    it('returns 422 on malformed JSON', async () => {
        const res = await signInRouter.request('/', {
            method: 'POST',
            body: 'not-json',
            headers: { 'content-type': 'application/json' },
        })

        expect(res.status).toBe(422)
    })

    it('returns 401 on invalid signature', async () => {
        const res = await signInRouter.request('/', {
            method: 'POST',
            body: JSON.stringify({ message: SIWE_MESSAGE, signature: 'bad signature' }),
            headers: { 'content-type': 'application/json' },
        })

        expect(res.status).toBe(401)
    })

    it('returns 200 with JWT and account on valid signature', async () => {
        const res = await signInRouter.request('/', {
            method: 'POST',
            body: JSON.stringify({ message: SIWE_MESSAGE, signature: SIWE_SIGNATURE }),
            headers: { 'content-type': 'application/json' },
        })
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body.accessToken).toBeString()
        expect(body.account).toBeDefined()
    })
})
