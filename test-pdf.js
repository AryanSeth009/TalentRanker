const fs = require('fs');
const pdfParse = require('pdf-parse');
const buffer = fs.readFileSync('./Resume.pdf'); // <-- use a real PDF path
pdfParse(buffer).then(data => console.log(data.text));