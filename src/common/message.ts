export interface WorkerMessage {
    percent: number;
    message: string;
    complete?: boolean;
}