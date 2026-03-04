import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { ColorCustomizer } from "@/components/color-customizer";
import "./globals.css";

export const metadata: Metadata = {
  title: "CODE OS — Club Management Platform",
  description:
    "Babson CODE: Community of Developers and Entrepreneurs. A comprehensive club management platform for governance, project tracking, and collaboration.",
  keywords: ["CODE", "Babson", "club management", "developers", "entrepreneurs"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <ColorCustomizer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
