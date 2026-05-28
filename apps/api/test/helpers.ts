import { sign } from 'hono/jwt'
import { env } from 'cloudflare:workers'

export const TEST_ADDRESS = '0x1234567890123456789012345678901234567890'

export const SIWE_MESSAGE =
`localhost:5173 wants you to sign in with your Ethereum account:
0xbAda55F41430bFd3b535f38f01d1aDb767fc28C8

Sign-In With Ethereum Demo

URI: http://localhost:5173
Version: 1
Chain ID: 1
Nonce: KEVglkmYxJAnW8HwB
Issued At: 2026-05-16T21:00:41.225Z`

export const SIWE_SIGNATURE = '0xf7e6dac6db24d5ca4250ae5c37b891570f4c998a71baa004d6397e0d38253cab08fd5e161b0d2797cb8ffb544889db42f072dc84906c91bd8a577d9d43a1df721b'

export async function generateToken(address = TEST_ADDRESS): Promise<string> {

    const claims = {
        sub: address,
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
    }

    return sign(claims, env.SECRET)
}
