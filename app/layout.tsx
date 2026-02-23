import type { Metadata } from "next";
import "../styles/index.css";

export const metadata: Metadata = {
  title: "Esteban Dalel R",
  description: "I make good software and tell bad jokes",
  openGraph: {
    title: "Esteban Dalel R",
    type: "website",
    images: ["https://www.estebandalelr.co/estebandalelr.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
