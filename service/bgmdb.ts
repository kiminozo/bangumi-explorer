import * as fs from "fs"
import Path = require('path');
import low = require('lowdb');
import FileSync = require('lowdb/adapters/FileSync')
import FileAsync = require('lowdb/adapters/FileAsync')

const dev = process.env.NODE_ENV !== 'production'
const dbPath = dev ? "output" : "database";

export type WatchType = 'collect' | 'wish' | 'do' | 'on_hold' | 'dropped'

export interface WatchInfo {
    id: number;
    title: string;
    type: WatchType;
}

export interface UserInfo {
    id: number;
    name: string;
    watchs: WatchInfo[];
}

export interface WatchDB {
    users: UserInfo[];
}

export default class BangumiDB {
    db: low.LowdbAsync<WatchDB> | null = null;

    constructor() {
    }

    async prepare() {
        const adapter = new FileAsync<WatchDB>(Path.join(dbPath, `watch.db`))
        this.db = await low(adapter);
    }

    save(infoList: WatchInfo[]) {
        // this.db.set('info', infoList).write();
    }

    get(user: string | number, id: number): WatchInfo | null {
        if (this.db === null) {
            return null;
        }
        let query = typeof user === 'string' ? { name: user } : { id: user }
        const item = this.db.get("users").find(query)
            .get('watchs').find({ id }).value();
        return item;
    }

    getAll(user: string | number): WatchInfo[] {
        if (this.db === null) {
            return [];
        }
        let query = typeof user === 'string' ? { name: user } : { id: user }
        const items = this.db.get("users").find(query)
            .get('watchs').value();
        return items;
    }

}
// const info2 = db.get('info')
//     .filter(p => p.type === 'collect')
//     .get('dataList')
//     .value()
// const db = new BangumiDB("kiminozo");
// console.log(db.get(183957));
//test();

