
"use client"

import axios from "axios"

import { Button } from "@/components/ui/button"
import useSchedule from "@/zustand/useSchedule"
import { Dayjs } from "dayjs"
import dayjs from 'dayjs'
import {
  Clock,
  PauseCircle,
  SkipForward,
  
  CheckCircle2,
} from "lucide-react"
import { useState, useEffect } from "react"



function ProgUpdate() {
  const {tasks, setTasks} = useSchedule()
  const task = tasks[0];
  const [now, setNow] = useState(dayjs());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(dayjs());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function run(){
      if (!task) return;
  
      const start = dayjs(task.startTime);
      const duration = Number(task.duration);
      const end = start.add(duration, "minute");
      console.log("endddd", dayjs(end).format('hh:mm A'))
      console.log("check-------------------------------------------------------------------------------------------------------------------------------",now.isAfter(end))
      if (now.isAfter(end)) {
        setTasks(tasks.slice(1));
        await axios.post('api/clear', {id: tasks[0]?.id})
      }

    }
    run()
  }, [now, task]);

  if (!task) {
    return <div className="text-center text-zinc-400">No tasks remaining.</div>;
  }

  const start = dayjs(task.startTime);
  const duration = Number(task.duration);
  const end = start.add(duration, 'minute');
  const elapsed = Math.max(0, now.diff(start, "minute"));
  const remaining = Math.max(0, end.diff(now, "minute"));
  const percent = Math.min(100, (elapsed / duration) * 100);

  return (
    <div className="">
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-1">Current Task</h3>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-purple-600 text-white p-1.5 rounded-md">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-white">{tasks[0]?.title}</h2>
                    <p className="text-sm text-zinc-400">Start Time: {dayjs(start).format('hh:mm A')}</p>
                  </div>
                </div>

                <div className="w-full bg-zinc-800 rounded-full h-3 mb-2">
                  <div className="bg-purple-600 h-3 rounded-full" style={{ width: `${percent}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>{elapsed} minutes elapsed</span>
                  <span>{remaining} minutes remaining</span>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  >
                    <PauseCircle className="h-4 w-4 mr-1" />
                    Pause
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  >
                    <SkipForward className="h-4 w-4 mr-1" />
                    Skip
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white ml-auto"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Complete
                  </Button>
                </div>
              </div>
            </div>
  )
}

export default ProgUpdate