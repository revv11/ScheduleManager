"use client";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import SkeletonWrapper from "./SkeletonWrapper";
import Link from "next/link";

export default function Appbar() {
  const { data: session, status } = useSession();

  // CHANGE: Simplified loading state. Directly use the status from useSession.
  const isLoading = status === "loading";

  return (
    <header className="sticky top-0 z-10 h-16 border-b border-zinc-800 bg-zinc-950 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between">
        <h1 className="text-lg sm:text-xl font-bold text-purple-400">Plan Your Day</h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <SkeletonWrapper
            loading={isLoading}
            skeleton={
              // FIX: Skeleton dimensions now match the real content to prevent layout shifts.
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-800" />
                <div className="hidden sm:block h-6 w-24 animate-pulse rounded bg-zinc-800" />
                <div className="h-10 w-20 sm:w-28 animate-pulse rounded-md bg-zinc-800" />
              </div>
            }
          >
            {status === "authenticated" ? (
              <div className="flex items-center gap-2 sm:gap-4">
                <Avatar className="h-8 w-8 border border-purple-500/20">
                  <AvatarImage
                    src={
                      session.user?.image ??
                      "https://avatar.vercel.sh/placeholder.png"
                    }
                    alt={session.user?.name ?? "User"}
                  />
                </Avatar>
                <span className="hidden sm:inline-block font-medium">{session.user?.name}</span>
                <Button
                  onClick={() => signOut()}
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer"
                >
                  <LogOut className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-4">
                <Link href={"/login"}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer"
                  >
                    Log In
                  </Button>
                </Link>
                <Link href={"/signup"}>
                  <Button size="sm" className="bg-purple-600 text-white hover:bg-purple-700 cursor-pointer">
                    <span className="hidden sm:inline">Sign Up Free</span>
                    <span className="sm:hidden">Sign Up</span>
                  </Button>
                </Link>
              </div>
            )}
          </SkeletonWrapper>
        </div>
      </div>
    </header>
  );
}