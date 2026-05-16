import { describe, expect, it } from 'bun:test'
import { SIWE_MESSAGE, SIWE_SIGNATURE } from '../helpers'

// Dynamic import is required so that mock.module() runs before the module is loaded.
// Static imports are hoisted and evaluated before any top-level code, which would
// cause the module to be cached before mocks are registered.
const app = (await import('../../src/app')).default

describe('Full flow: sign-in > get account > update > create post > list posts', () => {
    it('completes full flow', async () => {
        // 1. Sign in
        const signInRes = await app.request('/sign-in', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ message: SIWE_MESSAGE, signature: SIWE_SIGNATURE }),
        })

        expect(signInRes.status).toBe(200)

        // 2. Update account
        const { accessToken } = await signInRes.json()
        const updateAccountRes = await app.request('/account', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ username: 'fullflow', bio: 'Integration test' }),
        })

        expect(updateAccountRes.status).toBe(200)

        // 3. Get account details
        const getAccountRes = await app.request('/account', {
            headers: { authorization: `Bearer ${accessToken}` },
        })
        const account = await getAccountRes.json()

        expect(account.username).toBe('fullflow')
        expect(account.bio).toBe('Integration test')

        // 4. Submit a post
        const submitPostRes = await app.request('/post', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ content: 'Full flow post' }),
        })

        expect(submitPostRes.status).toBe(200)

        // 5. Get all posts
        const getPostsRes = await app.request('/post', {
            headers: { authorization: `Bearer ${accessToken}` },
        })
        const posts = await getPostsRes.json()

        expect(posts).toHaveLength(1)
        expect(posts[0].content).toBe('Full flow post')
    })
})
