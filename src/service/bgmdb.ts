import Path from "path";
import low from 'lowdb';
import FileAsync from 'lowdb/adapters/FileAsync'
import { WatchInfo, UserWatchInfo } from '../common/watch';


const dev = process.env.NODE_ENV !== 'production'
const dbPath = dev ? "output" : "database";



export interface WatchDB {
    users: UserWatchInfo[];
}

export default class BangumiDB {
    db: low.LowdbAsync<WatchDB> | null = null;

    constructor() {
    }

    async prepare() {
        const adapter = new FileAsync<WatchDB>(Path.join(dbPath, `watch.db`))
        this.db = await low(adapter);
        this.db.defaults({ users: [] }).write();
    }

    private update(infos: WatchInfo[]) {

    }

    async save(userWatchInfo: UserWatchInfo) {

        if (this.db === null) {
            console.log("db === null");
            return null;
        }
        let query = { id: userWatchInfo.id }
        const userCount = this.db.get('users').size().value();
        const index = this.db.get('users').findIndex(query).value();
        console.log("user-index:" + index);
        if (index < 0) {
            console.log("new-user:" + userWatchInfo.id);

            await this.db.get('users').push(userWatchInfo).write();
        } else {
            console.log("update-user:" + userWatchInfo.id);
            //await this.db.get('users').find(query).assign(userWatchInfo).write();
            const watchDB = this.db.get('users').find(query).get('watches');
            for (const watch of userWatchInfo.watches) {
                const item = watchDB.find({ id: watch.id });
                if (item.value()) {
                    console.log("assign:" + watch.title);
                    await item.assign(watch).write();
                } else {
                    console.log("push:" + watch.title);
                    await watchDB.push(watch).write();
                }
            }
            await watchDB.write()
        }
        // this.db.set('info', infoList).write();
    }

    get(user: string | number, id: number): WatchInfo | null {
        if (this.db === null) {
            return null;
        }
        let query = typeof user === 'string' ? { name: user } : { id: user }
        const item = this.db.get("users").find(query)
            .get('watches').find({ id }).value();
        return item;
    }

    getAll(user: string | number): WatchInfo[] {
        if (this.db === null) {
            return [];
        }
        let query = typeof user === 'string' ? { name: user } : { id: user }
        const items = this.db.get("users").find(query)
            .get('watches').value();
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

