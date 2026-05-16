import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { messageRouter } from './routes/message'
import { signInRouter } from './routes/sign-in'
import { accountRouter } from './routes/account'
import { postRouter } from './routes/post'

const app = new Hono()
app.use(logger())
app.use(cors())

app.route('/message', messageRouter)
app.route('/sign-in', signInRouter)
app.route('/account', accountRouter)
app.route('/post', postRouter)

export default app
