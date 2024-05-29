import { Router } from 'express'
import { Post } from '../entities/post'

const postRouter = Router()

postRouter.get('/', async (_request, response) => {

    const posts = await Post.find({ order: { timestamp: 'desc' } })
    response.send(posts)
})

postRouter.post('/', async (request, response) => {

    const address = request.headers['x-address'] as string
    const { content } = request.body

    const post = new Post()
    post.address = address
    post.timestamp = Date.now()
    post.content = content

    try {
        await post.save()
        response.send(post)
    }
    catch (error) {
        response.status(500).send({ message: 'Could not save the post', error })
    }
})

export { postRouter }
