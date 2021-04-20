import { Socket } from "socket.io"
import { WorkerMessage } from "../common/message";

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function testRun(socket: Socket, data: string) {
    console.log("receive:" + data);
    for (let i = 0; i <= 100; i += 10) {
        if (socket.connected) {
            const msg: WorkerMessage = { percent: i, message: "progress" + i }
            socket.emit('message', msg);
        } else {
            break;
        }
        await sleep(500);
    }
}