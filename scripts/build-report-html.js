const fs = require('fs');
const path = require('path');

const screenshotsDir = path.join(__dirname, '../screenshots');
const reportMd = fs.readFileSync(path.join(__dirname, '../REPORT.md'), 'utf8');
const shots = fs.readdirSync(screenshotsDir).filter((f) => f.endsWith('.png')).sort();

const toBase64 = (file) => {
  const buf = fs.readFileSync(path.join(screenshotsDir, file));
  return `data:image/png;base64,${buf.toString('base64')}`;
};

const titles = {
  '01-sign-in.png': 'Sign In Page',
  '02-sign-up.png': 'Sign Up Page',
  '03-tasks-dashboard.png': 'Tasks Dashboard',
  '04-tasks-with-data.png': 'Tasks with Data',
  '05-search-and-filter.png': 'Search and Filtering',
  '06-categories.png': 'Categories Page',
  '07-profile.png': 'Profile Page',
  '08-dark-mode.png': 'Dark Mode',
  '09-mobile-view.png': 'Mobile Responsive View',
  '10-tasks-live.png': 'Tasks Page (Live — User Session)',
  '11-profile-live.png': 'Profile Page (Live — User Session)',
};

const gallery = shots
  .map((file) => {
    const title = titles[file] || file;
    return `
    <figure class="shot">
      <img src="${toBase64(file)}" alt="${title}" />
      <figcaption>${title}</figcaption>
    </figure>`;
  })
  .join('\n');

const mdHtml = reportMd
  .split('\n')
  .map((line) => {
    if (line.startsWith('# ')) return `<h1>${line.slice(2)}</h1>`;
    if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`;
    if (line.startsWith('### ')) return `<h3>${line.slice(4)}</h3>`;
    if (line.startsWith('#### ')) return `<h4>${line.slice(5)}</h4>`;
    if (line.startsWith('![')) return '';
    if (line.startsWith('```')) return '';
    if (line.startsWith('|')) return `<p>${line}</p>`;
    if (line.trim() === '---') return '<hr />';
    if (line.trim() === '') return '';
    return `<p>${line}</p>`;
  })
  .join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Planora — Industry Practice Project Report</title>
  <style>
    body { font-family: Inter, -apple-system, sans-serif; max-width: 900px; margin: 0 auto; padding: 2rem; color: #0f172a; line-height: 1.6; }
    h1 { color: #6366f1; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
    h2 { margin-top: 2rem; color: #334155; }
    h3 { color: #475569; }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 2rem 0; }
    .gallery { display: grid; gap: 2rem; margin: 2rem 0; }
    .shot { margin: 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .shot img { width: 100%; display: block; }
    .shot figcaption { padding: 0.75rem 1rem; background: #f8fafc; font-weight: 600; font-size: 0.9rem; }
    @media print { body { padding: 1rem; } .shot { break-inside: avoid; } }
  </style>
</head>
<body>
  <h1>Planora — Industry Practice Project Report</h1>
  <p><strong>With embedded screenshots</strong> — open this file in a browser and use Print → Save as PDF.</p>
  <hr />
  <h2>5. Key Features Screenshots</h2>
  <div class="gallery">${gallery}</div>
  <hr />
  <p><em>Full text report: see REPORT.md in the project folder.</em></p>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, '../REPORT_WITH_IMAGES.html'), html);
console.log('Created REPORT_WITH_IMAGES.html with', shots.length, 'embedded images');
