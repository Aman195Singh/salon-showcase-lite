import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/ConditionalLayout";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { AuthProvider } from "@/context/AuthContext";

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: {
    default: "Salon — Premium Unisex Salon",
    template: "%s | Salon",
  },
  description:
    "Experience premium grooming and beauty services for men and women. Expert stylists, quality products, and a welcoming atmosphere.",
  openGraph: {
    title: "Salon — Premium Unisex Salon",
    description:
      "Experience premium grooming and beauty services for men and women.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <AuthProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
          <AnalyticsTracker />
        </AuthProvider>
      </body>
    </html>
  );
}
