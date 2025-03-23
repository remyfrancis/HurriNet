import LoginForm from './login-form'
import Image from 'next/image'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Hero section */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative items-center justify-center">
        <div className="absolute inset-0 bg-black/20 z-10" /> {/* Overlay for better text visibility */}
        <Image
          src="/hurricane-hero.png"
          alt="Hurricane preparedness"
          fill
          className="object-cover"
          priority
        />
        <div className="relative z-20 text-white p-8 text-center">
          <div className="mb-6">
            <Image
              src="/hurrinet_logo.png"
              alt="HurriNet Logo"
              width={200}
              height={200}
              className="mx-auto"
            />
          </div>
          <h1 className="text-4xl font-bold mb-4">Welcome to HurriNet</h1>
          <p className="text-xl">Your comprehensive emergency management system</p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <LoginForm />
      </div>
    </div>
  )
}

