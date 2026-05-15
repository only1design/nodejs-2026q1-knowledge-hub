import { ConsoleLogger, ConsoleLoggerOptions, LogLevel } from '@nestjs/common';
import {
  existsSync,
  mkdirSync,
  statSync,
  renameSync,
  appendFileSync,
} from 'node:fs';
import { join } from 'node:path';

export interface FileRotationLoggerOptions extends ConsoleLoggerOptions {
  maxFileSizeKB?: number;
  logDir?: string;
}

export class FileRotationLogger extends ConsoleLogger {
  private readonly logDir: string;
  private readonly logFilePath: string;
  private readonly maxBytes: number;

  constructor(options: FileRotationLoggerOptions = {}) {
    super(options);

    this.logDir = options.logDir ?? 'logs';
    this.maxBytes = (options.maxFileSizeKB ?? 1024) * 1024;

    if (!existsSync(this.logDir)) {
      mkdirSync(this.logDir, { recursive: true });
    }

    this.logFilePath = join(this.logDir, 'app.log');
  }

  protected printMessages(
    messages: unknown[],
    context?: string,
    logLevel?: LogLevel,
    writeStreamType?: 'stdout' | 'stderr',
    errorStack?: unknown,
  ) {
    super.printMessages(
      messages,
      context,
      logLevel,
      writeStreamType,
      errorStack,
    );

    const timestamp = new Date().toISOString();
    for (const message of messages) {
      const line =
        JSON.stringify({
          level: logLevel ?? 'log',
          message,
          context,
          timestamp,
          pid: process.pid,
        }) + '\n';

      this.writeToFile(line);
    }
  }

  private writeToFile(line: string) {
    this.rotateIfNeeded();
    appendFileSync(this.logFilePath, line);
  }

  private rotateIfNeeded() {
    if (!existsSync(this.logFilePath)) return;

    const { size } = statSync(this.logFilePath);
    if (size < this.maxBytes) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    renameSync(this.logFilePath, join(this.logDir, `app-${timestamp}.log`));
  }
}
