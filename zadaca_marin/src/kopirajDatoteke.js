import { promises as fs } from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const srcDir = path.join(__dirname, '..', 'src');
const buildDir = path.join(__dirname, '..', 'build');
const patterns = [
    '**/*.html',
    '**/*.css',
    '**/*.jpg',
    '**/*.js'
];

async function copyFiles() {
    async function getAllFiles(dir, baseDir = dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        let files = [];
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative(baseDir, fullPath);
            
            if (entry.isDirectory()) {
                const subFiles = await getAllFiles(fullPath, baseDir);
                files = files.concat(subFiles);
            } else {
                files.push({ fullPath, relativePath });
            }
        }
        
        return files;
    }
    
    function matchesPattern(filePath, patterns) {
        for (const pattern of patterns) {
            const regexPattern = pattern
                .replace(/\*\*/g, '.*')
                .replace(/\*/g, '[^/]*')
                .replace(/\./g, '\\.');
            const regex = new RegExp('^' + regexPattern + '$');
            if (regex.test(filePath)) {
                return true;
            }
        }
        return false;
    }
    
    const allFiles = await getAllFiles(srcDir);
    
    for (const file of allFiles) {
        if (matchesPattern(file.relativePath, patterns)) {
            const parts = file.relativePath.split(path.sep);
            if (parts.length > 1) {
                parts.shift();
            }
            const destRelativePath = parts.join(path.sep);
            const destPath = path.join(buildDir, destRelativePath);
            const destDir = path.dirname(destPath);
            
            await fs.mkdir(destDir, { recursive: true });
            await fs.copyFile(file.fullPath, destPath);
        }
    }
}

copyFiles().catch(console.error);

