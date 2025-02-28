import Navbar from "@/components/mainNavbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EQUILEX",
  description: "Attorney-Client connector",
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="relative">
          Navbar
          <div className="relative max-w-screen-2xl h-[calc(100vh-30px)]">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
