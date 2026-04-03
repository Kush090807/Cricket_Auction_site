
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'public', 'images');
const outputFile = path.join(__dirname, 'imageMap.ts');

const files = fs.readdirSync(imagesDir);
const map = {};

files.forEach(file => {
    if (!file.match(/\.(jpg|jpeg|png|gif)$/i)) return;

    // Logic: "Prefix - Name.jpg" -> "Name"
    const parts = file.split(' - ');
    if (parts.length > 1) {
        const namePart = parts[parts.length - 1]; // Take the last part
        const name = namePart.replace(/\.[^/.]+$/, "").trim(); // Remove extension

        // Normalize key to lowercase for easier matching
        map[name.toLowerCase()] = `/images/${file}`;

        // Also try to map "Name Surname" 
        console.log(`Mapped: "${name}" -> "${file}"`);
    }
});

const content = `// Auto-generated map of Player Name -> Image Path
export const IMAGE_MAP: Record<string, string> = ${JSON.stringify(map, null, 2)};
`;

fs.writeFileSync(outputFile, content);
console.log('Image map generated at imageMap.ts');
