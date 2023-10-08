import Head from 'next/head'
import type { GetStaticProps } from 'next'
import { api } from '~/utils/api'
import { generateSSGHelpers } from '~/server/helpers/ssg-helpers'
import { PageLayout } from '~/components/layout'
import { PostView } from '~/components/post-view'

type PageProps = {
  id: string
}

const SinglePostPage: React.FC<PageProps> = ({ id }) => {
  const { data } = api.posts.getPostById.useQuery({
    id
  })

  if (!data) return <p>404</p>

  const { post, author } = data

  return (
    <>
      <Head>
        <title>{`@${author.username}: ${post.content}`} | Twine</title>
      </Head>
      <PageLayout>
        <PostView key={post.id} post={post} author={author} />
      </PageLayout>
    </>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = generateSSGHelpers()

  const id = context.params?.id

  if (typeof id !== 'string') {
    throw new Error('URL id is not a string')
  }

  await helpers.posts.getPostById.prefetch({ id })

  return {
    props: {
      trpcState: helpers.dehydrate(),
      id
    }
  }
}

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking'
  }
}

export default SinglePostPage
