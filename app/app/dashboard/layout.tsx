



import Navbar from "@/components/custom/Navbar"





export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (   
    <body
    className={``}
    >       
        <div className="h-full-full">
            <Navbar/>
            {children}

        </div>
    </body>
  );
}
