import type { Metadata } from "next";
import "./globals.css";
import { ReactQueryProvider } from "./context/reactQueryProvider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "EQUILEX",
  description: "Attorney-Client Connector",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          <Toaster />
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  );
}
