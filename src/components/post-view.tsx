import Image from 'next/image'
import Link from 'next/link'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import type { RouterOutputs } from '~/utils/api'

dayjs.extend(relativeTime)

type PostsWithUser = RouterOutputs['posts']['getAll'][number]

export const PostView = (props: PostsWithUser) => {
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
