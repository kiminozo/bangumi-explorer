import express from "express";
import { IndexStore } from "../store/store";
const app = express();
const index = new IndexStore();
app.get('/anime/:key', async (req, res) => {
    const items = await index.Search(req.params.key);
    console.log(req.params);
    res.send(items);
})

const server = app.listen(8081);

