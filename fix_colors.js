const fs = require('fs');
const path = require('path');

const filePath = 'd:/TalentRanker/app/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const replacements = {
    'bg-white': 'bg-card',
    'bg-slate-50': 'bg-background',
    'bg-gray-50': 'bg-muted/50 text-foreground',
    'text-gray-900': 'text-foreground',
    'text-gray-800': 'text-foreground/90',
    'text-gray-700': 'text-foreground/80',
    'text-gray-600': 'text-muted-foreground',
    'text-gray-500': 'text-muted-foreground/80',
    'border-gray-200': 'border-border',
    'border-gray-300': 'border-border',
    'bg-blue-50': 'bg-primary/5',
    'border-blue-300': 'border-primary/30',
    'hover:border-blue-400': 'hover:border-primary/50',
    'text-blue-600': 'text-primary',
    '>AI Resume Analyzer<': ' className="gradient-text">AI Resume Analyzer<',
    'bg-green-100': 'bg-emerald-500/20',
    'text-green-800': 'text-emerald-500',
    'border-green-200': 'border-emerald-500/30',
    'bg-orange-100': 'bg-orange-500/20',
    'text-orange-800': 'text-orange-500',
    'border-orange-200': 'border-orange-500/30',
    'bg-red-100': 'bg-destructive/20',
    'text-red-800': 'text-destructive',
    'border-red-200': 'border-destructive/30',
    '<Card className="shadow-lg border-0">': '<Card className="glass-card shadow-lg border-0 bg-transparent relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">',
    'className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg"': 'className="bg-gradient-to-r from-primary/80 to-blue-600/80 backdrop-blur-md text-white border-b border-border/10 relative z-10"',
    'className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg"': 'className="bg-gradient-to-r from-emerald-500/80 to-emerald-700/80 backdrop-blur-md text-white border-b border-border/10 relative z-10"',
    'className="bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-t-lg"': 'className="bg-gradient-to-r from-orange-500/80 to-red-600/80 backdrop-blur-md text-white border-b border-border/10 relative z-10"',
};

for (const [key, value] of Object.entries(replacements)) {
    content = content.split(key).join(value);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully replaced colors in page.tsx');
