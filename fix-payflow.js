const fs = require('fs');
const file = __dirname + '/app/page.tsx';
let c = fs.readFileSync(file, 'utf8');
const original = c;

// Fix floating attribution URL
c = c.replace('href="https://slothstudio.dk"', 'href="https://sloth-studio.pages.dev"');

// Fix attribution text to match other sites
c = c.replace('>Bygget af Sloth Studio</a>', '>Built by Sloth Studio \u2192</a>');

// Add brand customization note card below the product card, before </div></div></main>
const insertBefore = `        </div>
      </main>`;

const brandNote = `        </div>

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
      </main>`;

c = c.replace(insertBefore, brandNote);

if (c !== original) {
  fs.writeFileSync(file, c, 'utf8');
  console.log('PayFlow fixed.');
  console.log('  - Attribution URL: sloth-studio.pages.dev');
  console.log('  - Brand customization note added below product card');
} else {
  console.log('No changes - checking patterns...');
  // Debug
  const idx = c.indexOf('</div>\n      </main>');
  console.log('Pattern found at index:', idx);
}
