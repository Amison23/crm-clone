import fs from 'fs';
import path from 'path';

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.tsx')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
}

const allFiles = walkSync('./app/protected');
// Exclude layout.tsx and the root dashboard protected/page.tsx
const targetFiles = allFiles.filter(f => !f.endsWith('layout.tsx') && !f.replace(/\\/g, '/').endsWith('app/protected/page.tsx'));

targetFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Strip <aside> fully
  content = content.replace(/<aside\b[^>]*>.*?<\/aside>/s, '');
  // Strip <header> fully
  content = content.replace(/<header\b[^>]*>.*?<\/header>/s, '');
  // Strip <footer> fully
  content = content.replace(/<footer\b[^>]*>.*?<\/footer>/s, '');

  // Replace wrapping divs / main with Fragment or a simple div
  // The layout usually has: <div className="relative flex min-h-screen...">
  content = content.replace(/<div className="relative flex min-h-screen[^>]*>/s, '<Fragment>');
  
  // Replace <main> with <Fragment>
  content = content.replace(/<main className="[^"]*flex-1 lg:ml-64[^"]*">/s, '<Fragment>');
  
  // Replace the closing </main></div> with </Fragment></Fragment>
  content = content.replace(/<\/main>\s*<\/div>\s*<\/>/s, '</Fragment></Fragment></>');
  
  // Make sure Fragment is imported if we use it
  if (content.includes('<Fragment>') && !content.includes('Fragment')) {
    content = 'import { Fragment } from "react";\n' + content;
  }

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Refactored ${file}`);
});
