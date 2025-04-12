import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs"
import { userSchema } from "@/lib/zod";
// import { sendEmail } from "@/lib/verification/mailer";



export async function POST(req: Request){
    try{
        const body = await req.json()
        const {email, password} = userSchema.parse(body);
        //check if the user already exists
        const existinguseremail = await db.user.findUnique({
            where : { email : email}
        })
        if(existinguseremail){
            return NextResponse.json({user: null , message: "Email already exists"},{status:409})
        }
       
        //creating user
        // await sendEmail({email, userId: username})
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await db.user.create({
            data : {email: email || "", password: hashedPassword }
        })
        const {password: newUserpassword , ...rest} = newUser;
        return NextResponse.json({user: rest, message:"User created successfully!"},{status:201})
    }
    catch(e:any){
        if(e.name=== "ZodError")
            return NextResponse.json({user: null , message: e.issues[0].message},{status: 500})
        console.log(e)
    }
}