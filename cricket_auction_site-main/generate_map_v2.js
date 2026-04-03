
const fs = require('fs');
const path = require('path');

console.log('Current directory:', process.cwd());

const imagesDir = path.join(process.cwd(), 'public', 'images');
const outputFile = path.join(process.cwd(), 'imageMap.ts');

if (!fs.existsSync(imagesDir)) {
    console.error('Images directory not found:', imagesDir);
    process.exit(1);
}

const files = fs.readdirSync(imagesDir);
console.log(`Found ${files.length} files.`);

const map = {};

files.forEach(file => {
    if (!file.match(/\.(jpg|jpeg|png|gif|heic|webp)$/i)) return;

    // Logic: "Prefix - Name.jpg" -> "Name"
    const parts = file.split(' - ');
    if (parts.length > 1) {
        const namePart = parts[parts.length - 1]; // Take the last part
        const name = namePart.replace(/\.[^/.]+$/, "").trim(); // Remove extension

        // Normalize key to lowercase for easier matching
        map[name.toLowerCase()] = `/images/${file}`;
    } else {
        // Fallback: try using the whole filename as name (minus extension)
        const name = file.replace(/\.[^/.]+$/, "").trim();
        map[name.toLowerCase()] = `/images/${file}`;
    }
});

const content = `// Auto-generated map of Player Name -> Image Path
export const IMAGE_MAP: Record<string, string> = ${JSON.stringify(map, null, 2)};
`;

fs.writeFileSync(outputFile, content);
console.log('Successfully generated imageMap.ts');
