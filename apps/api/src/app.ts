import { createApp } from './create-app'
import { messageRouter } from './routes/message'
import { signInRouter } from './routes/sign-in'
import { accountRouter } from './routes/account'
import { postRouter } from './routes/post'

const app = createApp()

app.route('/message', messageRouter)
app.route('/sign-in', signInRouter)
app.route('/account', accountRouter)
app.route('/post', postRouter)

export default app
