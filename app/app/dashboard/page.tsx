

import AICard from "@/components/custom/AICard"
import ScheduleCard from "@/components/custom/ScheduleCard"
import Prompt from "@/components/custom/Prompt"
import AIRec from "@/components/custom/AIRec"
export default function SchedulerApp() {
  

  return (
    <div className="h-full bg-white">
      {/* Main Content */}
        <div className="grid h-[calc(100vh-80px)] grid-cols-1 md:grid-cols-3 gap-6">
       
          <div className="grid h-[calc(100vh-80px)] border  border-gray-200 rounded-md p-6">
            <div className="">
                <h2 className=" mb-1 text-lg font-bold">Today's Schedule</h2>
                <p className="text-sm text-gray-500 mb-4">Friday, March 28, 2025</p>
            </div>

            <div className="overflow-y-scroll space-y-4">
              <ScheduleCard/>
              <ScheduleCard/>
              <ScheduleCard/>
              <ScheduleCard/>
              <ScheduleCard/>
              <ScheduleCard/>
              <ScheduleCard/>
              <ScheduleCard/>
              <ScheduleCard/>
            </div>

          </div>
          

          {/* AI Recommendations */}
          <AIRec/>
          {/* Today's Schedule */}
          <Prompt/>
        </div>
    </div>
  )
}

