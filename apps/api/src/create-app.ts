import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'

export function createApp() {

    const app = new Hono()

    app.use(cors())

    app.onError((err, ctx) => {
        console.error(err)

        if (err instanceof HTTPException) {

            return ctx.json({ error: err.message }, err.status)
        }

        return ctx.json({ error: 'Internal Server Error' }, 500)
    })

    return app
}
