



import Navbar from "@/components/custom/Navbar"
import { ThemeProvider } from "@/components/theme-provider";
import Appbar from "@/components/custom/Navbar";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (   
    <body className={``}>         
      <Appbar/>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <div className="h-full-full">

          {children}


        </div>
      </ThemeProvider>
    </body>
  );
}
