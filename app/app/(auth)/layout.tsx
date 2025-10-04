"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname?.startsWith("/login");
  const isSignup = pathname?.startsWith("/signup");
  return (
    <div className="flex min-h-screen">
      {/* Left Section */}
      <div className="hidden w-1/2 bg-gradient-to-b from-indigo-950 to-slate-900 p-10 lg:flex lg:flex-col lg:justify-center">
        <div className="mb-8">
          <div className="h-12 w-12 rounded-lg bg-indigo-500" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white lg:text-5xl">
            {isSignup ? "Create account" : "Welcome back"}
          </h1>
          <p className="mt-4 text-lg text-gray-300">
            {isSignup ? "Join us and start your journey today" : "Sign in to continue"}
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex w-full flex-col justify-center bg-neutral-950 p-6 lg:w-1/2 lg:p-10">
        <div className="mx-auto w-full max-w-md">
          <div className="w-full min-h-[600px] flex flex-col">
            <div className="mb-8 grid w-full grid-cols-2 rounded-lg border border-neutral-800 bg-neutral-900 p-1">
              <button
                type="button"
                onClick={() => {
                  if (!isLogin) router.push("/login");
                }}
                className={`px-4 py-2 text-center rounded-md transition-colors cursor-pointer ${
                  isLogin
                    ? "bg-indigo-600 text-white"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!isSignup) router.push("/signup");
                }}
                className={`px-4 py-2 text-center rounded-md transition-colors cursor-pointer ${
                  isSignup
                    ? "bg-indigo-600 text-white"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
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
