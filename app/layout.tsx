import type { Metadata } from "next";
import { Space_Mono, DM_Sans, Geist } from "next/font/google";
import QueryProvider from "@/providers/QueryProvider";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HireButSmarter — Talent Intelligence from GitHub",
  description:
    "Analyze any GitHub profile in seconds. Extract verified skills, compute an explainable Potential Score, and chat with an AI agent grounded in real developer data.",
  keywords: [
    "GitHub",
    "talent intelligence",
    "skill extraction",
    "developer profile",
    "AI hiring",
    "recruiter tool",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", spaceMono.variable, dmSans.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
