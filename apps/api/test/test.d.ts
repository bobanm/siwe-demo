import { testDb } from './setup'

declare global {
    const testDb: typeof testDb
}

export {}
