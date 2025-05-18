import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";



export async function POST(req:NextRequest){
    try{
        const body = await req.json();
        const {id} = body;
        await db.task.delete({
            where:{
                id
            }
        })

        return NextResponse.json({success: true})
    }
    catch(e){
        return NextResponse.json({error: e, message:"an eror occured"}, {status:500})
    }
}