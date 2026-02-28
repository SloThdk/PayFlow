"use client";

import Link from "next/link";

const C = {
  bg: "#09090B",
  surface: "#111113",
  surface2: "#18181B",
  border: "rgba(255,255,255,0.07)",
  borderStrong: "rgba(255,255,255,0.14)",
  accent: "#635BFF",
  accentDim: "rgba(99,91,255,0.12)",
  green: "#22C55E",
  text: "#FAFAFA",
  textSec: "rgba(250,250,250,0.6)",
  textMuted: "rgba(250,250,250,0.35)",
};

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill={C.accentDim} />
      <path
        d="M4.5 8L7 10.5L11.5 6"
        stroke={C.accent}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect
        x="2"
        y="6"
        width="10"
        height="7"
        rx="1.5"
        stroke={C.textMuted}
        strokeWidth="1.2"
      />
      <path
        d="M4.5 6V4.5a2.5 2.5 0 015 0V6"
        stroke={C.textMuted}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="7" cy="9.5" r="1" fill={C.textMuted} />
    </svg>
  );
}

const features = [
  "Responsivt design til alle enheder",
  "SEO-optimeret kode",
  "Cloudflare deployment inkluderet",
];

export default function ProductPage() {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, overflowX: "hidden" }}>
      {/* Demo banner */}
      <div
        style={{
          background: C.surface,
          borderBottom: `1px solid ${C.border}`,
          padding: "10px 24px",
          textAlign: "center",
          fontSize: "12px",
          color: C.textMuted,
          letterSpacing: "0.02em",
        }}
      >
        Dette design kan tilpasses fuldt ud til dit brand og din identitet — farver, logo og typografi matcher dit website.
        Dette viser blot, hvordan et betalingsflow ville se ud på din side. Ingen rigtige betalinger behandles.
      </div>

      {/* Header */}
      <header
        style={{
          borderBottom: `1px solid ${C.border}`,
          padding: "0 24px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: C.surface,
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: "16px",
            letterSpacing: "-0.02em",
            color: C.text,
          }}
        >
          PayFlow
        </span>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            background: C.accentDim,
            color: C.accent,
            padding: "3px 10px",
            borderRadius: "20px",
            border: `1px solid rgba(99,91,255,0.25)`,
          }}
        >
          Demo
        </span>
      </header>

      {/* Main content */}
      <main
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "64px 24px 120px",
          minHeight: "calc(100vh - 90px)",
        }}
      >
        <div style={{ width: "100%", maxWidth: "480px" }}>
          {/* Product card */}
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.borderStrong}`,
              borderRadius: "16px",
              padding: "36px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
          >
            {/* Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: C.accentDim,
                border: `1px solid rgba(99,91,255,0.2)`,
                borderRadius: "8px",
                padding: "4px 12px",
                marginBottom: "24px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: C.accent,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Sloth Studio
              </span>
            </div>

            {/* Product name */}
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 700,
                margin: "0 0 8px",
                letterSpacing: "-0.03em",
                color: C.text,
                lineHeight: 1.2,
              }}
            >
              Starter Webpakke
            </h1>

            {/* Description */}
            <p
              style={{
                fontSize: "15px",
                color: C.textSec,
                margin: "0 0 28px",
                lineHeight: 1.6,
              }}
            >
              En komplet hjemmeside bygget fra bunden. Inkluderer design,
              udvikling og deployment.
            </p>

            {/* Divider */}
            <div
              style={{
                height: "1px",
                background: C.border,
                margin: "0 0 24px",
              }}
            />

            {/* Features */}
            <ul
              style={{
                listStyle: "none",
                margin: "0 0 32px",
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {features.map((f) => (
                <li
                  key={f}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "14px",
                    color: C.textSec,
                  }}
                >
                  <CheckIcon />
                  {f}
                </li>
              ))}
            </ul>

            {/* Price */}
            <div style={{ marginBottom: "28px" }}>
              <div
                style={{
                  fontSize: "40px",
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  color: C.text,
                  lineHeight: 1,
                }}
              >
                6.400 kr.
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: C.textMuted,
                  marginTop: "4px",
                }}
              >
                inkl. moms
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/checkout"
              style={{
                display: "block",
                width: "100%",
                background: C.accent,
                color: "#fff",
                textAlign: "center",
                padding: "14px",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: 600,
                textDecoration: "none",
                letterSpacing: "-0.01em",
                transition: "opacity 0.15s",
                boxSizing: "border-box",
              }}
              onMouseOver={(e) =>
                ((e.target as HTMLElement).style.opacity = "0.9")
              }
              onMouseOut={(e) =>
                ((e.target as HTMLElement).style.opacity = "1")
              }
            >
              Køb nu
            </Link>

            {/* Security note */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                marginTop: "16px",
              }}
            >
              <img src="/icons/SSL_SECURED.png" alt="SSL Secured" style={{ height: '22px', width: 'auto' }} />
              <span style={{ fontSize: "11px", color: C.textMuted, marginLeft: "4px" }}>Sikker betaling</span>
              <div style={{ marginLeft: "auto", display: "flex", gap: "6px", alignItems: "center" }}>
                <img src="/icons/Stripe.png" alt="Stripe" style={{ height: '18px', width: 'auto', opacity: 0.7 }} />
                <img src="/icons/MobilePay.png" alt="MobilePay" style={{ height: '18px', width: 'auto', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Brand customization note */}
        <div
          style={{
            background: "rgba(99,91,255,0.06)",
            border: "1px solid rgba(99,91,255,0.18)",
            borderRadius: "12px",
            padding: "20px 24px",
            marginTop: "16px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              color: "rgba(250,250,250,0.5)",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            This design is fully customizable to your brand and identity.
            Colors, logo, fonts, and layout can all be matched to your site.
            This is just one example of how a payment flow would look on your site.
          </p>
        </div>
      </main>

      {/* Floating attribution */}
      <a
        href="https://sloth-studio.pages.dev"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          background: C.surface2,
          border: `1px solid ${C.borderStrong}`,
          borderRadius: "100px",
          padding: "8px 16px",
          fontSize: "12px",
          color: C.textSec,
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          backdropFilter: "blur(8px)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
          zIndex: 100,
        }}
      >
        Bygget af Sloth Studio
      </a>
    </div>
  );
}
