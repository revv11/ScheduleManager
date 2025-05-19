"use client"
import React, { useState } from 'react'

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import dayjs from 'dayjs'
import {

  Bell,
  BarChart3,
  Settings,
  Download,
  
} from "lucide-react"

import ClockT from './Clock'
import ProgUpdate from './ProgUpdate'

function Progress() {


  return (
    <Card className="bg-zinc-950  border-zinc-800 md:col-span-1">
          <CardHeader className="border-b border-zinc-800 pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="text-lg font-semibold text-white">Current Progress</span>
              <div>
                <ClockT/>
              </div>
              
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-col h-[calc(100vh-220px)]">
            <ScrollArea  className="flex-1 p-4 h-[calc(100vh-300px)]">

            {/* Current Task */}
            <ProgUpdate/>

            {/* Next Task */}
            

            {/* Quick Actions */}
            {/* <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-400 uppercase m-0 mt-4 mb-1 tracking-wider">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white justify-start"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
                <Button
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white justify-start"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Statistics
                </Button>
                <Button
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white justify-start"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white justify-start"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div> */}

            {/* Daily Summary */}
            {/* <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-400 uppercase m-0 mt-4 mb-1 tracking-wider">Daily Summary</h3>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-2 bg-zinc-800 rounded-md">
                    <p className="text-xs text-zinc-400">Tasks Completed</p>
                    <p className="text-xl font-semibold text-purple-400">2/8</p>
                  </div>
                  <div className="text-center p-2 bg-zinc-800 rounded-md">
                    <p className="text-xs text-zinc-400">Focus Time</p>
                    <p className="text-xl font-semibold text-purple-400">2h 15m</p>
                  </div>
                  <div className="text-center p-2 bg-zinc-800 rounded-md">
                    <p className="text-xs text-zinc-400">Break Time</p>
                    <p className="text-xl font-semibold text-purple-400">30m</p>
                  </div>
                  <div className="text-center p-2 bg-zinc-800 rounded-md">
                    <p className="text-xs text-zinc-400">Remaining</p>
                    <p className="text-xl font-semibold text-purple-400">5h 15m</p>
                  </div>
                </div>
              </div>
            </div> */}
            </ScrollArea>
          </CardContent>
        </Card>

  )
}

export default Progress