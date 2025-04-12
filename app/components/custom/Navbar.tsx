"use client"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"
import {
    Bell,
    ChevronDown,
  } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"
import { useEffect, useState } from "react"
export default function Appbar(){
  const [loading, setLoading] = useState(true)
  const session  = useSession()
  useEffect(()=>{
    if(session){
      console.log(session)
      setLoading(false)
    }
  },[session])

    
  

   
  return(
      <header className="bg-white border-b border-gray-200 h-20 px-6 py-3 flex items-center justify-between">
        <Link href='/'>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xl text-black">Plan Your Day</span>
          </div>
        </Link>
      <div className="flex items-center space-x-4">
        {/* <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Notifications</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider> */}
        {loading ? (
        <>
          <div className="w-10 h-10 rounded-full bg-gray-300 animate-pulse" />
          <div className="w-34 h-5 bg-gray-300 rounded animate-pulse" />
        </>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session.data?.user?.image ?? ""} alt="" />
                
              </Avatar>
              <div className="flex flex-col items-start text-sm">
                <span className="font-medium">{session.data?.user?.name}</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={()=>{signOut()}}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
        
      </div>
    </header>
    )
}