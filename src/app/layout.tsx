import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout";
import { ToastProvider } from "@/components/ui";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  title: "Union Poker",
  description: "Manage your university poker games with ease",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Union Poker",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <AuthProvider>
          <ToastProvider>
            <MainLayout>
              {children}
            </MainLayout>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
