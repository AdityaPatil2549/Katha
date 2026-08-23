const fs = require('fs');
let code = fs.readFileSync('roadmap.js', 'utf8');

if (!code.includes('pageBreakBefore: level === 1')) {
    code = code.replace(
        'spacing: spacing[level],',
        'spacing: spacing[level],\n        pageBreakBefore: level === 1,'
    );
}

code = code.replace(/,\s*pageBreak\(\)/g, '');

fs.writeFileSync('roadmap.js', code);
