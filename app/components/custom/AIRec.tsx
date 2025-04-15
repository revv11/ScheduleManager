"use client"
import React, { useEffect } from 'react'
import AICard from './AICard'
import useSchedule from '@/zustand/useSchedule'

function AIRec() {
    const {tasks} = useSchedule()
    
    return (
        <div className="border overflow-y-scroll border-gray-200 rounded-md p-6">
                    <h2 className="text-lg font-bold mb-4">AI Recommendations</h2>

                    <div className="space-y-4">
                    {tasks.map((task, _id)=>(
                        <div key={_id}>
                            <AICard task={task}/>

                        </div>
                    ))}
                    
                    </div>
                </div>
    )
}

export default AIRec