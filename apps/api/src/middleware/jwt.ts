import { jwt } from 'hono/jwt'
import { SECRET } from '../config'

interface JwtPayload {
    sub: string
    exp: number
}

export interface ContextTypes {
    Variables: {
        jwtPayload: JwtPayload
    }
}

export const jwtMiddleware = jwt({ secret: SECRET, alg: 'HS256' })
