import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import AccountBox from '../../src/components/AccountBox.vue'
import { BACKEND_URL } from '../../src/config'

function createGlobal(options: { isSignedIn: boolean; accessToken?: string; address?: string; username?: string; bio?: string }) {
    return {
        provide: {
            userState: {
                isSignedIn: ref(options.isSignedIn),
                accessToken: ref(options.accessToken ?? ''),
                address: ref(options.address ?? ''),
                username: ref(options.username ?? ''),
                bio: ref(options.bio ?? ''),
            },
        },
    }
}

describe('AccountBox', () => {
    it('disables all inputs and button when not signed in', () => {
        const accountBox = mount(AccountBox, { global: createGlobal({ isSignedIn: false }) })

        expect(accountBox.find('#username').attributes('disabled')).toBeDefined()
        expect(accountBox.find('#bio').attributes('disabled')).toBeDefined()
        expect(accountBox.find('button').attributes('disabled')).toBeDefined()
    })

    it('enables all inputs and button when signed in', () => {
        const accountBox = mount(AccountBox, { global: createGlobal({ isSignedIn: true }) })

        expect(accountBox.find('#username').attributes('disabled')).toBeUndefined()
        expect(accountBox.find('#bio').attributes('disabled')).toBeUndefined()
        expect(accountBox.find('button').attributes('disabled')).toBeUndefined()
    })

    it('sends POST request with correct body and headers when signed in', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ username: 'updated', bio: 'updated bio' }),
        })
        vi.stubGlobal('fetch', fetchMock)

        const accountBox = mount(AccountBox, {
            global: createGlobal({
                isSignedIn: true,
                accessToken: 'test-token',
                username: 'testuser',
                bio: 'test bio',
            }),
        })

        await accountBox.find('button').trigger('click')

        expect(fetchMock).toHaveBeenCalledWith(
            `${BACKEND_URL}/account`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer test-token',
                },
                body: JSON.stringify({
                    username: 'testuser',
                    bio: 'test bio',
                }),
            }
        )
    })

    it('shows error message when update fails', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: false,
            status: 500,
        })
        vi.stubGlobal('fetch', fetchMock)

        const accountBox = mount(AccountBox, {
            global: createGlobal({
                isSignedIn: true,
                accessToken: 'test-token',
                username: 'testuser',
                bio: 'test bio',
            }),
        })

        await accountBox.find('button').trigger('click')

        expect(accountBox.find('.error').text()).toBe('Failed to update account. Please try again.')
    })
})
