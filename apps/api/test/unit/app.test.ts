import worker from '../../src/app'
import { createExecutionContext, waitOnExecutionContext } from 'cloudflare:test'
import { env } from 'cloudflare:workers'

describe('Global error handling', () => {
    it('returns 400 on malformed JSON', async () => {
        const request = new Request('http://localhost/api/sign-in', {
            method: 'POST',
            body: 'not-json',
            headers: { 'content-type': 'application/json' },
        })
        const ctx = createExecutionContext()
        const res = await worker.fetch(request, env, ctx)
        await waitOnExecutionContext(ctx)

        expect(res.status).toBe(400)
        expect(await res.json()).toEqual({ error: 'Malformed JSON in request body' })
    })
})
