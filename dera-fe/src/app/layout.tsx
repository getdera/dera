import type { Metadata } from 'next';
// Trying a suggestion from https://github.com/vercel/next.js/issues/16630#issuecomment-710752297
// to workaround css ordering issue that causes some components to not render correctly. Not sure if it works though.
// The suggestion is to load all css in a single css and to import that css in the entry point.
import ReactQueryClientProvider from '@/components/react-query-client-provider';
import theme from '@/theme';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import Script from 'next/script';
import './style.css';

export const metadata: Metadata = {
  title: 'Dera',
  description: 'Data Encoding and Representation Analysis',
};

const gtagScript = process.env.NEXT_PUBLIC_GTM_ID && (
  <Script id="google-tag-manager" strategy="afterInteractive">
    {`
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
      `}
  </Script>
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en">
        <head>
          <ColorSchemeScript forceColorScheme="dark" />
          <link rel="shortcut icon" href="/icon.png" />
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
          />
          {gtagScript}
        </head>
        <body>
          <MantineProvider theme={theme} forceColorScheme="dark">
            <Notifications />
            <ReactQueryClientProvider>
              <ModalsProvider>{children}</ModalsProvider>
            </ReactQueryClientProvider>
          </MantineProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
