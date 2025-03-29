const fs = require('fs');
const { createCanvas } = require('canvas');

// Function to create a bookmark icon
function createIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#2196f3';
    ctx.fillRect(0, 0, size, size);

    // Bookmark shape
    ctx.fillStyle = '#ffffff';
    const padding = size * 0.2;
    const width = size - (padding * 2);
    const height = size - (padding * 2);
    
    // Draw bookmark shape
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding + width, padding);
    ctx.lineTo(padding + width, padding + height);
    ctx.lineTo(size/2, padding + height * 0.7);
    ctx.lineTo(padding, padding + height);
    ctx.closePath();
    ctx.fill();

    return canvas.toBuffer('image/png');
}

// Create icons of different sizes
[16, 48, 128].forEach(size => {
    const buffer = createIcon(size);
    fs.writeFileSync(`icons/icon${size}.png`, buffer);
    console.log(`Created icon${size}.png`);
}); 