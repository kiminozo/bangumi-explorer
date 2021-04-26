import { Item } from "../common/bangumi";
import fs from "fs";
import Path from "path";
import FlexSearch, { Index } from "flexsearch";
//import jieba from 'nodejieba';
import { Segment } from 'segment';
import { StoreItem } from "../common/watch";
import { dataFileName, dbFile, imagesDir, posterFileName, scanPath } from "../common/defines";



const percentOf = (current: number, sum: number) => Math.ceil(current * 100 / sum);


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



export function imagePath(id: string | number): string {
    return Path.resolve(imagesDir, id + ".jpg")
}


async function match(root: string): Promise<string[]> {
    const result: string[] = [];
    const stack: string[] = [];
    stack.push(root);

    while (stack.length > 0) {
        let child = stack.shift() as string;
        let files = await fs.promises.readdir(child);
        files.filter(p => dataFileName === p)
            .forEach(p => result.push(child));

        files.map(p => Path.join(child, p))
            .filter(p => fs.lstatSync(p).isDirectory())
            .forEach(p => stack.push(p));
    }
    return result;
}

async function readData(path: string): Promise<StoreItem | null> {
    try {
        const data = await fs.promises.readFile(Path.join(path, dataFileName), 'utf-8');
        const item: StoreItem = JSON.parse(data);
        item.path = path;

        await fs.promises.copyFile(Path.join(path, posterFileName), imagePath(item.id))
        return item;
    } catch (error) {
        console.error(error);
        return null;
    }

}



interface Progress {
    (progress: number, path: string): void
}

async function findAll(path: string, progress?: Progress) {
    const dirs = await match(path);
    const length = dirs.length;
    //  console.debug(dirs);
    for (let i = 0; i < length; i++) {
        const dir = dirs[i];
        const item = await readData(dir);
        if (progress) {
            progress(percentOf(i, length), dir);
        }
        if (item) {
            if (index.where(p => p.id === item.id).length > 0) {
                index.update(item.id, item);
                console.debug("update:" + item.name);
            } else {
                index.add(item);
                console.debug("add:" + item.name);
            }
        }

    }

}


export async function scanFiles(progress?: Progress) {
    await findAll(scanPath, progress);
    const data = index.export();
    await fs.promises.writeFile(dbFile, data, 'utf-8');
    if (progress) {
        progress(100, "保存索引文件");
    }
}

// async function test() {
//     const data = await fs.promises.readFile(dbFile, 'utf-8')
//     index.import(data);

//     const res = await index.search("在", {
//         field: ["name_cn"],
//     });
//     console.log(res.map(p => p.name_cn));

// }

export function indexStore(): Index<StoreItem> {
    return index;
}

export async function importData() {
    try {
        const data = await fs.promises.readFile(dbFile, 'utf-8')
        index.import(data);
    } catch (error) {

    }
    try {
        await fs.promises.mkdir(imagesDir, { recursive: true })
    } catch (error) {

    }
}
