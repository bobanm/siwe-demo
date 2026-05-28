import { jwt } from 'hono/jwt'
import type { MiddlewareHandler } from 'hono'
import type { Bindings } from '../types'

interface JwtPayload {
    sub: string
    exp: number
}

export interface ContextTypes {
    Bindings: Bindings
    Variables: {
        jwtPayload: JwtPayload
    }
}

export const jwtMiddleware: MiddlewareHandler<ContextTypes> = async (c, next) => {
    const middleware = jwt({
        secret: c.env.SECRET,
        alg: 'HS256',
    })
    return middleware(c, next)
}
