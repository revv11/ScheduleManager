"use client"

import React, { useEffect, useState } from 'react'

function ClockT() {
  const [time, setTime] = useState<Date | null>(null)

  useEffect(() => {
    setTime(new Date()) // Initial time after mount
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!time) return null // or return a fallback

  return (
    <div>
      <div className="text-xl font-mono text-purple-300">
        {time.toLocaleTimeString()}
      </div>
    </div>
  )
}

export default ClockT
