import { describe, expect, it } from 'bun:test'
import app from '../../src/app'
import { SIWE_MESSAGE, SIWE_SIGNATURE } from '../helpers'

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
        const { accessToken } = await signInRes.json() as { accessToken: string }
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
        const account = await getAccountRes.json() as { username: string; bio: string }

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
        const posts = await getPostsRes.json() as { content: string }[]

        expect(posts).toHaveLength(1)
        expect(posts[0]!.content).toBe('Full flow post')
    })
})
