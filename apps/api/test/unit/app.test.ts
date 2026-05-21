import { describe, expect, it } from 'bun:test'
import app from '../../src/app'

describe('Global error handling', () => {
    it('returns 400 on malformed JSON', async () => {
        const res = await app.request('/sign-in', {
            method: 'POST',
            body: 'not-json',
            headers: { 'content-type': 'application/json' },
        })

        expect(res.status).toBe(400)
        expect(await res.json()).toEqual({ error: 'Malformed JSON in request body' })
    })
})
