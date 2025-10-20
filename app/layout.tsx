import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/lib/redux/provider";
import { InvoicesProvider } from "@/app/contexts/InvoicesContext";
import { BigsterToaster } from "@/components/ui/bigster-toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BigSter 2.0",
  description: "Piattaforma per la gestione delle selezioni del personale.",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <ReduxProvider>
          <InvoicesProvider>
            {children}
            <BigsterToaster />
          </InvoicesProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
