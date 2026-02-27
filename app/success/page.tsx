"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const C = {
  bg: "#09090B",
  surface: "#111113",
  surface2: "#18181B",
  border: "rgba(255,255,255,0.07)",
  borderStrong: "rgba(255,255,255,0.14)",
  accent: "#635BFF",
  accentDim: "rgba(99,91,255,0.12)",
  green: "#22C55E",
  greenDim: "rgba(34,197,94,0.12)",
  text: "#FAFAFA",
  textSec: "rgba(250,250,250,0.6)",
  textMuted: "rgba(250,250,250,0.35)",
};

const steps = [
  {
    num: "01",
    text: "Du modtager en bekræftelse på e-mail",
  },
  {
    num: "02",
    text: "Vi kontakter dig inden for 24 timer",
  },
  {
    num: "03",
    text: "Vi starter din webpakke",
  },
];

function CheckCircle() {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      fill="none"
      style={{
        animation: "popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both",
      }}
    >
      <circle cx="36" cy="36" r="36" fill={C.greenDim} />
      <circle cx="36" cy="36" r="28" fill="rgba(34,197,94,0.15)" />
      <path
        d="M22 36L31 45L50 27"
        stroke={C.green}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const method = searchParams.get("method");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const id = Math.floor(100000 + Math.random() * 900000).toString();
    setOrderId(id);
  }, []);

  const paymentLabel =
    method === "mobilepay" ? "MobilePay" : "Betalingskort";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: `1px solid ${C.border}`,
          padding: "0 24px",
          height: "56px",
          display: "flex",
          alignItems: "center",
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
      </header>

      <main
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "64px 24px 120px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "520px" }}>
          {/* Check circle */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "28px",
            }}
          >
            <CheckCircle />
          </div>

          {/* Heading */}
          <h1
            style={{
              textAlign: "center",
              fontSize: "30px",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              margin: "0 0 8px",
              color: C.text,
            }}
          >
            Betaling gennemført!
          </h1>

          {/* Sub */}
          <p
            style={{
              textAlign: "center",
              fontSize: "15px",
              color: C.textSec,
              margin: "0 0 40px",
            }}
          >
            Tak for din bestilling. Vi ser frem til at arbejde med dig.
          </p>

          {/* Order summary card */}
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.borderStrong}`,
              borderRadius: "12px",
              padding: "24px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <span style={{ fontSize: "13px", color: C.textMuted }}>
                Ordrenummer
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: C.text,
                  fontFamily: "monospace",
                  letterSpacing: "0.05em",
                }}
              >
                #NP-{orderId}
              </span>
            </div>

            <div style={{ height: "1px", background: C.border, margin: "0 0 16px" }} />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
                fontSize: "14px",
              }}
            >
              <span style={{ color: C.textSec }}>Produkt</span>
              <span>Starter Webpakke</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
                fontSize: "14px",
              }}
            >
              <span style={{ color: C.textSec }}>Beloeb</span>
              <span style={{ fontWeight: 700 }}>6.400 kr.</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "14px",
              }}
            >
              <span style={{ color: C.textSec }}>Betalingsmetode</span>
              <span>{paymentLabel}</span>
            </div>
          </div>

          {/* What happens next */}
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.borderStrong}`,
              borderRadius: "12px",
              padding: "24px",
              marginBottom: "32px",
            }}
          >
            <h2
              style={{
                fontSize: "15px",
                fontWeight: 700,
                margin: "0 0 20px",
                letterSpacing: "-0.02em",
              }}
            >
              Hvad sker der nu?
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {steps.map((s) => (
                <div
                  key={s.num}
                  style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}
                >
                  <div
                    style={{
                      minWidth: "32px",
                      height: "32px",
                      background: C.accentDim,
                      border: `1px solid rgba(99,91,255,0.2)`,
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: 800,
                      color: C.accent,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {s.num}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: C.textSec,
                      paddingTop: "7px",
                      lineHeight: 1.5,
                    }}
                  >
                    {s.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <a
            href="/"
            style={{
              display: "block",
              background: C.surface,
              color: C.text,
              border: `1px solid ${C.borderStrong}`,
              borderRadius: "10px",
              padding: "14px",
              fontSize: "15px",
              fontWeight: 600,
              textDecoration: "none",
              textAlign: "center",
              letterSpacing: "-0.01em",
              transition: "background 0.15s",
            }}
            onMouseOver={(e) =>
              ((e.target as HTMLElement).style.background = C.surface2)
            }
            onMouseOut={(e) =>
              ((e.target as HTMLElement).style.background = C.surface)
            }
          >
            Tilbage til forsiden
          </a>
        </div>
      </main>

      {/* Floating attribution */}
      <a
        href="https://slothstudio.dk"
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
          backdropFilter: "blur(8px)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
          zIndex: 100,
        }}
      >
        Bygget af Sloth Studio
      </a>

      <style>{`
        @keyframes popIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#09090B" }} />}>
      <SuccessContent />
    </Suspense>
  );
}
