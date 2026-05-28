import { drizzle } from 'drizzle-orm/d1'
import * as schema from './db/schema'
import { setDb } from './db/db'
import { createApp } from './create-app'
import { messageRouter } from './routes/message'
import { signInRouter } from './routes/sign-in'
import { accountRouter } from './routes/account'
import { postRouter } from './routes/post'
import type { Bindings } from './types'

const app = createApp().basePath('/api')

app.route('/message', messageRouter)
app.route('/sign-in', signInRouter)
app.route('/account', accountRouter)
app.route('/post', postRouter)

export default {
    async fetch(request: Request, env: Bindings, ctx: ExecutionContext) {
        // Lazy-init database on the first request, instead of using a middleware
        setDb(drizzle(env.DB, { schema }))

        return app.fetch(request, env, ctx)
    }
}
