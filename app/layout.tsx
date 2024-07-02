import Head from "next/head";
import "../styles/index.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />

        <title>Esteban Dalel R</title>
        <meta
          name="description"
          content="I make good software and tell bad jokes"
        />

        <meta property="og:title" content="Esteban Dalel R" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://www.estebandalelr.co/estebandalelr.jpg"
        />
      </Head>
      <body>{children}</body>
    </html>
  );
}
