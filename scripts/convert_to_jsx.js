const fs = require('fs');
const path = require('path');

const SCREENS_DIR = './stitch_screens';
const OUT_DIR = './app/protected';

const files = fs.readdirSync(SCREENS_DIR).filter(f => f.endsWith('.html'));

function toCamelCase(str) {
  return str.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
}

function processHtml(html) {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) return '';
  let content = bodyMatch[1];

  content = content.replace(/\bclass="/g, 'className="');
  content = content.replace(/\bfor="/g, 'htmlFor="');

  const svgAttrs = ['stroke-width', 'stroke-linecap', 'stroke-linejoin', 'fill-rule', 'clip-rule', 'clip-path', 'fill-opacity'];
  svgAttrs.forEach(attr => {
    const camel = toCamelCase(attr);
    const regex = new RegExp(`\\b${attr}="`, 'g');
    content = content.replace(regex, `${camel}="`);
  });

  content = content.replace(/<(img|input|br|hr)([^>]*?)(?:\/)?>/g, '<$1$2 />');
  content = content.replace(/\/\s*\/>/g, '/>');

  content = content.replace(/style="([^"]*)"/g, (match, p1) => {
    let styles = [];
    p1.split(';').forEach(rule => {
      const firstColon = rule.indexOf(':');
      if (firstColon > 0) {
        const key = rule.substring(0, firstColon).trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
        let val = rule.substring(firstColon + 1).trim();
        styles.push(`${key}: \`${val}\``);
      }
    });
    return `style={{${styles.join(', ')}}}`;
  });

  // Convert raw JSON strings properly inside JS curly braces
  content = content.replace(/style=\{'(.+?)'\}/g, 'style={$1}');

  content = content.replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}');

  return content;
}

files.forEach(file => {
  const html = fs.readFileSync(path.join(SCREENS_DIR, file), 'utf-8');
  let jsx = processHtml(html);
  
  let routeName = file.replace(/^\d+_/, '').replace('.html', '').replace(/_/g, '-');
  
  const componentContent = `export default function ${routeName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}() {
  return (
    <>
      ${jsx}
    </>
  );
}`;

  const targetDir = path.join(OUT_DIR, routeName);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(targetDir, 'page.tsx'), componentContent);
  console.log(`Generated ${targetDir}/page.tsx`);
});
