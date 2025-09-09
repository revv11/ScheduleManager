



import Prompt from "@/components/custom/Prompt"
import AIRec from "@/components/custom/AIRec"
import Progress from "@/components/custom/Progress"





export default function Home() {
  return (
    <div className="min-full bg-zinc-900 text-zinc-100">

     


      
      <main className="container py-5 mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl">
        {/* Today's Schedule */}
        <Progress/>

        {/* AI Recommendations */}
        <AIRec/>

        {/* Chat Interface */}
        <Prompt/>
      </main>
    </div>
  )
}




