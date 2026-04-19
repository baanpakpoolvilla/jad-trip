import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Thai } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Just Trip — จัดทริปแล้วลุยเลย",
  description:
    "เครื่องมือสำหรับผู้จัดกลุ่มทริป — นำเสนอทริป รับจอง ตามสถานะชำระเงิน และแชร์ลิงก์สาธารณะให้ลูกค้าได้ในที่เดียว",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${notoSansThai.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full bg-canvas font-sans text-fg antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
