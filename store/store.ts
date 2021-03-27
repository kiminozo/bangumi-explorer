import { Item } from "./bangumi";
import fs from "fs";
import Path from "path";
import FlexSearch from "flexsearch";
//import jieba from 'nodejieba';
import { Segment } from 'segment';

const segment = new Segment();
segment.useDefault();

export interface StoreItem extends Item {
    path?: string;
    disk?: string;
    symbol?: string;
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
const dataFileName = "data.json";

async function readData(path: string): Promise<StoreItem | null> {
    try {
        const data = await fs.promises.readFile(Path.join(path, dataFileName), 'utf-8');
        const item: StoreItem = JSON.parse(data);
        item.path = path;
        return item;
    } catch (error) {
        console.error(error);
        return null;
    }

}


const index = FlexSearch.create<StoreItem>({
    doc: {
        id: "id",
        field: ["name", "name_cn", "summary"]
    },
    tokenize: (words) => {
        const res = segment.doSegment(words).map(r => r.w);
        // console.log(res);
        return res;
    }
});


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

const dbFile = Path.join("output", "index.db");

async function writeFile() {
    await read(Path.join('/Volumes/anime', '新番'), 1);
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

export class IndexStore {
    init = false;

    constructor() {

    }

    async Search(key: string): Promise<StoreItem[]> {
        if (!this.init) {
            this.init = true;
            const data = await fs.promises.readFile(dbFile, 'utf-8')
            index.import(data);
        }
        // const res = await index.search(key, {
        //     field: ["name_cn"],
        // });
        const res = index.where(item => item.name === key);
        return res;
    }
}

//writeFile();

//test();