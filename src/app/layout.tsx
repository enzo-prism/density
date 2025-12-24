import type { Metadata } from "next";
import Script from "next/script";
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
  title: "density.report",
  description: "Posting frequency insights with heatmaps and streak stats.",
  openGraph: {
    title: "density.report",
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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-YTBLKGMW5K"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-YTBLKGMW5K');`}
        </Script>
        <Script id="hotjar" strategy="afterInteractive">
          {`(function(h,o,t,j,a,r){
  h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
  h._hjSettings={hjid:6608249,hjsv:6};
  a=o.getElementsByTagName('head')[0];
  r=o.createElement('script');r.async=1;
  r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
  a.appendChild(r);
})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`}
        </Script>
      </body>
    </html>
  );
}
