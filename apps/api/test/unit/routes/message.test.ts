import { createApp } from '../../../src/create-app'
import { messageRouter } from '../../../src/routes/message'
import { TEST_ADDRESS as address } from '../../helpers'

const testApp = createApp()
testApp.route('/', messageRouter)

function buildUrl(params: Record<string, string>) {

    return `/?${new URLSearchParams(params)}`
}

const chainId = '1'
const origin = 'http://localhost:5173'

describe('GET /message', () => {
    it('returns 422 when address is missing', async () => {
        const res = await testApp.request(buildUrl({ chainId, origin }))
        const body = await res.json() as Record<string, unknown>

        expect(res.status).toBe(422)
        expect(body.error).toContain('[address]')
    })

    it('returns 422 when chainId is missing', async () => {
        const res = await testApp.request(buildUrl({ address, origin }))
        const body = await res.json() as Record<string, unknown>

        expect(res.status).toBe(422)
        expect(body.error).toContain('[chainId]')
    })

    it('returns 422 when origin is missing', async () => {
        const res = await testApp.request(buildUrl({ address, chainId }))
        const body = await res.json() as Record<string, unknown>

        expect(res.status).toBe(422)
        expect(body.error).toContain('[origin]')
    })

    it('returns 200 with SIWE message for valid params', async () => {
        const res = await testApp.request(buildUrl({ address, chainId, origin }))
        const text = await res.text()

        expect(res.status).toBe(200)
        expect(text).toContain('Sign-In With Ethereum Demo')
        expect(text).toContain(address)
        expect(text).toContain('localhost')
    })

    it('returns 422 for malformed origin', async () => {
        const res = await testApp.request(buildUrl({ address, chainId, origin: 'not-a-url' }))
        const body = await res.json() as Record<string, unknown>

        expect(res.status).toBe(422)
        expect(body.error).toBe('Invalid URL string.')
    })
})
