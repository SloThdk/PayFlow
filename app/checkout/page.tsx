"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

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
  red: "#EF4444",
};

type Tab = "kort" | "applepay" | "googlepay";

// --- Luhn algorithm ---
function luhn(num: string): boolean {
  const digits = num.replace(/\s/g, "");
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0 && digits.length >= 13;
}

function detectCard(num: string): "visa" | "mc" | null {
  const raw = num.replace(/\s/g, "");
  if (raw.startsWith("4")) return "visa";
  if (/^5[1-5]/.test(raw) || /^2[2-7]/.test(raw)) return "mc";
  return null;
}

function VisaLogo() {
  return <img src="/icons/Visa.png" alt="Visa" style={{ height: '24px', width: 'auto', display: 'block' }} />;
}

function MastercardLogo() {
  return <img src="/icons/MasterCard.png" alt="Mastercard" style={{ height: '24px', width: 'auto', display: 'block' }} />;
}

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6.5" stroke="rgba(250,250,250,0.35)" />
      <path
        d="M7 6v4M7 4.5v.5"
        stroke="rgba(250,250,250,0.35)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <rect x="1" y="5" width="10" height="7" rx="1.5" stroke="rgba(250,250,250,0.35)" strokeWidth="1.2" />
      <path d="M3.5 5V4a2.5 2.5 0 015 0v1" stroke="rgba(250,250,250,0.35)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function Spinner() {
  return (
    <span
      style={{
        display: "inline-block",
        width: "16px",
        height: "16px",
        border: "2px solid rgba(255,255,255,0.3)",
        borderTopColor: "#fff",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
        verticalAlign: "middle",
        marginRight: "8px",
      }}
    />
  );
}

function inputStyle(error?: boolean): React.CSSProperties {
  return {
    width: "100%",
    background: C.surface2,
    border: `1px solid ${error ? C.red : C.borderStrong}`,
    borderRadius: "8px",
    padding: "12px 14px",
    fontSize: "15px",
    color: C.text,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border-color 0.15s",
  };
}

function labelStyle(): React.CSSProperties {
  return {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    color: C.textMuted,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: "6px",
  };
}

function errorMsg(msg: string) {
  return (
    <div style={{ fontSize: "12px", color: C.red, marginTop: "5px" }}>
      {msg}
    </div>
  );
}

// --- Kort tab ---
function KortForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cardLuhnErr, setCardLuhnErr] = useState(false);
  const [loading, setLoading] = useState(false);

  const cardType = detectCard(cardNum);

  function formatCard(val: string) {
    const raw = val.replace(/\D/g, "").slice(0, 16);
    return raw.replace(/(.{4})/g, "$1 ").trim();
  }

  function formatExpiry(val: string) {
    const raw = val.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) return raw.slice(0, 2) + "/" + raw.slice(2);
    return raw;
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Navn er påkrævet";
    const rawCard = cardNum.replace(/\s/g, "");
    if (rawCard.length < 13) errs.card = "Ugyldigt kortnummer";
    else if (!luhn(rawCard)) errs.card = "Kortnummeret er ugyldigt";

    const [mm, yy] = expiry.split("/");
    if (!mm || !yy || mm.length < 2 || yy.length < 2) {
      errs.expiry = "Ugyldig udløbsdato";
    } else {
      const month = parseInt(mm, 10);
      const year = 2000 + parseInt(yy, 10);
      const now = new Date();
      if (month < 1 || month > 12) errs.expiry = "Ugyldig måned";
      else if (
        year < now.getFullYear() ||
        (year === now.getFullYear() && month < now.getMonth() + 1)
      )
        errs.expiry = "Kortet er udløbet";
    }
    if (cvc.length < 3) errs.cvc = "Ugyldig CVC";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => onSuccess(), 2000);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {/* Name */}
      <div>
        <label style={labelStyle()}>Kortholders navn</label>
        <input
          style={inputStyle(!!errors.name)}
          type="text"
          placeholder="Fulde navn"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="cc-name"
        />
        {errors.name && errorMsg(errors.name)}
      </div>

      {/* Card number */}
      <div>
        <label style={labelStyle()}>Kortnummer</label>
        <div style={{ position: "relative" }}>
          <input
            style={{ ...inputStyle(!!errors.card || cardLuhnErr), paddingRight: "52px" }}
            type="text"
            inputMode="numeric"
            placeholder="1234 5678 9012 3456"
            value={cardNum}
            onChange={(e) => {
              setCardNum(formatCard(e.target.value));
              setCardLuhnErr(false);
            }}
            onBlur={() => {
              const raw = cardNum.replace(/\s/g, "");
              if (raw.length >= 13 && !luhn(raw)) setCardLuhnErr(true);
            }}
            autoComplete="cc-number"
            maxLength={19}
          />
          {cardType && (
            <div
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              {cardType === "visa" ? <VisaLogo /> : <MastercardLogo />}
            </div>
          )}
        </div>
        {errors.card && errorMsg(errors.card)}
        {!errors.card && cardLuhnErr && errorMsg("Kortnummeret er ugyldigt")}
      </div>

      {/* Expiry + CVC */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div>
          <label style={labelStyle()}>Udløbsdato</label>
          <input
            style={inputStyle(!!errors.expiry)}
            type="text"
            inputMode="numeric"
            placeholder="MM/ÅÅ"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            autoComplete="cc-exp"
            maxLength={5}
          />
          {errors.expiry && errorMsg(errors.expiry)}
        </div>
        <div>
          <label style={{ ...labelStyle(), display: "flex", alignItems: "center", gap: "5px" }}>
            CVC <InfoIcon />
          </label>
          <input
            style={inputStyle(!!errors.cvc)}
            type="text"
            inputMode="numeric"
            placeholder="123"
            value={cvc}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
            autoComplete="cc-csc"
            maxLength={4}
          />
          {errors.cvc && errorMsg(errors.cvc)}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          background: loading ? "rgba(99,91,255,0.7)" : C.accent,
          color: "#fff",
          border: "none",
          borderRadius: "10px",
          padding: "14px",
          fontSize: "15px",
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "inherit",
          letterSpacing: "-0.01em",
          marginTop: "4px",
        }}
      >
        {loading && <Spinner />}
        {loading ? "Behandler betaling..." : "Betal 499,00 kr."}
      </button>

      {/* Demo note */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          fontSize: "12px",
          color: C.textMuted,
        }}
      >
        <LockIcon />
        Demo – ingen rigtig betaling gennemføres
      </div>
    </div>
  );
}

