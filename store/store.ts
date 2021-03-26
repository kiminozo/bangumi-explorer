import { Item } from "./bangumi";
import fs from "fs";
import Path from "path";
import FlexSearch from "flexsearch";

interface StoreItem extends Item {
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

// async function read(path: string, deep: number) {
//     const dirs = await scan(path, deep);
//     console.log(dirs);
//     const resList = await Promise.all(dirs.map(dir => readData(dir)))
//     const res = resList.filter(p => p != null).map(p => p!);
//     res.forEach(item => {
//         index.addDoc(item);
//         console.log(decodeURI(item.name_cn))
//     });
//     console.log(index.search("GRANBELM"));
// }

//read(Path.join(, 1);
const index = FlexSearch.create<StoreItem>({
    doc: {
        id: "id",
        field: ["name", "name_cn"]
    },
    tokenize: (words) => {
        return [];
    }
});

async function test() {
    const item = await readData(Path.join('.data', '新番', '2019-01', '在世界尽头咏唱恋曲的少女YU-NO'));
    const items: StoreItem[] = [];

    if (item) {
        console.log(decodeURI(item.name_cn))
        index.add(item);
    }
    const res = await index.search("在")
    console.log(res);
}

test();