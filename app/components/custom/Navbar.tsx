"use client"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"
import {  AvatarFallback  } from "@/components/ui/avatar"
import { LogOut, Calendar, Send, MessageSquare } from "lucide-react"

import Link from "next/link"
import { useEffect, useState } from "react"

export default function Appbar(){
  const [loading, setLoading] = useState(true)
  const session  = useSession()
  useEffect(()=>{
    if(session.data?.user){
      console.log(session)
      setLoading(false)
    }
  },[session])

    
  

   
  return(
    //   <header className="bg-white border-b border-gray-200 h-20 px-6 py-3 flex items-center justify-between">
    //     <Link href='/'>
    //       <div className="flex items-center space-x-2">
    //         <span className="font-bold text-xl text-black">Plan Your Day</span>
    //       </div>
    //     </Link>
    //   <div className="flex items-center space-x-4">
    //     {/* <TooltipProvider>
    //       <Tooltip>
    //         <TooltipTrigger asChild>
    //           <Button variant="ghost" size="icon" className="relative">
    //             <Bell className="h-5 w-5" />
    //             <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
    //           </Button>
    //         </TooltipTrigger>
    //         <TooltipContent>
    //           <p>Notifications</p>
    //         </TooltipContent>
    //       </Tooltip>
    //     </TooltipProvider> */}
    //     {loading ? (
    //     <>
    //       <div className="w-10 h-10 rounded-full bg-gray-300 animate-pulse" />
    //       <div className="w-34 h-5 bg-gray-300 rounded animate-pulse" />
    //     </>
    //   ) : (
    //     <DropdownMenu>
    //       <DropdownMenuTrigger asChild>
    //         <Button variant="ghost" className="flex items-center space-x-2">
    //           <Avatar className="h-8 w-8">
    //             <AvatarImage src={session.data?.user?.image ?? "https://media.istockphoto.com/id/2151669184/vector/vector-flat-illustration-in-grayscale-avatar-user-profile-person-icon-gender-neutral.jpg?s=612x612&w=0&k=20&c=UEa7oHoOL30ynvmJzSCIPrwwopJdfqzBs0q69ezQoM8="} alt="" />
                
    //           </Avatar>
    //           <div className="flex flex-col items-start text-sm">
    //             <span className="font-medium">{session.data?.user?.name}</span>
    //           </div>
    //           <ChevronDown className="h-4 w-4" />
    //         </Button>
    //       </DropdownMenuTrigger>
    //       <DropdownMenuContent align="end">
    //         <DropdownMenuItem>Profile</DropdownMenuItem>
    //         <DropdownMenuItem>Settings</DropdownMenuItem>
    //         <DropdownMenuItem onClick={()=>{signOut()}}>Logout</DropdownMenuItem>
    //       </DropdownMenuContent>
    //     </DropdownMenu>
    //   )}
        
    //   </div>
    // </header>








    // new header
     <header className="border-b border-zinc-800 bg-zinc-950 px-6 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-purple-400">Plan Your Day</h1>
          <div className="flex items-center gap-4">
            {session.data?.user?
              <div className="flex items-center gap-4">
                <Avatar className="h-8 w-8 border  border-purple-500/20">
                  <AvatarImage src={session.data?.user?.image ?? "https://media.istockphoto.com/id/2151669184/vector/vector-flat-illustration-in-grayscale-avatar-user-profile-person-icon-gender-neutral.jpg?s=612x612&w=0&k=20&c=UEa7oHoOL30ynvmJzSCIPrwwopJdfqzBs0q69ezQoM8="} alt="" />
                  {/* <AvatarFallback className="bg-purple-900 text-purple-200">UA</AvatarFallback> */}
                </Avatar>
                <span className="font-medium">{session.data?.user?.name}</span>
                <Button onClick={()=>(signOut())} variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            :
              <div className="flex items-center gap-4">
                <Link href={"/login"}>
                  <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                    Log In
                  </Button>
                </Link>
                <Link href={"/signup"}>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">Sign Up Free</Button>
                </Link>
              </div>
            }
          </div>
        </div>
      </header>
    )
}