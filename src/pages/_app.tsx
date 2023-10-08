import Head from 'next/head'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'react-hot-toast'
import { type AppType } from 'next/app'
import { api } from '~/utils/api'
import '~/styles/globals.css'

const MyApp: AppType = ({ Component, pageProps }) => {
  // TODO: Add og tags, descriptions, etc
  return (
    <ClerkProvider {...pageProps}>
      <Head>
        <title>Twine</title>
        <meta name="description" content="Share with the world" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#363636',
            color: '#fff'
          }
        }}
      />
      <Component {...pageProps} />
    </ClerkProvider>
  )
}

export default api.withTRPC(MyApp)
