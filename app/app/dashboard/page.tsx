


import ScheduleCard from "@/components/custom/ScheduleCard"
import Prompt from "@/components/custom/Prompt"
import AIRec from "@/components/custom/AIRec"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Clock, Calendar, Send, MessageSquare } from "lucide-react"






export default function Home() {
  return (
    <div className="min-h-full bg-zinc-900 text-zinc-100">
      {/* Header */}
     

      {/* Progress Bar */}
      
      <main className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl">
        {/* Today's Schedule */}
        <Card className="bg-zinc-950 border-zinc-800 md:col-span-1">
          <CardHeader className="border-b border-zinc-800 pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="text-lg font-semibold text-white">Today's Schedule</span>
              <span className="text-sm font-normal text-zinc-400">Friday, March 28, 2025</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-220px)]">
              {scheduleItems.map((item, index) => (
                <div key={index} className="p-4 border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-white">{item.title}</h3>
                    <span className="text-sm text-zinc-400">{item.time}</span>
                  </div>
                  <div className="text-sm text-zinc-400">Duration: {item.duration}</div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <AIRec/>

        {/* Chat Interface */}
        <Prompt/>
      </main>
    </div>
  )
}

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

const scheduleItems = [
  { title: "Team Meeting", time: "09:00", duration: "1.5h" },
  { title: "Team Meeting", time: "09:00", duration: "1.5h" },
  { title: "Team Meeting", time: "09:00", duration: "1.5h" },
  { title: "Team Meeting", time: "09:00", duration: "1.5h" },
  { title: "Team Meeting", time: "09:00", duration: "1.5h" },
  { title: "Team Meeting", time: "09:00", duration: "1.5h" },
  { title: "Team Meeting", time: "09:00", duration: "1.5h" },
]

const recommendations = [
  { title: "DSA Practice", startTime: "09:00", duration: 120, priority: "high" },
  { title: "Short Break", startTime: "11:00", duration: 15, priority: "low" },
  { title: "Dev Project Work", startTime: "11:15", duration: 120, priority: "medium" },
  { title: "Lunch Break", startTime: "13:15", duration: 45, priority: "low" },
  { title: "Data Science Learning", startTime: "14:00", duration: 120, priority: "medium" },
  { title: "Short Break", startTime: "16:00", duration: 15, priority: "low" },
  { title: "DSA Revision/Practice", startTime: "16:15", duration: 90, priority: "high" },
  { title: "Free Time/Relax", startTime: "17:45", duration: 120, priority: "low" },
]

const chatMessages = [
  {
    sender: "ai",
    text: "Hi I'm an AI scheduling assistant. How can I help you?",
  },
  {
    sender: "user",
    text: "make a schedule for me for a full day. i need to study for my placements starting in 3 months. i need to study dsa, make dev projects and also learn data science",
  },
  {
    sender: "ai",
    text: "This schedule balances DSA, development projects, and data science learning. It includes breaks and free time to prevent burnout. Adjust durations based on your progress and energy levels.",
  },
]
