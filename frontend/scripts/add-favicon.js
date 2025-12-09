const fs = require('fs');
const path = require('path');

const faviconLink = '    <link rel="icon" type="image/svg+xml" href="/favicon.svg">\n';

function getAllHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

const srcDir = path.join(__dirname, '../src');
const htmlFiles = getAllHtmlFiles(srcDir);

let updated = 0;
let skipped = 0;

htmlFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Skip if favicon already exists
  if (content.includes('favicon.svg') || content.includes('rel="icon"')) {
    skipped++;
    return;
  }
  
  // Find <title> tag and add favicon after it
  const titleMatch = content.match(/(<title>.*?<\/title>)/);
  if (titleMatch) {
    const newContent = content.replace(
      titleMatch[0],
      titleMatch[0] + '\n' + faviconLink
    );
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('✓ Updated:', path.relative(srcDir, file));
    updated++;
  }
});

console.log(`\nTotal: ${updated} updated, ${skipped} skipped`);