// --- MobilePay tab ---
function MobilePayForm({ onSuccess }: { onSuccess: () => void }) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  function formatPhone(val: string) {
    const raw = val.replace(/\D/g, "").slice(0, 8);
    if (raw.length <= 2) return raw;
    if (raw.length <= 4) return raw.slice(0, 2) + " " + raw.slice(2);
    if (raw.length <= 6) return raw.slice(0, 2) + " " + raw.slice(2, 4) + " " + raw.slice(4);
    return raw.slice(0, 2) + " " + raw.slice(2, 4) + " " + raw.slice(4, 6) + " " + raw.slice(6);
  }

  function handleSubmit() {
    const raw = phone.replace(/\s/g, "");
    if (raw.length < 8) {
      setErr("Indtast et gyldigt mobilnummer");
      return;
    }
    setErr("");
    setLoading(true);
    setTimeout(() => onSuccess(), 2000);
  }

  return (
    <div>
      {/* MobilePay branding */}
      <div
        style={{
          background: "#5A78FF",
          borderRadius: "12px",
          padding: "28px 24px",
          marginBottom: "24px",
          textAlign: "center",
        }}
      >
        {/* MobilePay logo */}
        <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)" }}>
          Betal med MobilePay
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <div>
          <label style={labelStyle()}>Dit mobilnummer</label>
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "15px",
                color: C.textSec,
                pointerEvents: "none",
              }}
            >
              +45
            </div>
            <input
              style={{ ...inputStyle(!!err), paddingLeft: "46px" }}
              type="tel"
              inputMode="numeric"
              placeholder="XX XX XX XX"
              value={phone}
              onChange={(e) => {
                setPhone(formatPhone(e.target.value));
                setErr("");
              }}
            />
          </div>
          {err && errorMsg(err)}
        </div>

        <div
          style={{
            background: C.surface2,
            border: `1px solid ${C.border}`,
            borderRadius: "8px",
            padding: "12px 14px",
            fontSize: "13px",
            color: C.textSec,
          }}
        >
          Du modtager en anmodning i MobilePay-appen. Godkend den for at fuldføre betaling.
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            background: loading ? "rgba(90,120,255,0.7)" : "#5A78FF",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "14px",
            fontSize: "15px",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "inherit",
            letterSpacing: "-0.01em",
          }}
        >
          {loading && <Spinner />}
          {loading ? "Sender anmodning..." : "Send betalingsanmodning"}
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            fontSize: "12px",
            color: C.textMuted,
          }}
        >
          <LockIcon />
          Demo – ingen rigtig betaling gennemføres
        </div>
      </div>
    </div>
  );
}

