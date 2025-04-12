import { db } from "@/lib/db";
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs";
import GoogleProvider from "next-auth/providers/google";





export const authOptions = {
    providers: [
      CredentialsProvider({
          name: 'Credentials',
          credentials: {

            email: { label: "Username", type: "text", placeholder: "revv"},
            password: { label: "Password", type: "password", required: true }
          },
       
          async authorize(credentials: any) {
    
                
              
            const existingUser = await db.user.findFirst({
                where: {
                    email: credentials.email
                }
                });
    
            if (existingUser) {
                const passwordValidation = await bcrypt.compare(credentials.password, existingUser.password);
                if (passwordValidation) {
                    return {
                        id: existingUser.id.toString(),
                        email: existingUser.email,
                          
                            
                        }
                }
                return null
            }
    
            return null
                
          
           
            
          },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
          })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async signIn({ user, account }: any) {
            if (account?.provider == "credentials") {
              return true;
            }
      
            //   Handling SignIn/SignUp with Google
            const existingUser = await db.user.findUnique({
              where: {
                email: user.email,
              },
            });
      
            //   If user does not exist, create and login
            if (!existingUser) {
              const newUser = await db.user.create({
                data: {
                 
                    email: user.email!,
                    password: String(Math.random()*12),
                 
                },
                select: {
                  email: true,
                  id: true,
            
                },
              });
      
              user.id = newUser.id;
              
              return true;
            }
      
            //   If user exists, then login
            user.id = existingUser.id;
            
            return true;
          },
        async jwt({token , user}: {token: any, user:any}){
            if(user){
                token.id = user.id,
                token.details= user.details
                
           
             
                
            }
            return token;
        },

        async session({ token, session }: any) {
            if(token){
                session.user.id = token.id;
                session.user.details = token.details
                
                
            }
            
            return session
        },
    }
  }
  