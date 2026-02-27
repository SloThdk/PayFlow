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
  mobilepay: "#5A78FF",
  green: "#22C55E",
  text: "#FAFAFA",
  textSec: "rgba(250,250,250,0.6)",
  textMuted: "rgba(250,250,250,0.35)",
  red: "#EF4444",
};

type Tab = "kort" | "mobilepay" | "applepay" | "googlepay";

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
  return (
    <svg width="36" height="24" viewBox="0 0 36 24" fill="none">
      <rect width="36" height="24" rx="4" fill="#1A1F71" />
      <path
        d="M14.5 17H12l-2-7h2.3l1.2 5 1.3-5H17L14.5 17zm4 0h-2.2l2.2-7h2.2L18.5 17zm6.5-7l-.5 1.5s-.5-.8-1.3-.8c-.7 0-1 .4-1 .8 0 .5.6.7 1.4 1.2 1 .6 1.5 1.2 1.5 2.1 0 1.4-1.2 2.3-2.9 2.3-1.1 0-2-.5-2-.5l.4-1.6s.8.7 1.8.7c.6 0 1-.3 1-.7 0-.5-.5-.7-1.3-1.2-1-.6-1.5-1.3-1.5-2.1 0-1.3 1.1-2.2 2.8-2.2.9 0 1.7.4 1.7.4L25 10z"
        fill="white"
      />
    </svg>
  );
}

function MastercardLogo() {
  return (
    <svg width="36" height="24" viewBox="0 0 36 24" fill="none">
      <rect width="36" height="24" rx="4" fill="#252525" />
      <circle cx="14" cy="12" r="6" fill="#EB001B" />
      <circle cx="22" cy="12" r="6" fill="#F79E1B" />
      <path
        d="M18 7.5A6 6 0 0122 12a6 6 0 01-4 4.5A6 6 0 0114 12a6 6 0 014-4.5z"
        fill="#FF5F00"
      />
    </svg>
  );
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
    if (!name.trim()) errs.name = "Navn er paakraevet";
    const rawCard = cardNum.replace(/\s/g, "");
    if (rawCard.length < 13) errs.card = "Ugyldigt kortnummer";
    else if (!luhn(rawCard)) errs.card = "Kortnummeret er ugyldigt";

    const [mm, yy] = expiry.split("/");
    if (!mm || !yy || mm.length < 2 || yy.length < 2) {
      errs.expiry = "Ugyldigt udloebsdato";
    } else {
      const month = parseInt(mm, 10);
      const year = 2000 + parseInt(yy, 10);
      const now = new Date();
      if (month < 1 || month > 12) errs.expiry = "Ugyldig maaned";
      else if (
        year < now.getFullYear() ||
        (year === now.getFullYear() && month < now.getMonth() + 1)
      )
        errs.expiry = "Kortet er udloebet";
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
          <label style={labelStyle()}>Udloebsdato</label>
          <input
            style={inputStyle(!!errors.expiry)}
            type="text"
            inputMode="numeric"
            placeholder="MM/AA"
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
        {loading ? "Behandler betaling..." : "Betal 6.400 kr."}
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
        Demo – ingen rigtig betaling gennemfoeres
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
        <div style={{ marginBottom: "10px" }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="12" fill="rgba(255,255,255,0.15)" />
            <rect x="14" y="8" width="20" height="32" rx="4" stroke="white" strokeWidth="2" fill="none" />
            <rect x="17" y="11" width="14" height="20" rx="2" fill="rgba(255,255,255,0.2)" />
            <path d="M20 35h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M24 18l-3 4h6l-3 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div
          style={{
            fontSize: "22px",
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "-0.02em",
          }}
        >
          MobilePay
        </div>
        <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", marginTop: "4px" }}>
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
          Du modtager en anmodning i MobilePay-appen. Godkend den for at fuldfoere betaling.
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
          Demo – ingen rigtig betaling gennemfoeres
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
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M13.5 2.5c.5-1 1.5-1.7 2.5-1.7-.1 1.1-.6 2.1-1.2 2.8-.6.7-1.5 1.2-2.4 1.1-.1-1 .5-2.1 1.1-2.2zM10.2 5c1-.1 2 .4 2.7 1.1-.7.5-1.8 1.4-1.8 3 0 2 1.8 2.8 1.8 2.8s-1.2 4-3 4c-.8 0-1.1-.5-2-.5-.9 0-1.3.5-2 .5-1.7-.1-3.2-4-3.2-4S1 10.5 1 8.5C1 6 2.7 4.7 4.3 4.7c.9 0 1.7.5 2.3.5.5 0 1.5-.7 2.6-.7.3.1.7.2 1 .5z" fill="white" />
          </svg>
          Pay
        </button>
        <p style={{ fontSize: "13px", color: C.textSec, margin: 0 }}>
          Kun tilgaengelig paa Apple-enheder
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
          <svg width="20" height="20" viewBox="0 0 20 20">
            <path fill="#4285F4" d="M10 8.182v3.636h5.09c-.22 1.273-1.636 3.727-5.09 3.727-3.063 0-5.563-2.527-5.563-5.545s2.5-5.545 5.563-5.545c1.745 0 2.909.745 3.572 1.39l2.436-2.354C14.32 2.09 12.31 1.09 10 1.09 5.09 1.09 1.09 5.09 1.09 10s4 8.91 8.91 8.91c5.136 0 8.545-3.617 8.545-8.71 0-.582-.063-1.027-.145-1.472L10 8.182z" />
          </svg>
          Google Pay
        </button>
        <p style={{ fontSize: "13px", color: C.textSec, margin: 0 }}>
          Demo – ikke tilgaengelig i dette miljoe
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

  function handleMobilePaySuccess() {
    router.push("/success?method=mobilepay");
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "kort", label: "Kort" },
    { key: "mobilepay", label: "MobilePay" },
    { key: "applepay", label: "Apple Pay" },
    { key: "googlepay", label: "Google Pay" },
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
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: C.textMuted }}>
            <LockIcon />
            Sikker betaling
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
                    Starter Webpakke
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
                <span>6.400 kr.</span>
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
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {tab === "kort" && <KortForm onSuccess={handleCardSuccess} />}
              {tab === "mobilepay" && <MobilePayForm onSuccess={handleMobilePaySuccess} />}
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
