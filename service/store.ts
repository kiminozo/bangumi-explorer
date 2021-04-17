import { Item } from "./bangumi";
import fs from "fs";
import Path from "path";
import FlexSearch, { Index } from "flexsearch";
//import jieba from 'nodejieba';
import { Segment } from 'segment';

const dataFileName = "data.json";
const dev = process.env.NODE_ENV !== 'production'
const dbPath = dev ? "output" : "database";
const dbFile = Path.join(dbPath, "index.db");

const segment = new Segment();
segment.useDefault();

const index = FlexSearch.create<StoreItem>({
    profile: "memory",
    cache: true,
    doc: {
        id: "id",
        field: ["name", "name_cn", "summary"]
    },
    tokenize: (words) => {
        const res = segment.doSegment(words).map(r => r.w);
        // console.log(res);
        return res;
    },
});

export interface StoreInfo extends Item {
    path?: string;
    disk?: string;
    symbol?: string;
}

export type StoreItem = Item & StoreInfo;

export function imagePath(id: string | number): string {
    return Path.resolve(dbPath, "images", id + ".jpg")
}

async function scan(path: string, deep: number): Promise<string[]> {
    let stack = await fs.promises.readdir(path);
    stack = stack.map(p => Path.join(path, p))
        .filter(p => fs.lstatSync(p).isDirectory());
    for (let i = 0; i < deep; i++) {
        let dirs = [...stack];
        stack.splice(0, stack.length);
        for (const child of dirs) {
            let tmp = await fs.promises.readdir(child);
            tmp.map(p => Path.join(child, p))
                .filter(p => fs.lstatSync(p).isDirectory())
                .forEach(p => stack.push(p));
        }
    }
    return stack;
}

async function readData(path: string): Promise<StoreItem | null> {
    try {
        const data = await fs.promises.readFile(Path.join(path, dataFileName), 'utf-8');
        const item: StoreItem = JSON.parse(data);
        item.path = path;

        await fs.promises.copyFile(Path.join(path, 'Poster.jpg'), imagePath(item.id))
        return item;
    } catch (error) {
        console.error(error);
        return null;
    }

}





async function read(path: string, deep: number) {
    const dirs = await scan(path, deep);
    // console.log(dirs);
    const resList = await Promise.all(dirs.map(dir => readData(dir)))
    const res = resList.filter(p => p != null).map(p => p!);
    res.forEach(item => {
        index.add(item);
        // console.log(decodeURI(item.name_cn))
    });
    // console.log(index.search("GRANBELM"));
}


async function writeFile() {
    //await read(Path.join('/Volumes/anime', '新番'), 1);
    await read(Path.join('.data', '新番'), 1);
    const data = index.export();
    await fs.promises.writeFile(dbFile, data, 'utf-8');
}

async function test() {
    const data = await fs.promises.readFile(dbFile, 'utf-8')
    index.import(data);

    const res = await index.search("在", {
        field: ["name_cn"],
    });
    console.log(res.map(p => p.name_cn));

}

export function indexStore(): Index<StoreItem> {
    return index;
}

export async function importData() {
    const data = await fs.promises.readFile(dbFile, 'utf-8')
    index.import(data);
}

// export class IndexStore {
//     init = false;

//     constructor() {

//     }

//     async Init() {
//         if (!this.init) {
//             this.init = true;
//             const data = await fs.promises.readFile(dbFile, 'utf-8')
//             index.import(data);
//         }
//     }

//     async Search(key: string): Promise<StoreItem[]> {
//         const res = await index.search(key, {
//             field: ["name_cn", "name"],
//             bool: 'or',
//             limit: 12
//         });
//         return res;
//     }

//     async Load(range?: string): Promise<StoreItem[]> {
//         return index.where(item => inRange(item.air_date, range));
//     }

//     getImagePath(id: string): string {
//         return Path.resolve(imagePath(id))
//     }
// }

//writeFile();

//test();