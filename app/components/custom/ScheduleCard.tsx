import React from 'react'

export default function ScheduleCard() {
  return (
    <div className="relative">
        <div className="text-sm text-gray-500 mb-1">09:00</div>
        <div className="border border-gray-200 rounded-md p-3">
            <h3 className="font-medium">Team Meeting</h3>
            <p className="text-xs text-gray-500">Duration: 1.5h</p>
        </div>
    </div>
  )
}
