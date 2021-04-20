export type LogType = 'log' | 'warn' | 'error'

export interface LogMessage {
    type: LogType;
    percent: number;
    message: string;
    complete?: boolean;
}

export interface Log {
    (message: LogMessage): void;
}