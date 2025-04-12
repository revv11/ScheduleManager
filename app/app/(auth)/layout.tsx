"use client"

import { usePathname } from "next/navigation"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname()
  console.log(pathname)
    return (

    <div className="flex min-h-screen">
      {/* Left Section */}
      <div className="hidden w-1/2 bg-gradient-to-b from-[#1a1c4b] to-[#232664] p-10 lg:flex lg:flex-col lg:justify-center">
        <div className="mb-8">
          <div className="h-12 w-12 rounded-lg bg-[#6366F1]" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white lg:text-5xl">Create account</h1>
          <p className="mt-4 text-lg text-gray-400">Join us and start your journey today</p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex w-full flex-col justify-center p-6 lg:w-1/2 lg:p-10">
        <div className="mx-auto w-full max-w-md">
          <div className="w-full">
            <div className="mb-8 grid w-full grid-cols-2">
              <button
                className="px-4 cursor-pointer py-2 text-center"
                onClick={() => window.location.href = '/login'}
              >
                Sign In
              </button>
              <button
                className="px-4 cursor-pointer py-2 text-center"
                onClick={() => window.location.href = '/signup'}
              >
                Sign Up
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
   
  );
}
