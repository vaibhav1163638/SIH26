import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import AuthProvider from "@/components/AuthProvider";
import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "CropScan AI — Smart Crop Health & Early Warning System",
  description: "AI-powered crop disease detection, weather intelligence, and personalized treatment recommendations for Indian farmers. SIH 2026 PS 131.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0a1612] text-gray-100 font-sans antialiased">
        <LanguageProvider>
          <AuthProvider>
            <ClientLayout>
              {children}
            </ClientLayout>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
