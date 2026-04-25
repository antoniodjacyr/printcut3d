import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { CartProvider } from "@/components/providers/cart-provider";
import { SessionTimeoutGuard } from "@/components/auth/session-timeout-guard";

export const metadata: Metadata = {
  title: "Print & Cut 3D",
  description: "Global 3D and laser manufacturing marketplace"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <LocaleProvider>
          <CartProvider>
            <Header />
            <SessionTimeoutGuard />
            <main>{children}</main>
          </CartProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
