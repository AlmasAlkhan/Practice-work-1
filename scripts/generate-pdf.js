const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { marked } = require('marked');

const ROOT = path.join(__dirname, '..');
const SHOTS = path.join(ROOT, 'screenshots');
const OUT_PDF = path.join(ROOT, 'REPORT.pdf');

function embedImages(html) {
  return html.replace(
    /src="screenshots\/([^"]+)"/g,
    (_, file) => {
      const p = path.join(SHOTS, file);
      if (!fs.existsSync(p)) return `src=""`;
      const b64 = fs.readFileSync(p).toString('base64');
      return `src="data:image/png;base64,${b64}"`;
    }
  );
}

const CSS = `
  @page { margin: 16mm 14mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 10.5pt; line-height: 1.6; color: #1e1b4b; margin: 0; padding: 0; background: #faf5ff; }
  .doc-topbar {
    background: linear-gradient(135deg, #6d28d9 0%, #9333ea 50%, #c026d3 100%);
    color: #fff;
    text-align: center;
    padding: 14px 20px;
    font-size: 9pt;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 0;
  }
  h1 { font-size: 20pt; color: #6d28d9; border-bottom: 2px solid #ddd6fe; padding-bottom: 6px; margin-top: 24px; page-break-after: avoid; }
  h2 { font-size: 14pt; color: #5b21b6; margin-top: 22px; border-bottom: 1px solid #ddd6fe; padding-bottom: 4px; page-break-after: avoid; }
  h3 { font-size: 12pt; color: #7c3aed; margin-top: 16px; page-break-after: avoid; }
  h4 { font-size: 11pt; margin-top: 12px; page-break-after: avoid; }
  p { margin: 8px 0; text-align: justify; }
  li { margin: 4px 0; }
  ul, ol { padding-left: 20px; margin: 8px 0; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 9.5pt; page-break-inside: avoid; }
  th, td { border: 1px solid #ddd6fe; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #ede9fe; font-weight: 600; color: #5b21b6; }
  tr:nth-child(even) td { background: #faf5ff; }
  code { font-family: Menlo, Monaco, monospace; font-size: 9pt; background: #ede9fe; color: #6d28d9; padding: 1px 4px; border-radius: 3px; }
  pre { font-family: Menlo, Monaco, monospace; font-size: 8.5pt; background: #f5f3ff; padding: 10px; border: 1px solid #ddd6fe; border-left: 3px solid #7c3aed; border-radius: 6px; white-space: pre-wrap; word-break: break-word; page-break-inside: avoid; }
  pre code { background: none; color: inherit; padding: 0; }
  blockquote { border-left: 3px solid #7c3aed; margin: 10px 0; padding: 6px 14px; background: #f5f3ff; color: #5b21b6; font-size: 10pt; }
  hr { border: none; border-top: 1px solid #ddd6fe; margin: 20px 0; }
  img { max-width: 100%; height: auto; max-height: 280px; object-fit: contain; border: 1px solid #ddd6fe; border-radius: 8px; display: block; margin: 10px auto; page-break-inside: avoid; }
  strong { color: #4c1d95; }
  em { color: #7c6a9a; }
  a { color: #7c3aed; }
  .cover {
    text-align: center;
    padding: 0 20px 60px;
    page-break-after: always;
    background: linear-gradient(180deg, #f5f3ff 0%, #fff 40%);
  }
  .cover-band {
    background: linear-gradient(135deg, #6d28d9 0%, #9333ea 50%, #c026d3 100%);
    color: #fff;
    padding: 28px 20px;
    margin: 0 -20px 40px;
    font-size: 10pt;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .cover h1 {
    border: none;
    font-size: 32pt;
    margin-bottom: 8px;
    background: linear-gradient(135deg, #6d28d9, #c026d3);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .cover .subtitle { font-size: 13pt; color: #5b21b6; margin: 6px 0; }
  .cover .meta-grid {
    display: inline-grid;
    grid-template-columns: auto auto;
    gap: 8px 24px;
    text-align: left;
    margin-top: 32px;
    padding: 20px 28px;
    background: #fff;
    border: 1px solid #ddd6fe;
    border-radius: 12px;
    border-top: 4px solid #7c3aed;
    font-size: 10pt;
  }
  .cover .meta-grid strong { color: #6d28d9; }
  .meta-header { grid-column: 1 / -1; text-align: center; font-weight: 700; color: #6d28d9; margin-bottom: 8px; font-size: 11pt; }
`;

(async () => {
  let md = fs.readFileSync(path.join(ROOT, 'REPORT.md'), 'utf8');
  md = md.replace(/^> All screenshots.*\n> For a PDF.*\n\n/m, '');

  let bodyHtml = marked.parse(md);
  bodyHtml = embedImages(bodyHtml);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>TaskFlow — Industry Practice Project Report</title>
<style>${CSS}</style>
</head>
<body>
<div class="doc-topbar">Industry Practice Project · Military Practice Students · 2026</div>
<div class="cover">
  <div class="cover-band">Full-Stack Task Manager Application</div>
  <h1>TaskFlow</h1>
  <p class="subtitle"><strong>Industry Practice Project Report</strong></p>
  <p class="subtitle">Violet UI Theme · Node.js · MongoDB · JWT</p>
  <div class="meta-grid">
    <span class="meta-header">Project Information</span>
    <strong>Student</strong><span>Alkhan Almas</span>
    <strong>Date</strong><span>June 28, 2026</span>
    <strong>Deployment</strong><span>taskflow-alkhan.onrender.com</span>
    <strong>GitHub</strong><span>AlmasAlkhan/Practice-work-1</span>
  </div>
</div>
${bodyHtml}
</body>
</html>`;

  const tmpHtml = path.join(ROOT, '.report-print.html');
  fs.writeFileSync(tmpHtml, html);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`file://${tmpHtml}`, { waitUntil: 'networkidle' });
  await page.pdf({
    path: OUT_PDF,
    format: 'A4',
    printBackground: true,
    margin: { top: '12mm', bottom: '14mm', left: '10mm', right: '10mm' },
  });
  await browser.close();
  fs.unlinkSync(tmpHtml);

  const pages = Math.round(fs.statSync(OUT_PDF).size / 1024);
  console.log(`PDF created: ${OUT_PDF} (~${pages} KB, full REPORT.md content)`);
})();
