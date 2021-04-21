import superagent from 'superagent';
import cheerio from 'cheerio';
import { UserWatchInfo, WatchInfo, WatchType } from '../common/watch';
import { Log } from '../common/message';

const sumReduce = (pre: number, curr: number) => pre + curr;
const getPageCount = (count: number, recent?: boolean) => {
    const maxPage = recent ? 3 : Number.MAX_VALUE;
    return Math.min(count / 24 + 1, maxPage)
}
const percentOf = (current: number, sum: number) => Math.ceil(current * 100 / sum);

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function agent(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        superagent.get(url)
            .end((err, docs) => {
                if (err) {
                    return reject(err);
                }
                // 成功解析
                resolve(docs.text);
            })
    })
}


async function getWatch(user: string | number, type: WatchType, page: number): Promise<WatchInfo[]> {
    const url = `http://bgm.tv/anime/list/${user}/${type}?page=${page}`;
    console.log(url);
    let html = await agent(url);
    const subStart = '/subject/'.length;
    const $ = cheerio.load(html);
    const dataList: WatchInfo[] = [];
    $("#browserItemList h3 a").each((_index, ele) => {
        const item = $(ele);
        if (item == null) {
            return;
        }
        //  console.log(item.text());
        const href = item.attr()['href'];
        const id = parseInt(href.substring(subStart, href.length));
        // const data: WatchInfo = { id, title: item.text(), type };
        // console.log(data);
        dataList.push({ id, title: item.text(), type });
    });
    //console.debug(dataList.length);
    //$("",item)
    return dataList;
}
const regex = /(\S+)\s{1}\((\d+)\)/;

function getWatchType(typeCN: string): WatchType {
    switch (typeCN) {
        case '想看':
            return 'wish';
        case '在看':
            return 'do';
        case '搁置':
            return 'on_hold';
        case '抛弃':
            return 'dropped';
        default:
            return 'collect'
    }
}

export async function parseUserWatchInfo(userId: number, userName: string, recent?: boolean, log?: Log)
    : Promise<UserWatchInfo> {
    const url = `http://bgm.tv/anime/list/${userId}`;
    console.log(url);
    let html = await agent(url);
    const $ = cheerio.load(html);
    const infoList: { type: WatchType, count: number }[] = [];
    $("ul.navSubTabs li a span").each((_index, ele) => {
        const item = $(ele);
        if (item == null) {
            return;
        }
        const text = item.text();
        const matches = regex.exec(text);
        if (matches) {
            const info = {
                type: getWatchType(matches[1]),
                count: parseInt(matches[2]),
            }
            infoList.push(info);
        }
        // console.log(info);
    });
    if (log) {
        log({
            type: "log",
            percent: 1,
            message: "获取账号信息"
        });
    }

    const dataListList: WatchInfo[][] = [];

    let progress = 0;
    const sum = infoList.map(p => getPageCount(p.count, recent)).reduce(sumReduce)
    for (const info of infoList) {
        const pageCount = getPageCount(info.count, recent);
        for (let page = 1; page <= pageCount; page++) {
            const data = await getWatch(userId, info.type, page);
            dataListList.push(data);
            progress++;

            if (log) {
                log({
                    type: "log",
                    percent: percentOf(progress, sum),
                    message: `正在更新${info.type}: 第${page}页`
                });
            }
            await sleep(200);
        }

    }
    const watches = dataListList.flat();
    return { id: userId, name: userName, watches };
    // const db = new BangumiDB();
    // try {
    //     await db.save({ id: userId, name: userName, watches });
    //     console.log("db saved");
    //     if (log) {
    //         log({
    //             type: "log",
    //             percent: 100,
    //             message: "保存数据",
    //             complete: true
    //         });
    //     }
    // } catch (error) {
    //     if (log) {
    //         log({
    //             type: "error",
    //             percent: 100,
    //             message: error.message,
    //             complete: true
    //         });
    //     }
    // }

}
//parseUserWatchInfo("kiminozo");



// const info2 = db.get('info')
//     .filter(p => p.type === 'collect')
//     .get('dataList')
//     .value()
// console.log(info2);