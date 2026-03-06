const fs = require('fs');
const path = require('path');

class AgentLogger {
  constructor() {
    this.logDir = path.join(process.env.APPDATA || path.join(process.env.HOME, 'AppData', 'Roaming'), 'DeskLinkAgent', 'logs');
    this.logFile = path.join(this.logDir, 'agent.log');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  writeLog(level, message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${message}\n`;
    
    try {
      fs.appendFileSync(this.logFile, logEntry);
    } catch (error) {
      console.error(`Failed to write to agent log: ${error.message}`);
    }
  }

  info(message) {
    this.writeLog('INFO', message);
    console.log(`[Agent] ${message}`);
  }

  error(message) {
    this.writeLog('ERROR', message);
    console.error(`[Agent] ${message}`);
  }

  warn(message) {
    this.writeLog('WARN', message);
    console.warn(`[Agent] ${message}`);
  }

  debug(message) {
    this.writeLog('DEBUG', message);
    console.debug(`[Agent] ${message}`);
  }

  getLogPath() {
    return this.logFile;
  }

  getLogDir() {
    return this.logDir;
  }
}

module.exports = AgentLogger;
