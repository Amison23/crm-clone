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
const targetFiles = allFiles.filter(f => !f.endsWith('layout.tsx') && !f.replace(/\\/g, '/').endsWith('app/protected/page.tsx'));

targetFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(/<Fragment>/g, '<div className="w-full h-full flex flex-col">');
  content = content.replace(/<\/Fragment>/g, '</div>');

  content = content.replace(/<main\b[^>]*>/g, '<div className="w-full flex-1 relative flex flex-col">');
  content = content.replace(/<\/main>/g, '</div>');

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Cleaned up Fragment wrappers in ${file}`);
});
