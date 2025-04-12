import { NextRequest, NextResponse } from "next/server";
import { generateSchedule } from "@/lib/llm/agent.";



export async function POST(req:NextRequest) {
    try {
        const body = await req.json()
        const {prompt} = body;
      
        console.log("sessionnnnnnnnnnnnnnnn")
        const {schedule , plan} = await generateSchedule(prompt);
        
        return NextResponse.json({schedule, plan}, {status: 200});
    } catch (error) {
        console.log(error)
        return NextResponse.json({error: 'Schedule generation failed'}, {status: 500});
    }
}