// --- Apple Pay tab ---
function ApplePayTab() {
  return (
    <div style={{ textAlign: "center", padding: "16px 0" }}>
      <div
        style={{
          opacity: 0.4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <button
          disabled
          style={{
            background: "#000",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "14px 32px",
            fontSize: "15px",
            fontWeight: 600,
            cursor: "not-allowed",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontFamily: "inherit",
          }}
        >
          <img src="/icons/ApplePay.png" alt="Apple Pay" style={{ height: '28px', width: 'auto' }} />
        </button>
        <p style={{ fontSize: "13px", color: C.textSec, margin: 0 }}>
          Kun tilgængelig på Apple-enheder
        </p>
      </div>
    </div>
  );
}

// --- Google Pay tab ---
function GooglePayTab() {
  return (
    <div style={{ textAlign: "center", padding: "16px 0" }}>
      <div
        style={{
          opacity: 0.5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <button
          disabled
          style={{
            background: "#fff",
            color: "#3c4043",
            border: "1px solid #dadce0",
            borderRadius: "10px",
            padding: "14px 32px",
            fontSize: "15px",
            fontWeight: 600,
            cursor: "not-allowed",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontFamily: "inherit",
          }}
        >
          <img src="/icons/GooglePay.png" alt="Google Pay" style={{ height: '28px', width: 'auto' }} />
        </button>
        <p style={{ fontSize: "13px", color: C.textSec, margin: 0 }}>
          Demo – ikke tilgængelig i dette miljø
        </p>
      </div>
    </div>
  );
}

// --- Main checkout page ---
export default function CheckoutPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("kort");

  function handleCardSuccess() {
    router.push("/success");
  }
  const tabs: { key: Tab; label: string; icon?: string }[] = [
    { key: "kort", label: "Kort" },    { key: "applepay", label: "Apple Pay", icon: "/icons/ApplePay.png" },
    { key: "googlepay", label: "Google Pay", icon: "/icons/GooglePay.png" },
  ];

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ minHeight: "100vh", background: C.bg }}>
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
          <a
            href="/"
            style={{
              fontWeight: 700,
              fontSize: "16px",
              letterSpacing: "-0.02em",
              color: C.text,
              textDecoration: "none",
            }}
          >
            PayFlow
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img src="/icons/SSL_SECURED.png" alt="SSL Secured" style={{ height: '22px', width: 'auto' }} />
          </div>
        </header>

        {/* Main */}
        <main
          style={{
            maxWidth: "960px",
            margin: "0 auto",
            padding: "48px 24px 120px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "40px",
            alignItems: "start",
          }}
        >
          {/* Left: Order summary */}
          <div>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 700,
                margin: "0 0 24px",
                letterSpacing: "-0.02em",
              }}
            >
              Din ordre
            </h2>

            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.borderStrong}`,
                borderRadius: "12px",
                padding: "24px",
              }}
            >
              {/* Product row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: "15px" }}>
                    Eksempel produkt
                  </div>
                  <div style={{ fontSize: "13px", color: C.textSec, marginTop: "2px" }}>
                    Sloth Studio
                  </div>
                </div>
                <div style={{ fontWeight: 600, fontSize: "15px" }}>5.120 kr.</div>
              </div>

              {/* Divider */}
              <div style={{ height: "1px", background: C.border, margin: "0 0 16px" }} />

              {/* Subtotal */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                  color: C.textSec,
                  marginBottom: "8px",
                }}
              >
                <span>Subtotal</span>
                <span>5.120 kr.</span>
              </div>

              {/* Moms */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                  color: C.textSec,
                  marginBottom: "16px",
                }}
              >
                <span>Moms (25%)</span>
                <span>1.280 kr.</span>
              </div>

              {/* Divider */}
              <div style={{ height: "1px", background: C.border, margin: "0 0 16px" }} />

              {/* Total */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "17px",
                  fontWeight: 700,
                }}
              >
                <span>Total</span>
                <span>499,00 kr.</span>
              </div>

              {/* Note */}
              <div
                style={{
                  marginTop: "16px",
                  fontSize: "12px",
                  color: C.textMuted,
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                Du betaler kun en gang – ingen abonnement
              </div>
            </div>
          </div>

          {/* Right: Payment form */}
          <div>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 700,
                margin: "0 0 24px",
                letterSpacing: "-0.02em",
              }}
            >
              Betalingsmetode
            </h2>

            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.borderStrong}`,
                borderRadius: "12px",
                padding: "24px",
              }}
            >
              {/* Tabs */}
              <div
                style={{
                  display: "flex",
                  gap: "4px",
                  background: C.surface2,
                  borderRadius: "8px",
                  padding: "4px",
                  marginBottom: "24px",
                  flexWrap: "wrap",
                }}
              >
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    style={{
                      flex: "1 1 auto",
                      background:
                        tab === t.key ? C.surface : "transparent",
                      color: tab === t.key ? C.text : C.textMuted,
                      border:
                        tab === t.key
                          ? `1px solid ${C.borderStrong}`
                          : "1px solid transparent",
                      borderRadius: "6px",
                      padding: "7px 8px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      whiteSpace: "nowrap",
                      transition: "all 0.15s",
                    }}
                  >
                    {t.icon
                        ? <img src={t.icon} alt={t.label} style={{ height: '18px', width: 'auto', display: 'block', margin: '0 auto' }} />
                        : t.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {tab === "kort" && <KortForm onSuccess={handleCardSuccess} />}
              {tab === "applepay" && <ApplePayTab />}
              {tab === "googlepay" && <GooglePayTab />}
            </div>
          </div>
        </main>

        {/* Responsive stacking */}
        <style>{`
          @media (max-width: 700px) {
            main {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>

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
      </div>
    </>
  );
}
