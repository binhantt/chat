
import "@radix-ui/themes/styles.css";
import "@/app/globals.css";

import { Theme } from "@radix-ui/themes";
import { Providers } from "@/components/providers/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body style={{margin : 0}}>
        <Providers>
          <Theme
            accentColor="indigo"
            panelBackground="solid"
            radius="small"
            appearance="inherit"
          >
            {children}
          </Theme>
        </Providers>
      </body>
    </html>
  );
}
