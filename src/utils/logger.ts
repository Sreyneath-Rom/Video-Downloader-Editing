import { LogEntry } from '../types';

type LogListener = (logs: LogEntry[]) => void;

class LoggerService {
  private logs: LogEntry[] = [];
  private listeners: Set<LogListener> = new Set();

  constructor() {
    this.addLog('info', 'System initialized. Media Tools Pro Web & Desktop Suite ready.', 'System');
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public addLog(level: 'info' | 'success' | 'warn' | 'error', message: string, source: string = 'General') {
    const newEntry: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
      source
    };
    this.logs = [newEntry, ...this.logs.slice(0, 499)]; // Keep latest 500 logs
    this.notify();
  }

  public clearLogs() {
    this.logs = [];
    this.addLog('info', 'Activity logs cleared by user.', 'System');
  }

  public subscribe(listener: LogListener): () => void {
    this.listeners.add(listener);
    listener(this.getLogs());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const current = this.getLogs();
    this.listeners.forEach((listener) => listener(current));
  }
}

export const logger = new LoggerService();
