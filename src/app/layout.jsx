import { LingoProvider, loadDictionary } from "lingo.dev/react/rsc";
import { Inter } from "next/font/google";
import AnimationProvider from "@/components/providers/AnimationProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "InvisiMail - Privacy-First Email Aliases",
  description: "Protect your privacy with disposable email aliases",
};

export default function RootLayout({ children }) {
  return (
    <LingoProvider loadDictionary={(locale) => loadDictionary(locale)}>
      <html lang="en">
        <body className={inter.className}>
          <AnimationProvider>
            {children}
          </AnimationProvider>
        </body>
      </html>
    </LingoProvider>
  );
}