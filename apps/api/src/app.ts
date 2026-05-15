import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import 'reflect-metadata'
import { dataSource } from './data-source'

import { messageRouter } from './routes/message'
import { signInRouter } from './routes/sign-in'
import { accountRouter } from './routes/account'
import { postRouter } from './routes/post'

import type { DataSource } from 'typeorm'

await dataSource.initialize()
console.log('Data Source has been initialized')

const app = new Hono()
app.use(logger())
app.use(cors())

app.route('/message', messageRouter)
app.route('/sign-in', signInRouter)

app.route('/account', accountRouter)
app.route('/post', postRouter)

process.on('SIGINT', shutdown(dataSource))
process.on('SIGTERM', shutdown(dataSource))

function shutdown(dataSource: DataSource) {

    return async () => {
        await dataSource.destroy()
        console.log('Database connection closed.')

        process.exit(0)
    }
}

export default app
