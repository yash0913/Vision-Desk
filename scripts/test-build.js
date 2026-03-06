const fs = require('fs');
const path = require('path');

console.log('🧪 Testing build configuration...\n');

// Test 1: Check if required directories exist
console.log('📁 Checking directories...');
const requiredDirs = [
    'scripts',
    'build-resources/agent',
    'assets',
    'dist'
];

requiredDirs.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (fs.existsSync(dirPath)) {
        console.log(`✅ ${dir} exists`);
    } else {
        console.log(`❌ ${dir} missing`);
    }
});

// Test 2: Check if required files exist
console.log('\n📄 Checking files...');
const requiredFiles = [
    'main.js',
    'package.json',
    'scripts/download-agent.js',
    'scripts/agent-logger.js',
    'scripts/installer.nsh',
    'LICENSE.txt'
];

requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} exists`);
    } else {
        console.log(`❌ ${file} missing`);
    }
});

// Test 3: Check package.json configuration
console.log('\n📦 Checking package.json configuration...');
const packageJson = require('../package.json');

const checks = [
    { name: 'prebuild script', check: packageJson.scripts && packageJson.scripts.prebuild },
    { name: 'dist script', check: packageJson.scripts && packageJson.scripts.dist },
    { name: 'electron-builder dependency', check: packageJson.devDependencies && packageJson.devDependencies['electron-builder'] },
    { name: 'build configuration', check: packageJson.build },
    { name: 'extraResources configuration', check: packageJson.build && packageJson.build.extraResources },
    { name: 'NSIS configuration', check: packageJson.build && packageJson.build.nsis }
];

checks.forEach(({ name, check }) => {
    if (check) {
        console.log(`✅ ${name} configured`);
    } else {
        console.log(`❌ ${name} missing`);
    }
});

// Test 4: Check if mock agent exists
console.log('\n🤖 Checking agent...');
const agentPath = path.join(__dirname, '..', 'build-resources', 'agent', 'DeskLinkAgent.exe');
if (fs.existsSync(agentPath)) {
    console.log('✅ Mock agent exists');
} else {
    console.log('❌ Agent missing - download script will need to fetch from GitHub');
}

// Test 5: Check main.js imports
console.log('\n🔧 Checking main.js configuration...');
const mainJs = fs.readFileSync(path.join(__dirname, '..', 'main.js'), 'utf8');
const mainChecks = [
    { name: 'AgentLogger import', check: mainJs.includes('require(\'./scripts/agent-logger\')') },
    { name: 'Agent spawning', check: mainJs.includes('spawn(agentPath') },
    { name: 'Process management', check: mainJs.includes('agentProcess.kill') },
    { name: 'Logging integration', check: mainJs.includes('logger.') },
    { name: 'System tray', check: mainJs.includes('createTray') }
];

mainChecks.forEach(({ name, check }) => {
    if (check) {
        console.log(`✅ ${name} implemented`);
    } else {
        console.log(`❌ ${name} missing`);
    }
});

console.log('\n🎯 Build test complete!');
console.log('\n📋 Next steps:');
console.log('1. Run: npm run dist');
console.log('2. Test the installer');
console.log('3. Verify agent integration');
console.log('4. Check system tray functionality');
