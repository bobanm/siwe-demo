import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import SignInBox from '../../src/components/SignInBox.vue'
import { BACKEND_URL } from '../../src/config'

const mockWalletClient = {
    requestAddresses: vi.fn().mockResolvedValue(['0x1234567890abcdef']),
    getChainId: vi.fn().mockResolvedValue(1),
    signMessage: vi.fn().mockResolvedValue('0xsignature'),
}

const mockAccount = {
    address: '0x1234567890abcdef',
    username: 'testuser',
    bio: 'test bio',
}

function createGlobal(options: { isSignedIn?: boolean; accessToken?: string; address?: string; username?: string; bio?: string } = {}) {
    return {
        provide: {
            walletClient: mockWalletClient,
            userState: {
                isSignedIn: ref(options.isSignedIn ?? false),
                accessToken: ref(options.accessToken ?? ''),
                address: ref(options.address ?? ''),
                username: ref(options.username ?? ''),
                bio: ref(options.bio ?? ''),
            },
        },
    }
}

beforeEach(() => {
    mockWalletClient.requestAddresses.mockClear().mockResolvedValue(['0x1234567890abcdef'])
    mockWalletClient.getChainId.mockClear().mockResolvedValue(1)
    mockWalletClient.signMessage.mockClear().mockResolvedValue('0xsignature')
})

describe('SignInBox', () => {
    it('shows Sign-In button and no address when not signed in', () => {
        const signInBox = mount(SignInBox, { global: createGlobal() })

        expect(signInBox.find('button').text()).toBe('Sign-In With Ethereum')
        expect(signInBox.find('.start').exists()).toBe(false)
    })

    it('executes the full sign-in flow on successful authentication', async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce({ text: () => Promise.resolve('siwe message') })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ accessToken: 'jwt-token', account: mockAccount }),
            })
        vi.stubGlobal('fetch', fetchMock)

        const global = createGlobal()
        const signInBox = mount(SignInBox, { global })
        await signInBox.find('button').trigger('click')
        await flushPromises()

        expect(mockWalletClient.requestAddresses).toHaveBeenCalled()
        expect(mockWalletClient.getChainId).toHaveBeenCalled()

        const messageUrl = fetchMock.mock.calls[0]![0]
        expect(messageUrl).toContain(`${BACKEND_URL}/message?`)
        expect(messageUrl).toContain('address=')
        expect(messageUrl).toContain('chainId=')
        expect(messageUrl).toContain('origin=')

        expect(mockWalletClient.signMessage).toHaveBeenCalledWith({
            account: '0x1234567890abcdef',
            message: 'siwe message',
        })

        expect(fetchMock).toHaveBeenLastCalledWith(
            `${BACKEND_URL}/sign-in`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'siwe message', signature: '0xsignature' }),
            }
        )

        expect(signInBox.find('button').text()).toBe('Sign Out')
        expect(signInBox.find('.start').text()).toBe('0x1234567890abcdef')
    })

    it('shows error message and does not update state when sign-in fails', async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce({ text: () => Promise.resolve('siwe message') })
            .mockResolvedValueOnce({ ok: false, status: 401 })
        vi.stubGlobal('fetch', fetchMock)

        const global = createGlobal()
        const signInBox = mount(SignInBox, { global })
        await signInBox.find('button').trigger('click')
        await flushPromises()

        expect(signInBox.find('.error').text()).toBe('Sign-in failed. Please try again.')
        expect(signInBox.find('button').text()).toBe('Sign-In With Ethereum')
    })

    it('shows Sign Out button and address when signed in, then resets on click', async () => {
        const global = createGlobal({
            isSignedIn: true,
            accessToken: 'jwt-token',
            address: '0x1234567890abcdef',
            username: 'testuser',
            bio: 'test bio',
        })

        const signInBox = mount(SignInBox, { global })

        expect(signInBox.find('button').text()).toBe('Sign Out')
        expect(signInBox.find('.start').text()).toBe('0x1234567890abcdef')

        await signInBox.find('button').trigger('click')

        expect(signInBox.find('button').text()).toBe('Sign-In With Ethereum')
        expect(signInBox.find('.start').exists()).toBe(false)
    })
})
