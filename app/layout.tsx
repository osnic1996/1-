import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crevity - 댓글 관리",
  description: "인스타그램/페이스북 광고 댓글 통합 관리",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
