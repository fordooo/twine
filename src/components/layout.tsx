import type { PropsWithChildren } from 'react'
import { SignInButton, UserButton, useUser } from '@clerk/nextjs'

export const PageLayout = (props: PropsWithChildren) => {
  const { user, isSignedIn } = useUser()

  return (
    <div className="flex h-screen justify-center">
      <div className="flex h-full w-full flex-col border-x border-slate-400 md:max-w-2xl">
        <header className="flex h-16 w-full justify-end gap-4 border-b border-slate-400 p-4">
          {isSignedIn ? (
            <>
              <UserButton />
              {user.fullName}
            </>
          ) : (
            <SignInButton />
          )}
        </header>
        <main className="flex h-full w-full flex-col overflow-y-auto">
          {props.children}
        </main>
      </div>
    </div>
  )
}
