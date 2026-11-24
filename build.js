const fs = require('fs');
const path = require('path');
const SVGIcons2SVGFontStream = require('svgicons2svgfont').default || require('svgicons2svgfont');
const svg2ttf = require('svg2ttf');

const FONT_NAME = 'Corokia';
const GLYPHS_DIR = path.join(__dirname, 'glyphs');
const FILE_NAME = 'corokia';

const fontStream = new SVGIcons2SVGFontStream({
  fontName: FONT_NAME,
  fontHeight: 1024,
  normalize: false,
  descent: 128,
  prependUnicode: false
});

let svgFontData = '';

fontStream
  .on('data', (chunk) => { svgFontData += chunk; })
  .on('end', () => {
    const ttf = svg2ttf(svgFontData, {
      familyname: FONT_NAME,
      subfamilyname: 'Regular',
      version: 'Version 1.0'
    });
    fs.writeFileSync(`${FILE_NAME}.ttf`, Buffer.from(ttf.buffer));
    console.log(`Created ${FILE_NAME}.ttf`);
  });

const files = fs.readdirSync(GLYPHS_DIR).filter(f => f.endsWith('.svg'));
const existingCodes = new Set();

// Pass 1: Add every SVG file in glyphs/ to its exact uXXXX code point
for (const file of files) {
  const match = file.match(/^u([0-9a-fA-F]{4,6})-(.+)\.svg$/);
  if (!match) continue;

  const codePoint = parseInt(match[1], 16);
  const char = String.fromCodePoint(codePoint);
  const codeHex = codePoint.toString(16).padStart(4, '0');

  existingCodes.add(codePoint);

  const glyph = fs.createReadStream(path.join(GLYPHS_DIR, file));
  glyph.metadata = {
    unicode: [char],
    name: `uni${codeHex}`
  };
  fontStream.write(glyph);
}

// Pass 2: For any uppercase A-Z / ÅÄÖ whose lowercase SVG doesn't exist yet, reuse uppercase
for (const file of files) {
  const match = file.match(/^u([0-9a-fA-F]{4,6})-(.+)\.svg$/);
  if (!match) continue;

  const char = String.fromCodePoint(parseInt(match[1], 16));
  if (!/^[A-ZÅÄÖ]$/.test(char)) continue;

  const lowerChar = char.toLowerCase();
  const lowerCode = lowerChar.codePointAt(0);
  if (existingCodes.has(lowerCode)) continue;

  const codeHex = lowerCode.toString(16).padStart(4, '0');
  const glyph = fs.createReadStream(path.join(GLYPHS_DIR, file));
  glyph.metadata = {
    unicode: [lowerChar],
    name: `uni${codeHex}`
  };
  fontStream.write(glyph);
}

fontStream.end();
