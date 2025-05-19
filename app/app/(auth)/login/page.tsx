
"use client"

import { useState } from "react"
import { Eye, EyeOff, Mail } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import toast from "react-hot-toast"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"


export default function Login(){
    
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const handleGoogle = async(e:React.FormEvent)=>{
        e.preventDefault()
        try{
            await signIn("google")
            router.push('/dashboard')
            
        }
        catch(e){
            console.log(e)
            router.push('/signup')
        }
    }

    const handleSubmit = async(e:React.FormEvent)=>{
        e.preventDefault()
        try{
            
            signIn("credentials", {
              email,
              password
            })
      
            toast.success("Success!")
            router.push('/dashboard')
        }
        catch(e:any){
            toast.error(e.response.data.error)
            console.log(e.response.data.error)
        }
    }


    return(
        <div>
        <div className="mb-6">
          <p className="text-muted-foreground">Login and continue using our servesis!</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input 
                id="signup-email" 
                placeholder="Enter your email" 
                type="email" 
                className="pl-10" 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <div className="relative space-y-7">
              <Input
                id="signup-password"
                placeholder="Create a password"
                type={showPassword ? "text" : "password"}
                className="pr-10"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          <Button className="w-full cursor-pointer bg-[#6366F1] hover:bg-[#5355d1]">
            Sign In
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or continue with</span>
            </div>
          </div>
          
          <Button  variant="outline" onClick={handleGoogle} className="w-full cursor-pointer">
            <Image
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjzC2JyZDZ_RaWf0qp11K0lcvB6b6kYNMoqtZAQ9hiPZ4cTIOB"
              alt="Google"
              className="mr-2 h-5 w-5"
              width={100}
              height={100}
            />
            Sign up with Google
          </Button>
          
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a href="/signin" className="text-[#6366F1] hover:underline">
              Sign in
            </a>
          </p>
          
          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <a href="/terms" className="hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="hover:underline">
              Privacy Policy
            </a>
          </p>
        </form>
      </div>
    )
}