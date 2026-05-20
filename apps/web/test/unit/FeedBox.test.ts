import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import FeedBox from '../../src/components/FeedBox.vue'
import { BACKEND_URL } from '../../src/config'

const mockPosts = [
    { address: '0xabc', timestamp: 1700000000, content: 'First post' },
    { address: '0xdef', timestamp: 1700000100, content: 'Second post' },
]

function makeFetchMock(postResponse: any, getResponse: any = mockPosts) {

    return vi.fn().mockImplementation((url: string, options: any) => {
        if (options?.method === 'POST') {

            return Promise.resolve(postResponse)
        }

        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([...getResponse]),
        })
    })
}

describe('FeedBox', () => {
    describe('New Post button', () => {
        it('is disabled when content is empty', () => {
            const feedBox = mount(FeedBox)

            expect(feedBox.find('button').attributes('disabled')).toBeDefined()
        })

        it('is enabled when content has text', async () => {
            const feedBox = mount(FeedBox)
            await feedBox.find('textarea').setValue('Hello world')

            expect(feedBox.find('button').attributes('disabled')).toBeUndefined()
        })
    })

    describe('submitPost', () => {
        it('sends POST request with correct body and headers', async () => {
            const newPost = { address: '0x123', timestamp: 1700000200, content: 'New post' }
            const fetchMock = makeFetchMock({
                ok: true,
                json: () => Promise.resolve(newPost),
            })
            vi.stubGlobal('fetch', fetchMock)

            const feedBox = mount(FeedBox, { props: { accessToken: 'test-token' }})
            await feedBox.find('textarea').setValue('New post')
            await feedBox.find('button').trigger('click')

            expect(fetchMock).toHaveBeenCalledWith(
                `${BACKEND_URL}/post`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer test-token',
                    },
                    body: JSON.stringify({ content: 'New post' }),
                }
            )
        })

        it('prepends new post to the posts list on success', async () => {
            const newPost = { address: '0x123', timestamp: 1700000200, content: 'New post' }
            const fetchMock = makeFetchMock(
                { ok: true, json: () => Promise.resolve(newPost) },
                [],
            )
            vi.stubGlobal('fetch', fetchMock)

            const feedBox = mount(FeedBox, { props: { accessToken: 'test-token' }})
            await feedBox.find('textarea').setValue('New post')
            await feedBox.find('button').trigger('click')
            await flushPromises()
            const posts = (feedBox.vm as any).posts

            expect(posts).toHaveLength(1)
            expect(posts[0]).toEqual(newPost)
        })

        it('shows error message when post submission fails', async () => {
            const fetchMock = makeFetchMock({ ok: false, status: 500 })
            vi.stubGlobal('fetch', fetchMock)
            const feedBox = mount(FeedBox, { props: { accessToken: 'test-token' }})
            await feedBox.find('textarea').setValue('New post')
            await feedBox.find('button').trigger('click')
            await flushPromises()

            expect(feedBox.find('.error').text()).toBe('Failed to create post. Please try again.')
        })
    })

    describe('fetchPosts', () => {
        it('fetches and renders posts on mount when accessToken exists', async () => {
            const fetchMock = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockPosts),
            })
            vi.stubGlobal('fetch', fetchMock)

            const feedBox = mount(FeedBox, { props: { accessToken: 'test-token' }})
            await flushPromises()
            const renderedPosts = feedBox.findAll('.post')

            expect(fetchMock).toHaveBeenCalledWith(
                `${BACKEND_URL}/post`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer test-token',
                    },
                }
            )

            expect(renderedPosts).toHaveLength(2)
            expect(feedBox.text()).toContain('0xabc')
            expect(feedBox.text()).toContain('First post')
            expect(feedBox.text()).toContain('Second post')
        })

        it('does not fetch posts on mount when no accessToken', async () => {
            const fetchMock = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockPosts),
            })
            vi.stubGlobal('fetch', fetchMock)
            mount(FeedBox)
            await flushPromises()

            expect(fetchMock).not.toHaveBeenCalled()
        })

        it('shows error message when fetch fails', async () => {
            const fetchMock = vi.fn().mockResolvedValue({
                ok: false,
                status: 500,
            })
            vi.stubGlobal('fetch', fetchMock)
            const feedBox = mount(FeedBox, { props: { accessToken: 'test-token' }})
            await flushPromises()

            expect(feedBox.find('.error').text()).toBe('Failed to fetch posts.')
        })
    })
})
