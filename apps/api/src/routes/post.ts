import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { ContextTypes, jwtMiddleware } from '../middleware/jwt'
import { Post } from '../entities/post'

export const postRouter = new Hono<ContextTypes>()

postRouter.use(jwtMiddleware)

postRouter.get('/', async ctx => {

    const posts = await Post.find({ order: { timestamp: 'desc' } })

    return ctx.json(posts)
})

postRouter.post('/', async ctx => {

    // TODO: Add error handling for parsing JSON
    const { content } = await ctx.req.json()

    const post = new Post()
    post.address = ctx.get('jwtPayload').sub
    post.timestamp = Date.now()
    post.content = content

    try {
        await post.save()

        return ctx.json(post)
    }
    catch (err: any) {
        console.error(err.message)

        throw new HTTPException(500, { message: 'Could not save the post' })
    }
})
