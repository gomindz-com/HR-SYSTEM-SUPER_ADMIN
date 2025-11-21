import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AdminMobileNav, AdminSidebar } from "@/components/admin_nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HR System Super Admin",
  description: "HR System Super Admin panel that helps track HR system key metrics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <div className="flex min-h-screen bg-background">
            <AdminSidebar />
            <div className="flex-1 flex flex-col">
              <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports[backdrop-filter]:bg-card/60 lg:hidden">
                <div className="flex h-16 items-center justify-between px-4">
                  <div className="flex items-center gap-3">
                    <AdminMobileNav />
                    <h1 className="text-lg font-bold">HR System</h1>
                  </div>
                  <span className="text-sm text-muted-foreground">Admin</span>
                </div>
              </header>
              <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
            </div>
          </div>
      </body>
    </html>
  );
}
