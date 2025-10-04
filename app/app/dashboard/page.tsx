"use client"
import Prompt from "@/components/custom/Prompt";
import AIRec from "@/components/custom/AIRec";
import Progress from "@/components/custom/Progress";
import SkeletonWrapper from "@/components/custom/SkeletonWrapper";
import useSchedule from "@/zustand/useSchedule";
import { useEffect } from "react";

export default function Home() {
  const {taskLoading, setTaskLoading,taskError, msgError, fetchTasks, fetchMessages} = useSchedule()
  useEffect(()=>{
    fetchTasks()
    fetchMessages()
  },[fetchTasks, fetchMessages])
  
  return (
    <div className="min-h-full bg-zinc-900 text-zinc-100">
      <main className="container py-5 mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl ">
        {/* Today's Schedule */}
        <SkeletonWrapper
          loading={taskLoading}
          error={taskError}
          skeleton={
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg h-[calc(100vh-180px)]]">
              <div className="border-b border-zinc-800 p-4">
                <div className="h-6 w-32 bg-zinc-800 rounded animate-pulse" />
              </div>
              <div className="p-4 space-y-4">
                <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
                <div className="h-8 w-full bg-zinc-800 rounded animate-pulse" />
                <div className="h-8 w-3/4 bg-zinc-800 rounded animate-pulse" />
                <div className="h-8 w-5/6 bg-zinc-800 rounded animate-pulse" />
              </div>
            </div>
          }
        >
          <Progress />
        </SkeletonWrapper>

        {/* AI Recommendations */}
        <SkeletonWrapper
          loading={taskLoading}
          error={taskError}
          skeleton={
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg h-[calc(100vh-170px)]">
              <div className="border-b border-zinc-800 p-4">
                <div className="h-6 w-40 bg-zinc-800 rounded animate-pulse" />
              </div>
              <div className="p-4 space-y-3">
                <div className="border-b border-zinc-800/50 p-3">
                  <div className="h-5 w-3/4 bg-zinc-800 rounded animate-pulse mb-2" />
                  <div className="h-4 w-1/2 bg-zinc-800 rounded animate-pulse" />
                </div>
                <div className="border-b border-zinc-800/50 p-3">
                  <div className="h-5 w-2/3 bg-zinc-800 rounded animate-pulse mb-2" />
                  <div className="h-4 w-1/3 bg-zinc-800 rounded animate-pulse" />
                </div>
                <div className="border-b border-zinc-800/50 p-3">
                  <div className="h-5 w-4/5 bg-zinc-800 rounded animate-pulse mb-2" />
                  <div className="h-4 w-2/5 bg-zinc-800 rounded animate-pulse" />
                </div>
              </div>
            </div>
          }
        >
          <AIRec />
        </SkeletonWrapper>

        {/* Chat Interface */}
        <SkeletonWrapper
          loading={taskLoading}
          error={msgError}
          skeleton={
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg h-[calc(100vh-200px)]">
              <div className="border-b border-zinc-800 p-4">
                <div className="h-6 w-32 bg-zinc-800 rounded animate-pulse" />
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-start">
                  <div className="h-8 w-8 bg-zinc-800 rounded-full animate-pulse mr-2" />
                  <div className="h-16 w-3/4 bg-zinc-800 rounded-lg animate-pulse" />
                </div>
                <div className="flex justify-end">
                  <div className="h-16 w-2/3 bg-zinc-800 rounded-lg animate-pulse mr-2" />
                  <div className="h-8 w-8 bg-zinc-800 rounded-full animate-pulse" />
                </div>
                <div className="flex justify-start">
                  <div className="h-8 w-8 bg-zinc-800 rounded-full animate-pulse mr-2" />
                  <div className="h-12 w-1/2 bg-zinc-800 rounded-lg animate-pulse" />
                </div>
              </div>
              <div className="border-t border-zinc-800 p-4">
                <div className="flex gap-2">
                  <div className="h-10 flex-1 bg-zinc-800 rounded animate-pulse" />
                  <div className="h-10 w-10 bg-zinc-800 rounded animate-pulse" />
                </div>
              </div>
            </div>
          }
        >
          <Prompt />
        </SkeletonWrapper>
      </main>
    </div>
  );
}
