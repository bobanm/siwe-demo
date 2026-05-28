import worker from '../../src/app'
import { createExecutionContext, waitOnExecutionContext } from 'cloudflare:test'
import { env } from 'cloudflare:workers'
import { SIWE_MESSAGE, SIWE_SIGNATURE } from '../helpers'

describe('Full flow: sign-in > get account > update > create post > list posts', () => {
    it('completes full flow', async () => {
        // Helper to make requests through the Worker
        const fetch = async (path: string, init?: RequestInit) => {
            const request = new Request(`http://localhost${path}`, init)
            const ctx = createExecutionContext()
            const response = await worker.fetch(request, env, ctx)
            await waitOnExecutionContext(ctx)

            return response
        }

        // 1. Sign in
        const signInRes = await fetch('/api/sign-in', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ message: SIWE_MESSAGE, signature: SIWE_SIGNATURE }),
        })

        expect(signInRes.status).toBe(200)

        // 2. Update account
        const { accessToken } = await signInRes.json() as { accessToken: string }
        const updateAccountRes = await fetch('/api/account', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ username: 'fullflow', bio: 'Integration test' }),
        })

        expect(updateAccountRes.status).toBe(200)

        // 3. Get account details
        const getAccountRes = await fetch('/api/account', {
            headers: { authorization: `Bearer ${accessToken}` },
        })
        const account = await getAccountRes.json() as { username: string; bio: string }

        expect(account.username).toBe('fullflow')
        expect(account.bio).toBe('Integration test')

        // 4. Submit a post
        const submitPostRes = await fetch('/api/post', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ content: 'Full flow post' }),
        })

        expect(submitPostRes.status).toBe(200)

        // 5. Get all posts
        const getPostsRes = await fetch('/api/post', {
            headers: { authorization: `Bearer ${accessToken}` },
        })
        const posts = await getPostsRes.json() as { content: string }[]

        expect(posts).toHaveLength(1)
        expect(posts[0]!.content).toBe('Full flow post')
    })
})
