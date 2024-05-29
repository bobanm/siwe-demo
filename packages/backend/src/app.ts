import express from 'express'
import cors from 'cors'
import 'reflect-metadata'
import { dataSource } from './data-source'

import { messageRouter } from './routes/message'
import { signInRouter } from './routes/sign-in'
import { accountRouter } from './routes/account'
import { postRouter } from './routes/post'

import { verifyToken } from './middleware/verify-token'

import { PORT } from './config'

import type { DataSource } from 'typeorm'
import type { Server } from 'http'

async function start() {

    try {
        await dataSource.initialize()
        console.log('Data Source has been initialized')

        const app = express()
        app.use(express.json())
        app.use(cors())

        app.use('/message', messageRouter)
        app.use('/sign-in', signInRouter)

        // All routes below require authentication
        app.use(verifyToken)
        app.use('/account', accountRouter)
        app.use('/post', postRouter)

        const server = app.listen(PORT, () => {
            console.log(`Listening to HTTP requests on port ${PORT}...`)
        })

        process.on('SIGINT', shutdown(server, dataSource))
        process.on('SIGTERM', shutdown(server, dataSource))
    }
    catch (error) {
        console.error(error)
        process.exit(1)
    }
}

function shutdown(server: Server, dataSource: DataSource) {

    return async () => {
        server.close(async () => {
            console.log('Express server closed.')
            await dataSource.destroy()
            console.log('Database connection closed.')
            process.exit(0)
        })
    }
}

start()
