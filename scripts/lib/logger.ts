/**
 * Logger for Google Places API CLI tool
 *
 * Logs operations to console and file
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  data?: any;
}

export class Logger {
  private logFilePath: string;
  private logs: LogEntry[] = [];

  constructor() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    this.logFilePath = path.join(process.cwd(), 'logs', `scrape-${timestamp}.log`);

    // Ensure logs directory exists
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  private log(level: LogEntry['level'], message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };

    this.logs.push(entry);

    // Console output with colors
    const timestamp = chalk.gray(entry.timestamp);
    let levelStr = '';
    let coloredMessage = message;

    switch (level) {
      case 'info':
        levelStr = chalk.blue('[INFO]');
        break;
      case 'success':
        levelStr = chalk.green('[SUCCESS]');
        coloredMessage = chalk.green(message);
        break;
      case 'warning':
        levelStr = chalk.yellow('[WARNING]');
        coloredMessage = chalk.yellow(message);
        break;
      case 'error':
        levelStr = chalk.red('[ERROR]');
        coloredMessage = chalk.red(message);
        break;
    }

    console.log(`${timestamp} ${levelStr} ${coloredMessage}`);
    if (data) {
      console.log(chalk.gray(JSON.stringify(data, null, 2)));
    }
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  success(message: string, data?: any) {
    this.log('success', message, data);
  }

  warning(message: string, data?: any) {
    this.log('warning', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  /**
   * Save logs to file
   */
  async save() {
    const logContent = this.logs.map(entry => {
      const dataStr = entry.data ? ` ${JSON.stringify(entry.data)}` : '';
      return `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}${dataStr}`;
    }).join('\n');

    await fs.promises.writeFile(this.logFilePath, logContent, 'utf-8');
    console.log(chalk.gray(`\nLog saved to: ${this.logFilePath}`));
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    const summary = {
      total: this.logs.length,
      info: this.logs.filter(l => l.level === 'info').length,
      success: this.logs.filter(l => l.level === 'success').length,
      warning: this.logs.filter(l => l.level === 'warning').length,
      error: this.logs.filter(l => l.level === 'error').length,
    };
    return summary;
  }

  /**
   * Print summary
   */
  printSummary() {
    const summary = this.getSummary();
    console.log('\n' + chalk.bold('=== Summary ==='));
    console.log(`Total operations: ${summary.total}`);
    console.log(chalk.green(`Success: ${summary.success}`));
    console.log(chalk.yellow(`Warning: ${summary.warning}`));
    console.log(chalk.red(`Error: ${summary.error}`));
  }

  /**
   * Get log file path
   */
  getLogFilePath(): string {
    return this.logFilePath;
  }
}
