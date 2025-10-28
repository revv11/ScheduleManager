import { ThemeProvider } from "@/components/theme-provider";
import Appbar from "@/components/custom/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="h-screen bg-zinc-900 text-zinc-100 flex flex-col overflow-hidden">
          <Appbar />
          <div className="flex-1 min-h-0 overflow-hidden">
            {children}
          </div>
      </div>
    </ThemeProvider>
  );
}
