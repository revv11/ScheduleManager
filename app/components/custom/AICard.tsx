
import { Clock } from "lucide-react"
function AICard({task}: {task:TaskType}) {
  
  return (
    <div className="border-b border-gray-100 pb-4">
        <div className="flex justify-between items-start mb-1">
            <h3 className="font-medium">{task.title}</h3>
            <div className="flex items-center text-gray-500 text-sm">
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>{task.duration} minutes</span>
            </div>
        </div>
        <p className="text-sm text-gray-600 mb-2">Start Time: {task.startTime}</p>
        <div className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
            <span className="text-xs text-gray-500">{task.priority} Priority</span>
        </div>
    </div>
  )
}

export default AICard