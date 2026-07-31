import type { Metadata } from "next";
import {
  Archivo_Black,
  DM_Sans,
  Inter,
  Space_Grotesk,
  Space_Mono,
} from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import "./globals.css";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-megaphone",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo-black",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "eTower — Babson's Premier Entrepreneurial Community",
  description:
    "Where Boston's next generation of entrepreneurs live, learn, and launch. Join eTower at Babson College.",
  keywords: ["eTower", "Babson", "entrepreneurship", "startups", "living learning community"],
  icons: {
    icon: "/etowerlogo.png",
    apple: "/etowerlogo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${spaceMono.variable} ${dmSans.variable} ${archivoBlack.variable} ${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
