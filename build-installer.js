const fs = require('fs');
const path = require('path');

console.log('🚀 Building Windows Installer...');

// Check if dist directory exists
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
    console.error('❌ Dist directory not found. Run "npm run package-win" first.');
    process.exit(1);
}

// Find the Windows executable
const winDir = fs.readdirSync(distPath).find(dir => dir.includes('win32'));
if (!winDir) {
    console.error('❌ Windows package not found in dist directory.');
    process.exit(1);
}

const winPath = path.join(distPath, winDir);
console.log(`✅ Found Windows package at: ${winPath}`);

// Create a simple batch file for easy launching
const batchContent = `@echo off
cd /d "%~dp0"
"She Fashion House.exe"
pause
`;

const batchPath = path.join(distPath, 'Launch She Fashion House.bat');
fs.writeFileSync(batchPath, batchContent);
console.log(`✅ Created launcher batch file: ${batchPath}`);

// Create a README for the user
const readmeContent = `# She Fashion House - Booking System

## Installation Instructions

1. Extract all files from this folder to a location on your Windows computer
2. Double-click "She Fashion House.exe" to run the application
3. Or use "Launch She Fashion House.bat" for easier launching

## System Requirements

- Windows 10 or later
- No additional software installation required
- The application includes everything needed to run

## Features

- Customer booking management
- Payment tracking
- Search and filter functionality
- Export to CSV
- SQLite database (no external database required)

## Support

For support, contact the development team.

## Version: 1.0.0
`;

const readmePath = path.join(distPath, 'README.txt');
fs.writeFileSync(readmePath, readmeContent);
console.log(`✅ Created README file: ${readmePath}`);

console.log('\n🎉 Windows package ready!');
console.log(`📁 Package location: ${winPath}`);
console.log(`📦 Total size: ${getDirectorySize(winPath)} MB`);
console.log('\n📋 Next steps:');
console.log('1. Copy the entire folder to a Windows computer');
console.log('2. Run "She Fashion House.exe"');
console.log('3. The app will work immediately - no installation needed!');

function getDirectorySize(dirPath) {
    let totalSize = 0;
    
    function calculateSize(currentPath) {
        const items = fs.readdirSync(currentPath);
        for (const item of items) {
            const itemPath = path.join(currentPath, item);
            const stats = fs.statSync(itemPath);
            
            if (stats.isDirectory()) {
                calculateSize(itemPath);
            } else {
                totalSize += stats.size;
            }
        }
    }
    
    calculateSize(dirPath);
    return (totalSize / (1024 * 1024)).toFixed(1);
}
