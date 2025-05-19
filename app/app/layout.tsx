import type { Metadata } from "next";
import AuthContext from "./context/AuthContext";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/theme-provider";


export const metadata: Metadata = {
  title: "ScheduleManager",
  description: "AI agent to plan your day!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={``}
      >
        <AuthContext>
          <Toaster position="top-right" />
          <div className="h-screen w-full">
            
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
              <div className="h-full-full">

                {children}


              </div>
          </ThemeProvider>
       
          </div>
        </AuthContext>
      </body>
    </html>
  );
}
