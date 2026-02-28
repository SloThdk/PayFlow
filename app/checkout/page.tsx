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
    else if (!luhn(rawCard)) errs.card = "Card numberet er ugyldigt";

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
        <label style={labelStyle()}>Cardholder name</label>
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
          <label style={labelStyle()}>Expiry date</label>
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
        {loading ? "Behandler betaling..." : "Betal $186.25"}
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
    <div style={{ textAlign: "center", padding: "24px 0" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        <button disabled style={{ background: "#000", color: "#fff", border: "none", borderRadius: "12px", padding: "18px 48px", fontSize: "15px", fontWeight: 600, cursor: "not-allowed", display: "flex", alignItems: "center", gap: "10px", fontFamily: "inherit", opacity: 0.85 }}>
          <svg width="50" height="22" viewBox="0 0 50 22" fill="none"><path d="M9.4 3.7c-.6.7-1.5 1.3-2.5 1.2-.1-1 .4-2 .9-2.7C8.4 1.5 9.5.9 10.4.8c.1 1-.3 2-.9 2.7L9.4 3.7zm.9 1.4c-1.4-.1-2.6.8-3.2.8-.7 0-1.7-.7-2.8-.7C2.9 5.2 1.5 6 .8 7.4c-1.5 2.7-.4 6.6 1.1 8.8.7 1.1 1.6 2.3 2.8 2.2 1.1 0 1.5-.7 2.8-.7 1.3 0 1.7.7 2.8.7 1.2 0 2-1 2.8-2.1.9-1.2 1.2-2.4 1.2-2.5 0 0-2.4-1-2.4-3.8 0-2.3 1.9-3.5 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8h-.1zM20.4 2c3.8 0 6.4 2.6 6.4 6.4 0 3.9-2.7 6.5-6.5 6.5h-4.2v6.7h-3V2h7.3zm-4.3 10.3h3.5c2.6 0 4.1-1.4 4.1-3.9s-1.5-3.9-4.1-3.9h-3.5v7.8zm12.2 3.5c0-2.5 1.9-4.1 5.4-4.2l4-.2v-1.1c0-1.6-1.1-2.6-2.8-2.6-1.7 0-2.8.9-3 2.2h-2.7c.1-2.7 2.3-4.7 5.8-4.7 3.4 0 5.6 1.8 5.6 4.6v9.8h-2.8v-2.4h-.1c-.8 1.6-2.6 2.7-4.5 2.7-2.8 0-4.8-1.8-4.8-4.2l-.1.1zm9.5-1.3v-1.2l-3.6.2c-1.8.1-2.8.9-2.8 2.2 0 1.3 1.1 2.1 2.7 2.1 2.1 0 3.7-1.5 3.7-3.3zm5 8.6v-2.3c.2 0 .7.1 1 .1 1.4 0 2.2-.6 2.7-2.1l.3-.9-5.2-14.4h3.1l3.7 11.9h.1l3.7-11.9h3L46 20.7c-1.2 3.3-2.5 4.4-5.4 4.4-.3 0-.9 0-1.2-.1h.4z" fill="white"/></svg>
        </button>
        <div style={{ background: "rgba(99,91,255,0.06)", border: "1px solid rgba(99,91,255,0.15)", borderRadius: "10px", padding: "14px 20px", maxWidth: "360px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", marginBottom: "6px" }}>
            <span style={{ background: C.accentDim, color: C.accent, fontSize: "9px", fontWeight: 700, padding: "2px 8px", borderRadius: "100px", letterSpacing: "0.06em" }}>DEMO</span>
            <span style={{ fontSize: "12px", fontWeight: 600, color: C.textSec }}>Available on iOS devices</span>
          </div>
          <p style={{ fontSize: "11px", color: C.textMuted, margin: 0, lineHeight: 1.5 }}>In production, Apple Pay triggers natively on iPhone, iPad, and Mac with Touch ID or Face ID.</p>
        </div>
      </div>
    </div>
  );
}

