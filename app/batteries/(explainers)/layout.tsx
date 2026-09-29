import type { Metadata } from "next";
import localFont from "next/font/local";
import "katex/dist/katex.min.css";
import "./batteries.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Battery Masters",
  description: "Narrated, scroll-driven walkthroughs of the batteries & energy storage course material.",
};

export default function BatteriesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`battery-masters ${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</div>
  );
}
