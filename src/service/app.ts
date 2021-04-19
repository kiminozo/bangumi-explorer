import express from "express";
import next from 'next'
import { Server } from "socket.io"
import { createServer } from 'http';
import cookieParser from 'cookie-parser';

import { AccessToken } from "../common/bangumi";
import Controller from "./controller";

const dev = process.env.NODE_ENV !== 'production'
const secret = process.env.COOKIE_SECRET ?? "MZhjsZgzleZWiwYhPKwCsj5afQHiBFKd";


const nextApp = next({ dev })
const handle = nextApp.getRequestHandler();
const port = process.env.PORT || 3000;


const app = express();
const server = createServer(app);
const io = new Server(server);

const controller = new Controller();

app.use(cookieParser(secret));

io.of("test").on('connection', socket => {
    console.log('A user connected');
    socket.on('message', (data: string) => {
        console.log("receive:" + data);
        socket.emit('message', "I got it");
    });
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
})

io.attach(server);


app.get('/anime/', async (req, res) => {
    const items = await controller.load(undefined, req.cookies.userId);
    res.send({ items: items });
});
app.get('/anime/r=:range', async (req, res) => {
    const range = req.params.range;
    if (!range) {
        res.send({ items: [] });
        return;
    }
    //console.log("range:" + range);
    const items = await controller.load(range, req.cookies.userId);
    res.send({ items: items });
});
app.get('/anime/:key', async (req, res) => {
    const key = req.params.key;
    if (!key) {
        res.send({ items: [] });
        return;
    }
    const items = await controller.search(key, req.cookies.userId);
    //console.log("Search:" + req.params.key);
    res.send({ items: items });
});
app.get('/images/:id', async (req, res) => {
    const id = req.params.id;
    if (!id) {
        res.status(404);
        return;
    }
    res.sendFile(controller.getImagePath(id));
})

app.get('/callback', async (req, res) => {
    const { code, state } = req.query;
    console.log("code:" + code);
    if (!code) {
        res.status(404);
        return;
    }
    const redirect_uri = 'http://' + req.get('host') + "/callback";
    let token = await controller.callback(redirect_uri, code.toString(), state?.toString());
    res.cookie("userId", token?.user_id);
    res.cookie("token", token, { signed: true });
    await handle(req, res);
});

app.get('*', async (req, res) => {
    await handle(req, res)
});

async function run() {
    try {
        await nextApp.prepare();
        await controller.prepare();

        server.listen(port, () => {
            console.log(`> Ready on localhost:${port} - env ${process.env.NODE_ENV}`);
        });
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
