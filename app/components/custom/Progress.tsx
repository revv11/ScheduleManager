import React from 'react'
import { Clock } from 'lucide-react'




function Progress() {
  return (
    <div className="bg-zinc-950 border-b border-zinc-800 px-6 py-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="bg-purple-600 text-white p-1.5 rounded-md">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-white">Dev Project Work</h2>
                  <p className="text-sm text-zinc-400">11:15 - 13:15</p>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="w-full bg-zinc-800 rounded-full h-3 mb-2">
                <div className="bg-purple-600 h-3 rounded-full" style={{ width: "45%" }}></div>
              </div>
              <div className="flex justify-between text-xs text-zinc-400">
                <span>45 minutes elapsed</span>
                <span>75 minutes remaining</span>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 justify-end">
                <div className="text-right">
                  <p className="text-sm text-zinc-400">Up Next</p>
                  <h3 className="text-base font-medium text-white">Lunch Break</h3>
                </div>
                <div className="bg-zinc-800 text-zinc-300 p-1.5 rounded-md">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

  )
}

export default Progress