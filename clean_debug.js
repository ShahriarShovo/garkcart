const fs = require('fs');
const path = require('path');

// Function to clean console statements from a file
function cleanConsoleStatements(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Remove console.log statements (but keep console.error for actual error handling)
        content = content.replace(/^\s*console\.log\([^;]*\);\s*$/gm, '');
        content = content.replace(/^\s*console\.log\([^;]*\)\s*$/gm, '');
        
        // Remove multi-line console.log statements
        content = content.replace(/console\.log\([^)]*\);\s*/g, '');
        
        // Remove debug comments
        content = content.replace(/\/\/.*DEBUG.*$/gm, '');
        content = content.replace(/\/\/.*debug.*$/gm, '');
        
        // Clean up empty lines
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        fs.writeFileSync(filePath, content);
        console.log(`Cleaned: ${filePath}`);
    } catch (error) {
        console.error(`Error cleaning ${filePath}:`, error.message);
    }
}

// Function to recursively find and clean all JS/JSX files
function cleanDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            cleanDirectory(filePath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            cleanConsoleStatements(filePath);
        }
    });
}

// Start cleaning from the src directory
const srcPath = path.join(__dirname, 'src');
if (fs.existsSync(srcPath)) {
    console.log('Starting to clean console statements from frontend...');
    cleanDirectory(srcPath);
    console.log('Console cleaning completed!');
} else {
    console.log('Source directory not found');
}
