import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

export function createApp() {
    const app = new Hono()

    app.use(logger())
    app.use(cors())

    return app
}
