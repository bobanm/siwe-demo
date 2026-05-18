import { describe, expect, it } from 'bun:test'
import { createApp } from '../../../src/create-app'
import { messageRouter } from '../../../src/routes/message'
import { TEST_ADDRESS } from '../../helpers'

const testApp = createApp()
testApp.route('/', messageRouter)

describe('GET /message', () => {
    it('returns 422 when address is missing', async () => {
        const res = await testApp.request('/?chainId=1&origin=http%3A%2F%2Flocalhost%3A5173')

        expect(res.status).toBe(422)
    })

    it('returns 422 when chainId is missing', async () => {
        const res = await testApp.request(`/?address=${TEST_ADDRESS}&origin=http%3A%2F%2Flocalhost%3A5173`)

        expect(res.status).toBe(422)
    })

    it('returns 422 when origin is missing', async () => {
        const res = await testApp.request(`/?address=${TEST_ADDRESS}&chainId=1`)

        expect(res.status).toBe(422)
    })

    it('returns 200 with SIWE message for valid params', async () => {
        const res = await testApp.request(`/?address=${TEST_ADDRESS}&chainId=1&origin=http%3A%2F%2Flocalhost%3A5173`)
        const text = await res.text()

        expect(res.status).toBe(200)
        expect(text).toContain('Sign-In With Ethereum Demo')
        expect(text).toContain(TEST_ADDRESS)
        expect(text).toContain('localhost')
    })

    it('returns 422 for malformed origin', async () => {
        const res = await testApp.request('/?address=0x123&chainId=1&origin=not-a-url')

        expect(res.status).toBe(422)
    })
})
