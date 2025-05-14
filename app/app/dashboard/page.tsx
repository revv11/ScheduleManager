


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
import Progress from "@/components/custom/Progress"





export default function Home() {
  return (
    <div className="min-h-full bg-zinc-900 text-zinc-100">
      {/* Header */}
     

      {/* Progress Bar */}
      
      <main className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl">
        {/* Today's Schedule */}
        <Progress/>

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
