// Patch built HTML to use local CSS instead of Tailwind CDN
// - Replaces <script src="https://cdn.tailwindcss.com"></script> with <link rel="stylesheet" href="/css/styles.css" />
// - Removes any inline tailwind.config <script> block
// - Ensures a <link rel="stylesheet" href="/css/styles.css" /> exists in <head>

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(full);
  }
  return files;
}

function patchHtml(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  const cdnScript = /<script\s+src=["']https:\/\/cdn\.tailwindcss\.com["']><\/script>/gi;
  const twConfigBlock = /<script>\s*tailwind\.config[\s\S]*?<\/script>/gi;
  const cssLink = '<link rel="stylesheet" href="/css/styles.css" />';

  let changed = false;

  if (cdnScript.test(html)) {
    html = html.replace(cdnScript, cssLink);
    changed = true;
  }

  if (twConfigBlock.test(html)) {
    html = html.replace(twConfigBlock, '');
    changed = true;
  }

  // Ensure CSS link exists inside <head>
  if (!html.includes('/css/styles.css')) {
    html = html.replace(/<head(.*?)>/i, (m) => `${m}\n  ${cssLink}`);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, html, 'utf8');
    // eslint-disable-next-line no-console
    console.log(`Patched: ${path.relative(distDir, filePath)}`);
  }
}

if (!fs.existsSync(distDir)) {
  console.error('dist folder not found. Run the build first.');
  process.exit(1);
}

const htmlFiles = walk(distDir);
htmlFiles.forEach(patchHtml);

console.log(`Processed ${htmlFiles.length} HTML files.`);
