import { LingoProvider, loadDictionary } from "lingo.dev/react/rsc";
import { Inter } from "next/font/google";
import AnimationProvider from "@/components/providers/AnimationProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "InvisiMail - Privacy-First Email Aliases",
  description: "Protect your privacy with disposable email aliases",
};

export default function RootLayout({ children }) {
  return (
    <LingoProvider loadDictionary={(locale) => loadDictionary(locale)}>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AnimationProvider>
              {children}
            </AnimationProvider>
          </ThemeProvider>
        </body>
      </html>
    </LingoProvider>
  );
}