// --- Google Pay tab ---
function GooglePayTab() {
  return (
    <div style={{ textAlign: "center", padding: "24px 0" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        <button disabled style={{ background: "#fff", color: "#3c4043", border: "1px solid #dadce0", borderRadius: "12px", padding: "18px 48px", fontSize: "15px", fontWeight: 600, cursor: "not-allowed", display: "flex", alignItems: "center", gap: "10px", fontFamily: "inherit", opacity: 0.85 }}>
          <svg width="60" height="24" viewBox="0 0 120 48" fill="none"><path d="M57.2 24.6V37h-3.2V12.8h8.5c2.1 0 3.9.7 5.4 2.1 1.5 1.4 2.3 3.1 2.3 5.1 0 2.1-.8 3.8-2.3 5.2-1.4 1.4-3.2 2-5.4 2h-5.3v-2.6zm0-9.2v6.5h5.4c1.2 0 2.3-.4 3.1-1.3.9-.9 1.3-1.9 1.3-3.1 0-1.1-.4-2.1-1.3-2.9-.8-.9-1.9-1.3-3.1-1.3h-5.4v.1z" fill="#4285F4"/><path d="M76.5 19.9c2.4 0 4.2.6 5.6 1.9 1.4 1.3 2.1 3.1 2.1 5.3V37h-3.1v-2.2h-.1c-1.3 1.8-3 2.7-5.2 2.7-1.8 0-3.4-.5-4.6-1.6-1.2-1.1-1.8-2.5-1.8-4.1 0-1.8.7-3.2 2-4.2 1.3-1 3.1-1.5 5.3-1.5 1.9 0 3.5.3 4.6 1v-.7c0-1.2-.5-2.3-1.4-3.1-1-.9-2.1-1.3-3.3-1.3-1.9 0-3.4.8-4.5 2.4l-2.8-1.8c1.6-2.3 3.9-3.5 7.1-3.5l.1-.2zm-4 12c0 .9.4 1.7 1.1 2.3.7.6 1.6.9 2.6.9 1.4 0 2.7-.5 3.7-1.6 1.1-1.1 1.7-2.3 1.7-3.8-1-.8-2.4-1.1-4.2-1.1-1.3 0-2.4.3-3.2.9-.9.6-1.4 1.4-1.4 2.4h-.3zm17.9 8.2l-6.6-16.8h3.4l4.7 12.7h.1l4.6-12.7h3.3L93 43.5h-3.3l2.7-6.5v3.1z" fill="#4285F4"/><path d="M39.5 24.5c0-1.2-.1-2.3-.3-3.4H20.3v6.4h10.8c-.5 2.5-1.9 4.6-4 6v5h6.5c3.8-3.5 5.9-8.6 5.9-14z" fill="#4285F4"/><path d="M20.3 42c5.4 0 9.9-1.8 13.2-4.8l-6.5-5c-1.8 1.2-4.1 1.9-6.8 1.9-5.2 0-9.6-3.5-11.2-8.2H2.3v5.2C5.7 37.8 12.5 42 20.3 42z" fill="#34A853"/><path d="M9.1 25.8c-.4-1.2-.6-2.5-.6-3.8 0-1.3.2-2.6.6-3.8v-5.2H2.3C.8 15.4 0 18.1 0 21s.8 5.6 2.3 8l6.8-5.2z" fill="#FBBC05"/><path d="M20.3 9c2.9 0 5.6 1 7.6 3l5.7-5.7C30.2 3 25.7.8 20.3.8 12.5.8 5.7 5 2.3 11.6l6.8 5.2c1.5-4.7 6-8.2 11.2-8.2v.4z" fill="#EA4335"/></svg>
        </button>
        <div style={{ background: "rgba(99,91,255,0.06)", border: "1px solid rgba(99,91,255,0.15)", borderRadius: "10px", padding: "14px 20px", maxWidth: "360px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", marginBottom: "6px" }}>
            <span style={{ background: C.accentDim, color: C.accent, fontSize: "9px", fontWeight: 700, padding: "2px 8px", borderRadius: "100px", letterSpacing: "0.06em" }}>DEMO</span>
            <span style={{ fontSize: "12px", fontWeight: 600, color: C.textSec }}>Available on Android devices</span>
          </div>
          <p style={{ fontSize: "11px", color: C.textMuted, margin: 0, lineHeight: 1.5 }}>In production, Google Pay launches on any Android phone or Chrome browser with saved payment methods.</p>
        </div>
      </div>
    </div>
  );
}

// --- Main checkout page ---
export default function CheckoutPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("kort");

  function handleCardSuccess() {
    router.push("/success?method=card");
  }
  const tabs: { key: Tab; label: string; svg?: React.ReactNode }[] = [
    { key: "kort", label: "Card" },
    { key: "applepay", label: "Apple Pay", svg: <svg width="36" height="14" viewBox="0 0 50 22" fill="none"><path d="M9.4 3.7c-.6.7-1.5 1.3-2.5 1.2-.1-1 .4-2 .9-2.7C8.4 1.5 9.5.9 10.4.8c.1 1-.3 2-.9 2.7L9.4 3.7zm.9 1.4c-1.4-.1-2.6.8-3.2.8-.7 0-1.7-.7-2.8-.7C2.9 5.2 1.5 6 .8 7.4c-1.5 2.7-.4 6.6 1.1 8.8.7 1.1 1.6 2.3 2.8 2.2 1.1 0 1.5-.7 2.8-.7 1.3 0 1.7.7 2.8.7 1.2 0 2-1 2.8-2.1.9-1.2 1.2-2.4 1.2-2.5 0 0-2.4-1-2.4-3.8 0-2.3 1.9-3.5 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8h-.1zM20.4 2c3.8 0 6.4 2.6 6.4 6.4 0 3.9-2.7 6.5-6.5 6.5h-4.2v6.7h-3V2h7.3zm-4.3 10.3h3.5c2.6 0 4.1-1.4 4.1-3.9s-1.5-3.9-4.1-3.9h-3.5v7.8zm12.2 3.5c0-2.5 1.9-4.1 5.4-4.2l4-.2v-1.1c0-1.6-1.1-2.6-2.8-2.6-1.7 0-2.8.9-3 2.2h-2.7c.1-2.7 2.3-4.7 5.8-4.7 3.4 0 5.6 1.8 5.6 4.6v9.8h-2.8v-2.4h-.1c-.8 1.6-2.6 2.7-4.5 2.7-2.8 0-4.8-1.8-4.8-4.2l-.1.1zm9.5-1.3v-1.2l-3.6.2c-1.8.1-2.8.9-2.8 2.2 0 1.3 1.1 2.1 2.7 2.1 2.1 0 3.7-1.5 3.7-3.3zm5 8.6v-2.3c.2 0 .7.1 1 .1 1.4 0 2.2-.6 2.7-2.1l.3-.9-5.2-14.4h3.1l3.7 11.9h.1l3.7-11.9h3L46 20.7c-1.2 3.3-2.5 4.4-5.4 4.4-.3 0-.9 0-1.2-.1h.4z" fill="currentColor"/></svg> },
    { key: "googlepay", label: "Google Pay", svg: <svg width="42" height="16" viewBox="0 0 120 48" fill="none"><path d="M57.2 24.6V37h-3.2V12.8h8.5c2.1 0 3.9.7 5.4 2.1 1.5 1.4 2.3 3.1 2.3 5.1 0 2.1-.8 3.8-2.3 5.2-1.4 1.4-3.2 2-5.4 2h-5.3v-2.6zm0-9.2v6.5h5.4c1.2 0 2.3-.4 3.1-1.3.9-.9 1.3-1.9 1.3-3.1 0-1.1-.4-2.1-1.3-2.9-.8-.9-1.9-1.3-3.1-1.3h-5.4v.1z" fill="#4285F4"/><path d="M76.5 19.9c2.4 0 4.2.6 5.6 1.9 1.4 1.3 2.1 3.1 2.1 5.3V37h-3.1v-2.2h-.1c-1.3 1.8-3 2.7-5.2 2.7-1.8 0-3.4-.5-4.6-1.6-1.2-1.1-1.8-2.5-1.8-4.1 0-1.8.7-3.2 2-4.2 1.3-1 3.1-1.5 5.3-1.5 1.9 0 3.5.3 4.6 1v-.7c0-1.2-.5-2.3-1.4-3.1-1-.9-2.1-1.3-3.3-1.3-1.9 0-3.4.8-4.5 2.4l-2.8-1.8c1.6-2.3 3.9-3.5 7.1-3.5l.1-.2z" fill="#4285F4"/><path d="M39.5 24.5c0-1.2-.1-2.3-.3-3.4H20.3v6.4h10.8c-.5 2.5-1.9 4.6-4 6v5h6.5c3.8-3.5 5.9-8.6 5.9-14z" fill="#4285F4"/><path d="M20.3 42c5.4 0 9.9-1.8 13.2-4.8l-6.5-5c-1.8 1.2-4.1 1.9-6.8 1.9-5.2 0-9.6-3.5-11.2-8.2H2.3v5.2C5.7 37.8 12.5 42 20.3 42z" fill="#34A853"/><path d="M9.1 25.8c-.4-1.2-.6-2.5-.6-3.8 0-1.3.2-2.6.6-3.8v-5.2H2.3C.8 15.4 0 18.1 0 21s.8 5.6 2.3 8l6.8-5.2z" fill="#FBBC05"/><path d="M20.3 9c2.9 0 5.6 1 7.6 3l5.7-5.7C30.2 3 25.7.8 20.3.8 12.5.8 5.7 5 2.3 11.6l6.8 5.2c1.5-4.7 6-8.2 11.2-8.2v.4z" fill="#EA4335"/></svg> },
  ];

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ minHeight: "100vh", background: C.bg }}>
        {/* Demo banner */}
        <div style={{ background: "rgba(99,91,255,0.06)", borderBottom: "1px solid rgba(99,91,255,0.15)", padding: "14px 24px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
            <span style={{ background: C.accentDim, color: C.accent, fontSize: "9px", fontWeight: 700, padding: "3px 10px", borderRadius: "100px", letterSpacing: "0.06em" }}>DEMO</span>
            <span style={{ fontSize: "12px", color: C.textSec, lineHeight: 1.5 }}>This is a live demo of a custom payment flow. Every element — colors, typography, layout, and branding — is built from scratch to match your exact brand identity. No templates. No limitations.</span>
          </div>
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
              Your Order
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
                    Example Product
                  </div>
                  <div style={{ fontSize: "13px", color: C.textSec, marginTop: "2px" }}>
                    Your Brand
                  </div>
                </div>
                <div style={{ fontWeight: 600, fontSize: "15px" }}>$149.00</div>
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
                <span>$149.00</span>
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
                <span>Tax (25%)</span>
                <span>$37.25</span>
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
                <span>$186.25</span>
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
                One-time payment — no subscriptions
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
              Payment Method
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
                    {t.svg ? t.svg : t.label}
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

        {/* Your Design callout */}
        <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 24px 80px", textAlign: "center" }}>
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "56px" }}>
            <div style={{ position: "relative", display: "inline-block", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, letterSpacing: "-0.04em", background: "linear-gradient(135deg, #635BFF 0%, #E040FB 35%, #FF6D00 65%, #00E676 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", lineHeight: 1.1 }}>Your Design</h2>
            </div>
            <p style={{ fontSize: "16px", color: C.textSec, maxWidth: "520px", margin: "0 auto 28px", lineHeight: 1.7 }}>
              This is a demo of how a payment flow looks when built from scratch. Every color, font, layout, and interaction is fully customizable to match your brand identity.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
              {["#635BFF", "#E040FB", "#FF6D00", "#00E676", "#00B0FF", "#FFD600"].map(c => (
                <div key={c} style={{ width: "40px", height: "40px", borderRadius: "50%", background: c, border: "2px solid rgba(255,255,255,0.1)", boxShadow: `0 4px 16px ${c}44` }} />
              ))}
            </div>
            <p style={{ fontSize: "13px", color: C.textMuted, marginTop: "16px" }}>No templates. No platform limitations. Just your brand.</p>
          </div>
        </div>

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
            backdropFilter: "blur(8px)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            zIndex: 100,
          }}
        >
          Built by Sloth Studio
        </a>
      </div>
    </>
  );
}
