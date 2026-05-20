import { beforeEach, vi } from 'vitest'

const fetchMock = vi.fn()
const consoleErrorMock = vi.fn()

beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockReset()

    vi.spyOn(console, 'error').mockImplementation(consoleErrorMock)
    consoleErrorMock.mockReset()
})
