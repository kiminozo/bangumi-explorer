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


async function diff() {
    await importData();
    await db.prepare();

    const items = db.getAll("kiminozo");
    // const recent = new Date();
    // recent.setMonth(recent.getMonth() - 24);

    const stores = index.where(item => item.id !== 0);
    const ids = stores.map(item => item.id);
    const set = new Set(ids);
    const diff = items.filter(item => !set.has(item.id));
    console.log(diff.length);

    diff.forEach(item => console.log(`${item.title}`));
}

diff();