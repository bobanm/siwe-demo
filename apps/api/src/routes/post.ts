import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { desc } from 'drizzle-orm'
import { type ContextTypes, jwtMiddleware } from '../middleware/jwt'
import { db } from '../db/db'
import { post } from '../db/schema'

export const postRouter = new Hono<ContextTypes>()

postRouter.use(jwtMiddleware)

postRouter.get('/', async ctx => {

    const posts = await db.select().from(post).orderBy(desc(post.timestamp))

    return ctx.json(posts)
})

postRouter.post('/', async ctx => {

    // TODO: Add error handling for parsing JSON
    const { content } = await ctx.req.json()

    try {
        const posts = await db.insert(post).values({
            address: ctx.get('jwtPayload').sub,
            content,
        }).returning()

        return ctx.json(posts[0])
    }
    catch (err: any) {
        const errMsg = 'Could not save the post'
        console.error(errMsg, err)

        throw new HTTPException(500, { message: errMsg })
    }
})
