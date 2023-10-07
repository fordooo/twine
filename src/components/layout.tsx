import type { PropsWithChildren } from 'react'
import { SignInButton, UserButton, useUser } from '@clerk/nextjs'
import Link from 'next/link'

export const PageLayout = (props: PropsWithChildren) => {
  const { user, isSignedIn } = useUser()

  return (
    <div className="flex h-screen justify-center">
      <div className="flex h-full w-full flex-col border-x border-slate-400 md:max-w-2xl">
        <header className="flex h-16 w-full items-center justify-between border-b border-slate-400 p-4">
          <Link href="/" title="Home" aria-label="Home">
            <p>LOGO</p>
          </Link>
          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <>
                <UserButton />
                {user.fullName}
              </>
            ) : (
              <SignInButton />
            )}
          </div>
        </header>
        <main className="flex h-full w-full flex-col overflow-y-auto">
          {props.children}
        </main>
      </div>
    </div>
  )
}
