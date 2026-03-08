import type { Metadata } from "next";
import { Oswald, Lora } from "next/font/google";

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  weight: ["400", "500", "700"],
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  style: ["normal", "italic"],
});
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { BackgroundOverlay } from "@/components/background-overlay";
import Image from "next/image";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Generator — Interdisciplinary AI Lab",
  description:
    "The Generator is Babson College's Interdisciplinary AI Lab and entrepreneurship hub. We empower students and associates through workshops, mentorship, and hands-on experiences.",
  keywords: ["The Generator", "Babson", "AI Lab", "entrepreneurship", "innovators"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${oswald.variable} ${lora.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* Global application background - GeneratorBG with blur */}
          <div className="fixed inset-0 z-[-1] bg-background">
            <Image
              src="/images/generator-bg.png"
              alt="Generator Background"
              fill
              priority
              className="object-cover blur-[6px] sm:blur-[8px]"
            />
          </div>

          {/* Darker overlay on all pages except landing */}
          <BackgroundOverlay />

          <div className="relative z-10 min-h-screen">
            <AuthProvider>
              {children}
            </AuthProvider>
          </div>
        </ThemeProvider>      </body>
    </html>
  );
}
