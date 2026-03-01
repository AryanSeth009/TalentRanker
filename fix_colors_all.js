const fs = require('fs');
const path = require('path');

const filePaths = [
  'd:/TalentRanker/app/about/page.tsx'
];

const replacements = {
    '>About TalentRanker.ai<': ' className="gradient-text">About TalentRanker.ai<',
};

filePaths.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [key, value] of Object.entries(replacements)) {
      content = content.split(key).join(value);
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Successfully replaced colors in ${path.basename(filePath)}`);
  }
});
