import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const sfText = localFont({
  variable: "--font-sf-text",
  display: "swap",
  src: [
    { path: "../../font/SF-Pro-Text-Regular.otf", weight: "400", style: "normal" },
    { path: "../../font/SF-Pro-Text-RegularItalic.otf", weight: "400", style: "italic" },
    { path: "../../font/SF-Pro-Text-Medium.otf", weight: "500", style: "normal" },
    { path: "../../font/SF-Pro-Text-Semibold.otf", weight: "600", style: "normal" },
  ],
});

const sfDisplay = localFont({
  variable: "--font-sf-display",
  display: "swap",
  src: [
    { path: "../../font/SF-Pro-Display-Medium.otf", weight: "500", style: "normal" },
    { path: "../../font/SF-Pro-Display-Semibold.otf", weight: "600", style: "normal" },
    { path: "../../font/SF-Pro-Display-Bold.otf", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "Density",
  description: "Posting frequency insights with heatmaps and streak stats.",
  openGraph: {
    title: "Density",
    description: "Posting frequency insights with heatmaps and streak stats.",
    type: "website",
  },
  icons: {
    icon: [
      {
        url: "/favicon%20small.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/Favicon%20large.png",
        sizes: "256x256",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/Favicon%20large.png",
        sizes: "256x256",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sfText.variable} ${sfDisplay.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <TooltipProvider delayDuration={150}>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
