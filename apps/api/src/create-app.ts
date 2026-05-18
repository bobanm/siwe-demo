import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { HTTPException } from 'hono/http-exception'

export function createApp() {
    const app = new Hono()

    app.use(logger())
    app.use(cors())

    app.onError((err, ctx) => {
        console.error(err)

        if (err instanceof HTTPException) {

            return ctx.json({ error: err.message }, err.status)
        }

        if (err instanceof SyntaxError && err.message.includes('JSON Parse error')) {

            return ctx.json({ error: 'Could not parse JSON.' }, 422)
        }

        return ctx.json({ error: 'Internal Server Error' }, 500)
    })

    return app
}
