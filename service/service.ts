import express from "express";
import session from 'express-session'
import next from 'next'
import { accessToken, AccessToken } from "./bangumi";
import { IndexStore } from "./store";

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler();
const index = new IndexStore();
const port = process.env.PORT || 3000;


const server = express();
server.use(session({
    secret: 'grant-xxxx',
    resave: true,
    saveUninitialized: true
}))

declare module 'express-session' {
    interface SessionData {
        token: AccessToken;
        test: string;
    }
}

async function run() {
    try {
        await app.prepare();
        server.get('/callback', async (req, res) => {
            const { code, state } = req.query;
            console.log("code:" + code);
            //res.send(code);
            if (!code) {
                res.status(404);
                return;
            }
            const redirect_uri = req.protocol + '://' + req.get('host') + "/callback";
            let token = await accessToken(redirect_uri, code.toString(), state?.toString());
            req.session.token = token ?? undefined;
            return handle(req, res);
        });
        server.get('/anime/:key', async (req, res) => {
            const key = req.params.key;
            if (!key) {
                res.send({ items: [] });
                return;
            }
            const items = await index.Search(req.params.key);
            //console.log("Search:" + req.params.key);
            res.send({ items: items });
        });
        server.get('/images/:id', async (req, res) => {
            const id = req.params.id;
            if (!id) {
                res.status(404);
                return;
            }
            res.sendFile(index.getImagePath(id));
        })
        server.get('*', (req, res) => {
            req.session.test = "Hello world 2020";
            return handle(req, res)
        });
        server.listen(port, () => {
            console.log(`> Ready on localhost:${port} - env ${process.env.NODE_ENV}`);
        });
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
