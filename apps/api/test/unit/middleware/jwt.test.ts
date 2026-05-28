import { Hono } from 'hono'
import { jwt, sign } from 'hono/jwt'
import { env } from 'cloudflare:workers'

const jwtMiddleware = jwt({ secret: env.SECRET, alg: 'HS256' })

const testApp = new Hono()
testApp.use('/protected', jwtMiddleware)
testApp.get('/protected', ctx => ctx.text('ok'))

describe('JWT middleware', () => {
    it('rejects requests without token', async () => {
        const res = await testApp.request('/protected')

        expect(res.status).toBe(401)
    })

    it('rejects requests with invalid token', async () => {
        const res = await testApp.request('/protected', {
            headers: { authorization: 'Bearer invalid-token' },
        })

        expect(res.status).toBe(401)
    })

    it('accepts requests with valid token', async () => {
        const token = await sign({ sub: '0xabc', exp: Math.floor(Date.now() / 1000) + 3600 }, env.SECRET)
        const res = await testApp.request('/protected', {
            headers: { authorization: `Bearer ${token}` },
        })

        expect(res.status).toBe(200)
    })

    it('rejects requests with expired token', async () => {
        const token = await sign({ sub: '0xabc', exp: Math.floor(Date.now() / 1000) - 3600 }, env.SECRET)
        const res = await testApp.request('/protected', {
            headers: { authorization: `Bearer ${token}` },
        })

        expect(res.status).toBe(401)
    })
})
