const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const AGENT_DOWNLOAD_URL = 'https://github.com/yash0913/anydesk/releases/download/agent/DeskLinkAgent.exe';
const AGENT_FILENAME = 'DeskLinkAgent.exe';
const BUILD_RESOURCES_DIR = path.join(__dirname, '..', 'build-resources', 'agent');

async function downloadAgent() {
    console.log('🔄 Starting agent download...');
    
    try {
        // Ensure build-resources directory exists
        if (!fs.existsSync(BUILD_RESOURCES_DIR)) {
            fs.mkdirSync(BUILD_RESOURCES_DIR, { recursive: true });
            console.log(`✅ Created directory: ${BUILD_RESOURCES_DIR}`);
        }

        // Download the agent directly
        console.log(`📦 Downloading agent from: ${AGENT_DOWNLOAD_URL}`);
        const agentPath = path.join(BUILD_RESOURCES_DIR, AGENT_FILENAME);
        await downloadFile(AGENT_DOWNLOAD_URL, agentPath);
        
        console.log(`✅ Agent downloaded successfully to: ${agentPath}`);
        console.log(`📊 File size: ${formatBytes(fs.statSync(agentPath).size)}`);
        
        return agentPath;
        
    } catch (error) {
        console.warn(`⚠️  Could not download agent: ${error.message}`);
        console.log('');
        console.log('📋 AGENT DOWNLOAD INSTRUCTIONS:');
        console.log('1. Create a GitHub repository: yash0913/anydesk');
        console.log('2. Create a release with tag: agent');
        console.log('3. Upload DeskLinkAgent.exe to that release');
        console.log('4. Or update AGENT_DOWNLOAD_URL in this script to the correct URL');
        console.log('');
        console.log('🔄 Using mock agent for development/testing...');
        
        // Create mock agent for development
        const mockAgentPath = path.join(BUILD_RESOURCES_DIR, AGENT_FILENAME);
        const mockAgentContent = `@echo off
title DeskLink Agent
echo Mock DeskLink Agent for testing
echo This is a placeholder agent that simulates the real agent
echo Agent started successfully
echo Listening for connections...
:loop
timeout /t 5 /nobreak >nul
echo Agent running...
goto loop`;
        
        fs.writeFileSync(mockAgentPath, mockAgentContent);
        console.log(`✅ Mock agent created at: ${mockAgentPath}`);
        
        return mockAgentPath;
    }
}

function downloadFile(url, destinationPath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destinationPath);
        
        const request = https.get(url, (res) => {
            // Handle redirects
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                console.log(`🔄 Following redirect to: ${res.headers.location}`);
                return downloadFile(res.headers.location, destinationPath)
                    .then(resolve)
                    .catch(reject);
            }
            
            if (res.statusCode !== 200) {
                reject(new Error(`Download failed with status ${res.statusCode}`));
                return;
            }
            
            let downloadedSize = 0;
            
            res.on('data', (chunk) => {
                downloadedSize += chunk.length;
                process.stdout.write(`\r⬇️  Downloaded: ${formatBytes(downloadedSize)}`);
            });
            
            res.pipe(file);
            
            file.on('finish', () => {
                console.log('\n✅ Download completed');
                file.close(resolve);
            });
            
            file.on('error', (error) => {
                fs.unlink(destinationPath, () => {}); // Delete partial file
                reject(error);
            });
        });
        
        request.on('error', (error) => {
            reject(error);
        });
    });
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Run the download
if (require.main === module) {
    downloadAgent();
}

module.exports = { downloadAgent };
