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
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 10.5pt; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; }
  h1 { font-size: 20pt; color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 24px; page-break-after: avoid; }
  h2 { font-size: 14pt; color: #334155; margin-top: 22px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; page-break-after: avoid; }
  h3 { font-size: 12pt; color: #475569; margin-top: 16px; page-break-after: avoid; }
  h4 { font-size: 11pt; margin-top: 12px; page-break-after: avoid; }
  p { margin: 8px 0; text-align: justify; }
  li { margin: 4px 0; }
  ul, ol { padding-left: 20px; margin: 8px 0; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 9.5pt; page-break-inside: avoid; }
  th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #f1f5f9; font-weight: 600; }
  code { font-family: Menlo, Monaco, monospace; font-size: 9pt; background: #f1f5f9; padding: 1px 4px; border-radius: 3px; }
  pre { font-family: Menlo, Monaco, monospace; font-size: 8.5pt; background: #f8fafc; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; white-space: pre-wrap; word-break: break-word; page-break-inside: avoid; }
  pre code { background: none; padding: 0; }
  blockquote { border-left: 3px solid #6366f1; margin: 10px 0; padding: 6px 14px; background: #f8fafc; color: #475569; font-size: 10pt; }
  hr { border: none; border-top: 1px solid #e2e8f0; margin: 20px 0; }
  img { max-width: 100%; height: auto; max-height: 280px; object-fit: contain; border: 1px solid #e2e8f0; border-radius: 6px; display: block; margin: 10px auto; page-break-inside: avoid; }
  strong { color: #0f172a; }
  em { color: #64748b; }
  .cover { text-align: center; padding: 80px 20px 60px; page-break-after: always; }
  .cover h1 { border: none; font-size: 26pt; margin-bottom: 8px; }
  .cover .subtitle { font-size: 14pt; color: #64748b; margin: 4px 0; }
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
<div class="cover">
  <h1>TaskFlow</h1>
  <p class="subtitle"><strong>Industry Practice Project Report</strong></p>
  <p class="subtitle">Full-Stack Task Manager Application</p>
  <p class="subtitle">Student: Alkhan Almas</p>
  <p class="subtitle">http://localhost:3000</p>
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
