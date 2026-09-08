const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(file => {
  if (file.includes('env.ts')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('https://ns-jewellery.onrender.com')) {
    content = content.replace(/'https:\/\/ns-jewellery\.onrender\.com\/api/g, '`${ENV.API_URL}');
    content = content.replace(/`https:\/\/ns-jewellery\.onrender\.com\/api/g, '`${ENV.API_URL}');
    content = content.replace(/'https:\/\/ns-jewellery\.onrender\.com/g, '`${ENV.BASE_URL}');
    content = content.replace(/https:\/\/ns-jewellery\.onrender\.com/g, '${ENV.BASE_URL}');
    
    // Convert fetch('`${ENV.API_URL}/rates`') to fetch(`${ENV.API_URL}/rates`)
    content = content.replace(/'\$\{ENV\.API_URL\}/g, '`${ENV.API_URL}');
    content = content.replace(/'\$\{ENV\.BASE_URL\}/g, '`${ENV.BASE_URL}');
    
    let depth = file.split(path.sep).length - 2;
    // file is like src\screens\main\HomeScreen.tsx
    // split by sep: src, screens, main, HomeScreen.tsx
    // depth for HomeScreen: 4 parts. 4 - 2 = 2. '../'.repeat(2) -> '../../config/env'
    let relPath = depth === 0 ? './config/env' : '../'.repeat(depth) + 'config/env';
    
    if (!content.includes('import { ENV }')) {
       const lines = content.split('\n');
       let lastImportIdx = 0;
       for(let i=0; i<lines.length; i++) {
         if(lines[i].startsWith('import ')) lastImportIdx = i;
       }
       lines.splice(lastImportIdx + 1, 0, `import { ENV } from '${relPath}';`);
       content = lines.join('\n');
    }
    
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});
