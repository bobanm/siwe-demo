import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ErrorBox from '../../src/components/ErrorBox.vue'

describe('ErrorBox', () => {
    it('renders the error message, heading, and sloth image', () => {
        const errorBox = mount(ErrorBox)
        const text = errorBox.find('#error').text()

        expect(errorBox.find('h2').text()).toBe('Error')
        expect(text).toContain('Web3 wallet not installed')
        expect(text).toContain('Brave Browser')
        expect(text).toContain('MetaMask')
        expect(errorBox.find('img').attributes('src')).toContain('sloth.svg')
    })
})
