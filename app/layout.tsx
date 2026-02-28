import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PayFlow – Sloth Studio Checkout Demo",
  description: "A payment checkout demo showcasing Stripe and MobilePay integration by Sloth Studio.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="da">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#09090B",
          color: "#FAFAFA",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          minHeight: "100vh",
          WebkitFontSmoothing: "antialiased",
        }}
      >
        {children}
      </body>
    </html>
  );
}
