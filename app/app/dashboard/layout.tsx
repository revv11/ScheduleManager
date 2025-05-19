




import { ThemeProvider } from "@/components/theme-provider";
import Appbar from "@/components/custom/Navbar";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (   
    <div className={``}>         
      <Appbar/>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <div className="h-full-full">

          {children}


        </div>
      </ThemeProvider>
    </div>
  );
}
