import type { Metadata, Viewport } from "next";
import "./globals.css";

const title = "porQpine Agent Workbench | Chatbots & n8n Automation";
const description =
  "Shape a chatbot or n8n automation idea into a clear, privacy-aware implementation brief, then take it to the real $10 porQpine Freelancer offer.";

export const metadata: Metadata = {
  title,
  description,
  applicationName: "porQpine Agent Workbench",
  keywords: [
    "AI chatbot development",
    "n8n automation",
    "workflow automation",
    "Freelancer service",
    "porQpine",
  ],
  authors: [{ name: "porQpine" }],
  creator: "porQpine",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "porQpine Agent Workbench",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080b0a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
