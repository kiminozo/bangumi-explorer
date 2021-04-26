import express from "express";
import next from 'next'
import { Server } from "socket.io"
import { createServer } from 'http';
import cookie from "cookie";
import cookieParser from 'cookie-parser';

import Controller from "./controller";
import { secret, dev, enableHttps } from "../common/defines";



const nextApp = next({ dev })
const handle = nextApp.getRequestHandler();
const port = process.env.PORT || 3000;


const app = express();
const server = createServer(app);
const io = new Server(server);

const controller = new Controller();

app.use(cookieParser(secret));

io.of("sync").on('connection', socket => {
    console.log('A user connected');

    const cookies = cookie.parse(socket.handshake.headers.cookie ?? "");
    const userId = parseInt(cookies['userId']);
    console.log("cookie:" + socket.handshake.headers.cookie);
    socket.on('task:sync-fast', () => {
        console.log('task:sync-fast u:' + userId);
        if (userId) {
            controller.doParseUserWatchInfo(socket, { userId }, true);
        }
    });
    socket.on('task:sync', () => {
        console.log('task:sync u:' + userId);
        if (userId) {
            controller.doParseUserWatchInfo(socket, { userId }, false);
        }
    });
    socket.on('task:cancel', () => {
        console.log('task:cancel');
    });
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
})

io.of("scan").on('connection', socket => {
    console.log('A user connected');
    socket.on('task:scan', () => {
        console.log('task:scan');
        controller.scan(socket);
    });
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
})

io.attach(server);


app.get('/anime/', async (req, res) => {
    const uid = parseInt(req.cookies.userId);
    const result = await controller.load(undefined, uid);
    res.send(result);
});
app.get('/anime/r=:range', async (req, res) => {
    const range = req.params.range;
    if (!range) {
        res.send({ items: [] });
        return;
    }
    console.log("range:" + range);
    const uid = parseInt(req.cookies.userId);
    console.log("uid:" + uid);
    const result = await controller.load(range, uid);
    res.send(result);
});
app.get('/anime/:key', async (req, res) => {
    const key = req.params.key;
    if (!key) {
        res.send({ items: [] });
        return;
    }
    const uid = parseInt(req.cookies.userId);
    const result = await controller.search(key, uid);
    //console.log("Search:" + req.params.key);
    res.send(result);
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
    const baseUrl = (enableHttps ? 'http://' : 'https://') + req.get('host');
    const redirect_uri = baseUrl + "/callback";
    console.log("redirect_uri:" + redirect_uri);
    let token = await controller.callback(redirect_uri, code.toString(), state?.toString());
    if (!token) {
        res.status(503);
        return;
    }
    res.cookie("userId", token.user_id);
    res.cookie("token", token, { signed: true });
    await handle(req, res)
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
