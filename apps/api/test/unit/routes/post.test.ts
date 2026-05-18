import { describe, expect, it } from 'bun:test'
import { createApp } from '../../../src/create-app'
import { postRouter } from '../../../src/routes/post'
import { generateToken, TEST_ADDRESS } from '../../helpers'
import { testDb } from '../../setup'
import * as schema from '../../../src/db/schema'

const testApp = createApp()
testApp.route('/', postRouter)

describe('POST /post', () => {
    it('creates a post with valid JWT', async () => {
        await testDb.insert(schema.account).values({ address: TEST_ADDRESS })
        const token = await generateToken()

        const res = await testApp.request('/', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content: 'Hello world' }),
        })
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body.content).toBe('Hello world')
        expect(body.address).toBe(TEST_ADDRESS)
        expect(body.id).toBeNumber()
        expect(body.timestamp).toBeNumber()
    })
})
