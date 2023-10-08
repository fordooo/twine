import Head from 'next/head'
import Image from 'next/image'
import type { GetStaticProps } from 'next'
import { api } from '~/utils/api'
import { generateSSGHelpers } from '~/server/helpers/ssg-helpers'
import { PageLayout } from '~/components/layout'
import { LoadingSpinner } from '~/components/loading'
import { PostView } from '~/components/post-view'

type PageProps = {
  username: string
}

const ProfileFeed = (props: { userId: string }) => {
  const { data: posts, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size={40} />
      </div>
    )
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-2xl">No posts yet</p>
      </div>
    )
  }

  return (
    <>
      {posts?.map(({ post, author }) => (
        <PostView key={post.id} post={post} author={author} />
      ))}
    </>
  )
}

const ProfilePage: React.FC<PageProps> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({
    username
  })

  if (!data) return <p>404</p>

  return (
    <>
      <Head>
        <title>{`@${data.username}'s Profile`} | Twine</title>
      </Head>
      <PageLayout>
        <div className="relative h-36 bg-slate-600">
          <Image
            src={data.imageUrl}
            alt={`${data.username ?? 'User'}'s profile picture`}
            width={128}
            height={128}
            className="absolute bottom-0 left-0 -mb-16 ml-4 rounded-full border-4 border-black bg-black"
          />
        </div>
        <div className="h-16"></div>
        <div className="border-b border-slate-400 p-4 text-2xl font-bold">{`@${data.username}`}</div>
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = generateSSGHelpers()

  const slug = context.params?.slug

  if (typeof slug !== 'string') {
    throw new Error('URL slug is not a string')
  }

  const username = slug.replace('@', '')

  await helpers.profile.getUserByUsername.prefetch({ username })

  return {
    props: {
      trpcState: helpers.dehydrate(),
      username
    }
  }
}

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking'
  }
}

export default ProfilePage
