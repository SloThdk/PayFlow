const fs = require('fs');

// ─── checkout/page.tsx ──────────────────────────────────────────────────────
const checkoutFile = __dirname + '/app/checkout/page.tsx';
let c = fs.readFileSync(checkoutFile, 'utf8');
const origCheckout = c;

// 1. VisaLogo component → img
c = c.replace(
`function VisaLogo() {
  return (
    <svg width="36" height="24" viewBox="0 0 36 24" fill="none">
      <rect width="36" height="24" rx="4" fill="#1A1F71" />
      <path
        d="M14.5 17H12l-2-7h2.3l1.2 5 1.3-5H17L14.5 17zm4 0h-2.2l2.2-7h2.2L18.5 17zm6.5-7l-.5 1.5s-.5-.8-1.3-.8c-.7 0-1 .4-1 .8 0 .5.6.7 1.4 1.2 1 .6 1.5 1.2 1.5 2.1 0 1.4-1.2 2.3-2.9 2.3-1.1 0-2-.5-2-.5l.4-1.6s.8.7 1.8.7c.6 0 1-.3 1-.7 0-.5-.5-.7-1.3-1.2-1-.6-1.5-1.3-1.5-2.1 0-1.3 1.1-2.2 2.8-2.2.9 0 1.7.4 1.7.4L25 10z"
        fill="white"
      />
    </svg>
  );
}`,
`function VisaLogo() {
  return <img src="/icons/Visa.png" alt="Visa" style={{ height: '24px', width: 'auto', display: 'block' }} />;
}`
);

// 2. MobilePay branding section: blue box with inline SVG + text → use PNG
c = c.replace(
`      {/* MobilePay logo */}
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
        </div>`,
`      {/* MobilePay logo */}
        <img src="/icons/MobilePay.png" alt="MobilePay" style={{ height: '64px', width: 'auto', marginBottom: '8px' }} />
        <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)" }}>
          Betal med MobilePay
        </div>`
);

// 3. Apple Pay tab button SVG → PNG
c = c.replace(
`          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M13.5 2.5c.5-1 1.5-1.7 2.5-1.7-.1 1.1-.6 2.1-1.2 2.8-.6.7-1.5 1.2-2.4 1.1-.1-1 .5-2.1 1.1-2.2zM10.2 5c1-.1 2 .4 2.7 1.1-.7.5-1.8 1.4-1.8 3 0 2 1.8 2.8 1.8 2.8s-1.2 4-3 4c-.8 0-1.1-.5-2-.5-.9 0-1.3.5-2 .5-1.7-.1-3.2-4-3.2-4S1 10.5 1 8.5C1 6 2.7 4.7 4.3 4.7c.9 0 1.7.5 2.3.5.5 0 1.5-.7 2.6-.7.3.1.7.2 1 .5z" fill="white" />
          </svg>
          Pay`,
`          <img src="/icons/ApplePay.png" alt="Apple Pay" style={{ height: '28px', width: 'auto' }} />`
);

// 4. Google Pay tab button SVG → PNG
c = c.replace(
`          <svg width="20" height="20" viewBox="0 0 20 20">
            <path fill="#4285F4" d="M10 8.182v3.636h5.09c-.22 1.273-1.636 3.727-5.09 3.727-3.063 0-5.563-2.527-5.563-5.545s2.5-5.545 5.563-5.545c1.745 0 2.909.745 3.572 1.39l2.436-2.354C14.32 2.09 12.31 1.09 10 1.09 5.09 1.09 1.09 5.09 1.09 10s4 8.91 8.91 8.91c5.136 0 8.545-3.617 8.545-8.71 0-.582-.063-1.027-.145-1.472L10 8.182z" />
          </svg>
          Google Pay`,
`          <img src="/icons/GooglePay.png" alt="Google Pay" style={{ height: '28px', width: 'auto' }} />`
);

// 5. Update tab labels to show icons + text for MobilePay/ApplePay/GooglePay
// Replace the simple tabs array with icon-enhanced version
c = c.replace(
`  const tabs: { key: Tab; label: string }[] = [
    { key: "kort", label: "Kort" },
    { key: "mobilepay", label: "MobilePay" },
    { key: "applepay", label: "Apple Pay" },
    { key: "googlepay", label: "Google Pay" },
  ];`,
`  const tabs: { key: Tab; label: string; icon?: string }[] = [
    { key: "kort", label: "Kort" },
    { key: "mobilepay", label: "MobilePay", icon: "/icons/MobilePay.png" },
    { key: "applepay", label: "Apple Pay", icon: "/icons/ApplePay.png" },
    { key: "googlepay", label: "Google Pay", icon: "/icons/GooglePay.png" },
  ];`
);

// 6. Update the tab button render to show icon when available
c = c.replace(
`                    {t.label}`,
`                    {t.icon
                        ? <img src={t.icon} alt={t.label} style={{ height: '18px', width: 'auto', display: 'block', margin: '0 auto' }} />
                        : t.label}`
);

if (c !== origCheckout) {
  fs.writeFileSync(checkoutFile, c, 'utf8');
  console.log('PayFlow checkout/page.tsx icons updated');
} else {
  console.log('No changes to checkout - checking patterns...');
  if (c.includes('fill="#1A1F71"')) console.log('  VisaLogo still has old SVG');
  if (c.includes('MobilePay logo')) console.log('  MobilePay logo section still old');
}

// ─── app/page.tsx ────────────────────────────────────────────────────────────
const mainFile = __dirname + '/app/page.tsx';
let m = fs.readFileSync(mainFile, 'utf8');
const origMain = m;

// Add Stripe + MobilePay logos to "Sikker betaling via Stripe og MobilePay" line
m = m.replace(
  `Sikker betaling via Stripe og MobilePay`,
  `PAYMENT_ICONS_PLACEHOLDER`
);

// Actually just add a payment icons row to the product card, below the security note line
// Find the security note text and add logos
// The product page shows "Sikker betaling via Stripe og MobilePay"
// Replace the security div at the bottom of the product card with a nicer version with real icons
m = m.replace('PAYMENT_ICONS_PLACEHOLDER', 'Sikker betaling via Stripe og MobilePay');

// Instead, let's add a payment logos row above the CTA button  
// Find the price section and add after the divider before features
// Actually the best place is below the features list, above the price
// Let's add a "Godkendte betalingsmetoder" row below the CTA button

m = m.replace(
  `<LockIcon />
              <span style={{ fontSize: "12px", color: C.textMuted }}>
                Sikker betaling via Stripe og MobilePay
              </span>`,
  `<img src="/icons/SSL_SECURED.png" alt="SSL Secured" style={{ height: '22px', width: 'auto' }} />
              <span style={{ fontSize: "11px", color: C.textMuted, marginLeft: "4px" }}>Sikker betaling</span>
              <div style={{ marginLeft: "auto", display: "flex", gap: "6px", alignItems: "center" }}>
                <img src="/icons/Stripe.png" alt="Stripe" style={{ height: '18px', width: 'auto', opacity: 0.7 }} />
                <img src="/icons/MobilePay.png" alt="MobilePay" style={{ height: '18px', width: 'auto', opacity: 0.7 }} />
              </div>`
);

if (m !== origMain) {
  fs.writeFileSync(mainFile, m, 'utf8');
  console.log('PayFlow app/page.tsx icons updated');
} else {
  console.log('No changes to main page');
}
