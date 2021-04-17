import { Index } from "flexsearch";
import { AccessToken, accessToken } from "./bangumi";
import { imagePath, importData, indexStore, StoreItem } from "./store";
import Path from "path";
import BangumiDB, { WatchInfo, WatchType } from "./bgmdb";

export interface UserItem {
    watchType?: WatchType;
}

export type BgmItem = UserItem & StoreItem;

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

    async load(range?: string, user?: number | string): Promise<BgmItem[]> {
        return index.where(item => inRange(item.air_date, range))
            .map(item => this.watchState(item, user));
    }

    async search(key: string, user?: number | string): Promise<BgmItem[]> {
        const res = await index.search(key, {
            field: ["name_cn", "name"],
            bool: 'or',
            limit: 12
        });
        return res.map(item => this.watchState(item, user));
    }

    getImagePath(id: string): string {
        return Path.resolve(imagePath(id))
    }
}