"use client"
import React, { useEffect } from 'react'
import AICard from './AICard'
import useSchedule from '@/zustand/useSchedule'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Clock, Calendar, Send, MessageSquare } from "lucide-react"



function PriorityBadge({ priority }:any) {
  const colors:any = {
    high: "bg-red-900/30 text-red-400 border-red-800",
    medium: "bg-amber-900/30 text-amber-400 border-amber-800",
    low: "bg-green-900/30 text-green-400 border-green-800",
  }

  return (
    <Badge variant="outline" className={`${colors[priority]} border`}>
      {priority} priority
    </Badge>
  )
}


function AIRec() {
    const {tasks} = useSchedule()
    
    return (
        // <div className="border overflow-y-scroll border-gray-200 rounded-md p-6">
        //             <h2 className="text-lg font-bold mb-4">AI Recommendations</h2>

        //             <div className="space-y-4">
        //             {tasks.map((task, _id)=>(
        //                 <div key={_id}>
        //                     <AICard task={task}/>
        //                 </div>
        //             ))}
                    
        //             </div>
        //         </div>
        <Card className="bg-zinc-950 border-zinc-800 md:col-span-1">
          <CardHeader className="border-b border-zinc-800 pb-3">
            <CardTitle className="text-lg font-semibold text-white">AI Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-220px)]">
              {tasks.map((item, index) => (
                <div key={index} className="p-4 border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-white">{item.name}</h3>
                    <div className="flex items-center text-zinc-400">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="text-sm">{item.duration} minutes</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-zinc-400">Start Time: {item.startTime}</div>
                    <PriorityBadge priority={item.priority} />
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
    )
}

export default AIRec