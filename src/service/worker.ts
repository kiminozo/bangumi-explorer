import { Socket } from "socket.io"
import { LogMessage, Log } from "../common/message";
import { parseUserWatchInfo } from "./bgmtv";

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// export async function testRun(socket: Socket, data: string) {
//     console.log("receive:" + data);
//     for (let i = 0; i <= 100; i += 10) {
//         if (socket.connected) {
//             socket.emit('message', (message: LogMessage) => {
//                 socket.emit('message', message);
//             });
//         } else {
//             break;
//         }
//         await sleep(500);
//     }
// }

export async function doParseUserWatchInfo(socket: Socket, data: { userId: number }) {
    console.log("receive:" + data);
    await parseUserWatchInfo(data.userId, "", true, (message: LogMessage) => {
        socket.emit('message', message);
        console.debug("send message" + JSON.stringify(message))
    });
}