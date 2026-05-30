import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import '@stream-io/video-react-sdk/dist/css/styles.css';
import 'react-datepicker/dist/react-datepicker.css'

export const metadata: Metadata = {
  title: "Plexus",
  description: "Video calling app",
  icons : {
    icon : '/icons/logo.svg'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: "light",
        layout: {
          socialButtonsVariant: "iconButton",
          logoImageUrl: "/icons/yoom-logo.svg",
          card: {
            borderRadius: "12px",
            boxShadow: "0 6px 20px rgba(16,17,20,0.08)",
          },
        },
        variables: {
          colorText: "#101114",
          colorPrimary: "#0E78F9",
          colorBackground: "#ffffff",
          colorInputBackground: "#ffffff",
          colorInputText: "#101114",
          colorButtonText: "#ffffff",
        },
      }}
    >
      <html lang="en">
        <body>{children}
          <Toaster/>
        </body>

      </html>
    </ClerkProvider>
  );
}