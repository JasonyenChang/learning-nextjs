import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { WebThemeProvider } from "../context/theme";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <WebThemeProvider>
          {children}
        </WebThemeProvider>
      </body>
    </html>
  );
}