import { Logger } from "../src";
import express from "express";

const logger = Logger.Create();

const app = express();

app.get(`/`, async (req, res) => {
    logger.info("ping");

    res.json("pong");
});

app.listen(3000, () => {
    logger.info("hello world");
});
