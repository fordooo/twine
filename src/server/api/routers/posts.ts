import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { clerkClient } from '@clerk/nextjs/server'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure
} from '~/server/api/trpc'
import { filterUserForClient } from '~/server/helpers/filter-user-for-client'
import type { Post } from '@prisma/client'

// Create a new ratelimiter that allows 3 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, '1 m'),
  analytics: true
})

const addUserDataToPosts = async (posts: Post[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100
    })
  ).map(filterUserForClient)

  return posts.map((post) => {
    const author = users.find((user) => user.id === post.authorId)

    if (!author?.username) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Author not found for post'
      })
    }

    return {
      post,
      author: {
        ...author,
        username: author.username
      }
    }
  })
}

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(
    async ({ ctx }) =>
      await ctx.db.post
        .findMany({
          // TODO: setup pagination for infinite scroll
          take: 100,
          orderBy: {
            createdAt: 'desc'
          }
        })
        .then(addUserDataToPosts)
  ),
  getPostById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({
        where: {
          id: input.id
        }
      })

      if (!post) throw new TRPCError({ code: 'NOT_FOUND' })

      return (await addUserDataToPosts([post]))[0]
    }),
  getPostsByUserId: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) =>
      ctx.db.post
        .findMany({
          where: {
            authorId: input.userId
          },
          take: 100,
          orderBy: {
            createdAt: 'desc'
          }
        })
        .then(addUserDataToPosts)
    ),
  create: privateProcedure
    .input(
      z.object({
        content: z.string().emoji('Only emojis are allowed').min(1).max(280)
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId
      const { success } = await ratelimit.limit(authorId)

      if (!success) {
        throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })
      }

      const post = await ctx.db.post.create({
        data: {
          content: input.content,
          authorId
        }
      })

      return post
    })
})
