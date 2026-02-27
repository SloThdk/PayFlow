const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, 'app/page.tsx'),
  path.join(__dirname, 'app/checkout/page.tsx'),
  path.join(__dirname, 'app/success/page.tsx'),
];

// Map of corrupted → correct Danish chars
const fixes = [
  // Specific words
  ['Koeb nu',                     'Køb nu'],
  ['paakraevet',                  'påkrævet'],
  ['Paakraevet',                  'Påkrævet'],
  ['udloebsdato',                 'udløbsdato'],
  ['Udloebsdato',                 'Udløbsdato'],
  ['udloebe',                     'udløbe'],
  ['Udloebe',                     'Udløbe'],
  ['udloebet',                    'udløbet'],
  ['Udloebet',                    'Udløbet'],
  ['Ugyldigt udl',                'Ugyldig udl'],     // fix gender agreement too
  ['maaned',                      'måned'],
  ['Maaned',                      'Måned'],
  ['gennemfoeres',                'gennemføres'],
  ['gennemfoert',                 'gennemført'],
  ['Gennemfoert',                 'Gennemført'],
  ['gennemfoere',                 'gennemføre'],
  ['fuldfoere',                   'fuldføre'],
  ['fuldfoerelse',                'fuldførelse'],
  ['tilgaengelig',                'tilgængelig'],
  ['Tilgaengelig',                'Tilgængelig'],
  ['bekraeftelse',                'bekræftelse'],
  ['Bekraeftelse',                'Bekræftelse'],
  ['bekraeft',                    'bekræft'],
  ['Bekraeft',                    'Bekræft'],
  [' paa ',                       ' på '],
  [' paa\n',                      ' på\n'],
  ['"paa ',                       '"på '],
  ['miljoe',                      'miljø'],
  ['Miljoe',                      'Miljø'],
  ['MM/AA',                       'MM/ÅÅ'],
  [' aa ',                        ' å '],
  ['Navn er paakr',               'Navn er påkr'],
  // Specific error messages
  ['Navn er p\u00e5kr\u00e6vet',  'Navn er p\u00e5kr\u00e6vet'],  // already correct, skip
  // Demo text
  ['Demo - ingen rigtig betaling gennemfoeres',     'Demo — ingen rigtig betaling gennemføres'],
  ['Demo - ikke tilgaengelig i dette miljoe',        'Demo — ikke tilgængelig i dette miljø'],
  ['Kun tilgaengelig paa Apple-enheder',             'Kun tilgængelig på Apple-enheder'],
  ['Du modtager en anmodning i MobilePay-appen. Godkend den for at fuldfoere betalingen.', 
   'Du modtager en anmodning i MobilePay-appen. Godkend den for at fuldføre betalingen.'],
];

let totalChanges = 0;
files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let c = fs.readFileSync(file, 'utf8');
  const orig = c;
  fixes.forEach(([from, to]) => {
    if (c.includes(from)) { c = c.split(from).join(to); }
  });
  if (c !== orig) {
    fs.writeFileSync(file, c, 'utf8');
    const fileName = file.split(/[/\\]/).pop();
    const changed = c.split('\n').filter((l, i) => l !== orig.split('\n')[i]).length;
    console.log(`Fixed ${fileName}: ${changed} lines changed`);
    totalChanges += changed;
  } else {
    console.log(`No changes: ${file.split(/[/\\]/).pop()}`);
  }
});
console.log(`Total: ${totalChanges} lines fixed`);
