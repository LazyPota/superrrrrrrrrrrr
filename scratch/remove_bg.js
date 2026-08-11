const fs = require('fs');
const path = require('path');
const jpeg = require('jpeg-js');
const { PNG } = require('pngjs');

const inputPath = 'C:\\Users\\Salman\\.gemini\\antigravity\\brain\\c2f8bfbd-4c01-411e-837f-140da2d66578\\.user_uploaded\\media_1786437543952.jpg';
const outputPath = 'C:\\Users\\Salman\\presumart\\public\\logo.png';

const jpegData = fs.readFileSync(inputPath);
const rawImageData = jpeg.decode(jpegData, { useTolerantUnknown: true });

const width = rawImageData.width;
const height = rawImageData.height;
const data = rawImageData.data; // RGBA uint8 array

const png = new PNG({ width, height });

// Create visited array for floodfill
const visited = new Uint8Array(width * height);
const queue = [];

function isDarkBackground(r, g, b) {
  // Check if pixel is dark background (RGB sum < 75 or all channels < 35)
  return (r < 40 && g < 40 && b < 40);
}

// Seed floodfill from outer border pixels
for (let x = 0; x < width; x++) {
  queue.push(x, 0);
  queue.push(x, height - 1);
}
for (let y = 0; y < height; y++) {
  queue.push(0, y);
  queue.push(width - 1, y);
}

let head = 0;
while (head < queue.length) {
  const x = queue[head++];
  const y = queue[head++];
  const idx = y * width + x;

  if (visited[idx]) continue;
  visited[idx] = 1;

  const pixIdx = (y * width + x) * 4;
  const r = data[pixIdx];
  const g = data[pixIdx + 1];
  const b = data[pixIdx + 2];

  if (isDarkBackground(r, g, b)) {
    // Mark as background pixel
    data[pixIdx + 3] = 0; // Alpha 0 (transparent)

    // Add 4-connected neighbors
    if (x > 0 && !visited[y * width + (x - 1)]) queue.push(x - 1, y);
    if (x < width - 1 && !visited[y * width + (x + 1)]) queue.push(x + 1, y);
    if (y > 0 && !visited[(y - 1) * width + x]) queue.push(x, y - 1);
    if (y < height - 1 && !visited[(y + 1) * width + x]) queue.push(x, y + 1);
  }
}

// Copy modified RGBA data to PNG
for (let i = 0; i < data.length; i++) {
  png.data[i] = data[i];
}

png.pack()
  .pipe(fs.createWriteStream(outputPath))
  .on('finish', () => {
    console.log('Transparent PNG created successfully at ' + outputPath);
    
    // Also copy to icon-192.png and icon-512.png
    fs.copyFileSync(outputPath, 'C:\\Users\\Salman\\presumart\\public\\icon-192.png');
    fs.copyFileSync(outputPath, 'C:\\Users\\Salman\\presumart\\public\\icon-512.png');
    fs.copyFileSync(outputPath, 'C:\\Users\\Salman\\presumart\\public\\logo.jpg');
    console.log('Copied to all icon locations.');
  });
