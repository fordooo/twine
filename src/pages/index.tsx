import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import toast from 'react-hot-toast'
import { api } from '~/utils/api'
import type { RouterOutputs } from '~/utils/api'
import { PageLayout } from '~/components/layout'
import { LoadingSpinner } from '~/components/loading'

dayjs.extend(relativeTime)

const CreatePostWizard = () => {
  const { user } = useUser()
  const [input, setInput] = useState('')
  const ctx = api.useContext()

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput('')
      void ctx.posts.getAll.invalidate()
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content
      if (!!errorMessage?.[0]) {
        toast.error(errorMessage[0])
      } else {
        toast.error('Failed to post! Please try again later.')
      }
    }
  })

  if (!user) return null

  // TODO: refactor to use react-hook-form
  return (
    <div className="flex h-24 w-full items-center gap-4 border-b border-slate-400 p-4">
      <Image
        src={user.imageUrl}
        alt={`@${user.username}'s profile picture`}
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
      />
      <input
        type="text"
        placeholder="Type something"
        className="grow bg-transparent outline-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            if (input !== '') {
              mutate({ content: input })
            }
          }
        }}
        disabled={isPosting}
      />
      {input !== '' && !isPosting && (
        <button
          onClick={() => mutate({ content: input })}
          disabled={isPosting}
          className="cursor-pointer"
        >
          Post
        </button>
      )}
      {isPosting && <LoadingSpinner size={32} />}
    </div>
  )
}

type PostsWithUser = RouterOutputs['posts']['getAll'][number]

const PostView = (props: PostsWithUser) => {
  const { post, author } = props

  return (
    <div className="flex items-center gap-4 border-b border-slate-400 p-4">
      <Link href={`/@${author.username}`}>
        <Image
          src={author.imageUrl}
          alt={`@${author.username}'s profile picture`}
          className="h-14 w-14 rounded-full"
          width={56}
          height={56}
        />
      </Link>
      <div className="flex flex-col">
        <div className="flex items-center gap-1 text-slate-300">
          <Link href={`/@${author.username}`}>
            <span>{`@${author.username}`}</span>
          </Link>
          <span>·</span>
          <Link href={`/post/${post.id}`}>
            <span
              className="mt-0.5 text-sm font-light leading-normal"
              title={dayjs(post.createdAt).format('h:mm A · MMM D, YYYY')}
            >
              {dayjs(post.createdAt).fromNow()}
            </span>
          </Link>
        </div>
        <span className="text-2xl">{post.content}</span>
      </div>
    </div>
  )
}

const Feed = () => {
  const { data: posts, isLoading } = api.posts.getAll.useQuery()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size={40} />
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

export default function Home() {
  const { isSignedIn } = useUser()

  // Start fetching posts ASAP
  api.posts.getAll.useQuery()

  return (
    <PageLayout>
      {isSignedIn && <CreatePostWizard />}
      <Feed />
    </PageLayout>
  )
}
