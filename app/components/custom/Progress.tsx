"use client"
import React from 'react'


import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import {
  Clock,
  PauseCircle,
  SkipForward,
  Bell,
  BarChart3,
  Settings,
  Download,
  CheckCircle2,
} from "lucide-react"

import ClockT from './Clock'

function Progress() {
  return (
    <Card className="bg-zinc-950 border-zinc-800 md:col-span-1">
          <CardHeader className="border-b border-zinc-800 pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="text-lg font-semibold text-white">Current Progress</span>
              <div>
                <ClockT/>
              </div>
              
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-6">
            {/* Current Task */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Current Task</h3>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-purple-600 text-white p-1.5 rounded-md">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-white">Dev Project Work</h2>
                    <p className="text-sm text-zinc-400">11:15 - 13:15</p>
                  </div>
                </div>

                <div className="w-full bg-zinc-800 rounded-full h-3 mb-2">
                  <div className="bg-purple-600 h-3 rounded-full" style={{ width: "45%" }}></div>
                </div>
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>45 minutes elapsed</span>
                  <span>75 minutes remaining</span>
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

            {/* Next Task */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Up Next</h3>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-zinc-800 text-zinc-300 p-1.5 rounded-md">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-white">Lunch Break</h3>
                    <p className="text-sm text-zinc-400">13:15 - 14:00 (45 min)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Quick Actions</h3>
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
            </div>

            {/* Daily Summary */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Daily Summary</h3>
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
            </div>
          </CardContent>
        </Card>

  )
}

export default Progress