import express from "express";
import next from 'next'
import { IndexStore } from "./store";

//const app = express();
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler();
const index = new IndexStore();

const server = express();

async function run() {
    await app.prepare();
    server.get('/anime/:key', async (req, res) => {
        const key = req.params.key;
        if (!key) {
            res.send({ items: [] });
            return;
        }
        const items = await index.Search(req.params.key);
        //console.log("Search:" + req.params.key);
        res.send({ items: items });
    })
    server.get('*', (req, res) => {
        return handle(req, res)
    })
    server.listen(3000);
}

run();
