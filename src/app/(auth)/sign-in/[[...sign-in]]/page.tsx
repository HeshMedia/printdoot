import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
  <SignIn fallbackRedirectUrl={'/user-dashboard'} />
  </div>
  )
}