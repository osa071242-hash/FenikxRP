import type { Metadata } from "next";
import { Nunito_Sans, Unbounded } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSessionUser } from "@/lib/auth";
import { getSiteTexts } from "@/lib/forum";
import "./globals.css";

const display = Unbounded({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display-face",
});

const nunito = Nunito_Sans({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body-face",
});

export const metadata: Metadata = {
  title: "FenixRP — форум GTA 5 RolePlay",
  description:
    "Сообщество FenixRP: новости, правила, роли и обсуждения игроков Los Santos.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [user, texts] = await Promise.all([getSessionUser(), getSiteTexts()]);
  return (
    <html lang="ru">
      <body className={`${display.variable} ${nunito.variable}`}>
        <style>{`:root{--font-display:var(--font-display-face),sans-serif;--font-body:var(--font-body-face),sans-serif;}`}</style>
        <Header user={user} />
        <main>{children}</main>
        <Footer copy={texts.footer_copy || "FenixRP"} />
      </body>
    </html>
  );
}
