import { AccessToken } from "../common/bangumi";
import { imagePath, importData, indexStore, scanFiles } from "./store";
import Path from "path";
import BangumiDB from "./bgmdb";
import { BgmItem, SearchResult, StoreItem, UserItem } from "../common/watch";
import { accessToken } from "./bgm-api";
import { parseUserWatchInfo } from "./bgmtv";
import { Socket } from "socket.io"
import { LogMessage } from "../common/message";



function inRange(air_date: string, range?: string) {
    if (!range) {
        return true;
    }
    const data = new Date(air_date);
    const ranges = range.split(" - ");
    if (ranges.length < 2) {
        return false;
    }
    const st = new Date(ranges[0]);
    const et = new Date(ranges[1]);
    et.setMonth(et.getMonth() + 1);
    return (data > st && data < et);
}

const index = indexStore();
const db = new BangumiDB();

export default class Controller {

    constructor() {
    }

    private watchState(item: StoreItem, user?: number | string): BgmItem {
        if (!item || !user) {
            return item;
        }
        const watchInfo = db.get(user, item.id);
        if (!watchInfo) {
            return item;
        }
        return Object.assign<UserItem, StoreItem>({ watchType: watchInfo.type }, item);
    }

    async prepare() {
        await importData();
        await db.prepare();
    }

    async callback(redirect_uri: string, code: string, state?: string): Promise<AccessToken | null> {
        return await accessToken(redirect_uri, code, state);
    }

    async load(range?: string, uid?: number): Promise<SearchResult> {
        return {
            uid,
            items: index.where(item => inRange(item.air_date, range))
                .map(item => this.watchState(item, uid))
        }
    }

    async search(key: string, uid?: number): Promise<SearchResult> {
        const res = await index.search(key, {
            field: ["name_cn", "name"],
            bool: 'or',
            limit: 12
        });
        return {
            uid,
            items: res.map(item => this.watchState(item, uid))
        }
    }

    getImagePath(id: string): string {
        return Path.resolve(imagePath(id))
    }

    async doParseUserWatchInfo(socket: Socket, data: { userId: number }, recent: boolean) {
        console.log("receive:" + data);
        const log = (message: LogMessage) => {
            socket.emit('message', message);
            console.debug("send message" + JSON.stringify(message))
        }
        try {
            const info = await parseUserWatchInfo(data.userId, "", recent, log);
            await db.save(info);
            console.log("db saved");

            log({
                type: "log",
                percent: 100,
                message: "保存数据",
                complete: true
            });
        } catch (error) {
            console.error(error);
            log({
                type: "error",
                percent: 100,
                message: error.message,
                complete: true
            });
        }
    }

    async scan(socket: Socket) {
        const log = (percent: number, path: string) => {
            socket.emit('message', {
                type: "log",
                percent: percent,
                message: path,
                complete: percent === 100
            });
        }
        await scanFiles(log);
    }
}