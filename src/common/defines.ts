import Path from "path";

export const dataFileName = "data.json";
export const posterFileName = "Poster.jpg";

export const appId = "bgm12835d9fe466616a5";
export const appSecret = "f8ff78be428a0642fd0008649394d963";

export const dev = process.env.NODE_ENV !== 'production'

export const secret = process.env.COOKIE_SECRET ?? "MZhjsZgzleZWiwYhPKwCsj5afQHiBFKd";
export const enableHttps = process.env.ENABLE_HTTPS === "true";

export const dbPath = dev ? "output" : "/database";
export const scanPath = dev ? ".data" : "/anime";

export const dbFile = Path.join(dbPath, "index.db");
export const watchFile = Path.join(dbPath, "watch.db");

export const imagesDir = Path.join(dbPath, "images");
