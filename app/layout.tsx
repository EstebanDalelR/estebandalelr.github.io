import Head from "next/head";
import Script from "next/script";
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

        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </Head>
      <body>
        {children}
        <Script id="sw-register" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js');
          }
        `}</Script>
      </body>
    </html>
  );
}
