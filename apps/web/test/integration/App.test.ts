import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import App from '../../src/App.vue'

vi.mock('viem', () => ({
    createWalletClient: vi.fn().mockReturnValue({
        getAddresses: vi.fn().mockResolvedValue(['0x1234']),
        getChainId: vi.fn().mockResolvedValue(1),
        signMessage: vi.fn().mockResolvedValue('0xsignature'),
    }),
    custom: vi.fn().mockReturnValue({}),
}))

describe('App', () => {
    beforeEach(() => {
        vi.stubGlobal('ethereum', undefined)
        delete (window as any).ethereum
    })

    it('shows ErrorBox when wallet is not installed', () => {
        const app = mount(App)

        expect(app.find('#error').exists()).toBe(true)
        expect(app.find('#sign-in').exists()).toBe(false)
        expect(app.find('#account').exists()).toBe(false)
        expect(app.find('#feed').exists()).toBe(false)
    })

    it('shows SignInBox and AccountBox but not FeedBox when wallet is installed', () => {
        vi.stubGlobal('ethereum', { request: vi.fn() })
        const app = mount(App)

        expect(app.find('#error').exists()).toBe(false)
        expect(app.find('#sign-in').exists()).toBe(true)
        expect(app.find('#account').exists()).toBe(true)
        expect(app.find('#feed').exists()).toBe(false)
    })

    it('completes the full sign-in and sign-out flow', async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce({ text: () => Promise.resolve('siwe message') })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    accessToken: 'jwt-token',
                    account: { address: '0x1234', username: '', bio: '' },
                }),
            })
            .mockResolvedValue({ ok: true, json: () => Promise.resolve([]) })
        vi.stubGlobal('fetch', fetchMock)

        vi.stubGlobal('ethereum', { request: vi.fn() })
        const app = mount(App)

        // Initial state: wallet installed, not signed in
        expect(app.find('#sign-in').exists()).toBe(true)
        expect(app.find('button').text()).toBe('Sign-In With Ethereum')
        expect(app.find('#feed').exists()).toBe(false)

        // Sign in
        await app.find('button').trigger('click')
        await flushPromises()

        expect(app.find('button').text()).toBe('Sign Out')
        expect(app.find('.start').text()).toBe('0x1234')
        expect(app.find('#feed').exists()).toBe(true)

        // Sign out
        await app.find('button').trigger('click')

        expect(app.find('button').text()).toBe('Sign-In With Ethereum')
        expect(app.find('.start').exists()).toBe(false)
        expect(app.find('#feed').exists()).toBe(false)
    })
})
