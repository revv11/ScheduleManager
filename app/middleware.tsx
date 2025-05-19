
import { NextResponse, NextRequest } from "next/server";

import { getToken } from "next-auth/jwt";




export async function middleware(req: NextRequest,) {
  // Access cookies from the request
  const secret = process.env.NEXTAUTH_SECRET;
 
  const token = await getToken({ req, secret });

    
  const url = req.nextUrl;

  if (!token &&  (url.pathname.startsWith('/dashboard'))) {
    console.log("redirected1")
    return NextResponse.redirect(new URL('/login', req.url)); 
  }
  else if(token && (url.pathname.startsWith('/login') || url.pathname.startsWith('/signup'))){
    console.log("redirected2")
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
 
 
 
 
}
export const config={
    matcher:[
      "/dashboard",
      "/login",
      "/signup",
    ]
}