import { Static } from "@sinclair/typebox";
import { JsonSchema, Logger } from "../src";
import express from "express";
import { Observable } from "../src/observable";

const logger = Logger.Create();

const app = express();

app.get(`/`, async (req, res) => {
    logger.info("ping");

    res.json("pong");
});

app.listen(3000, () => {
    logger.info("hello world");
});

let observer = Observable<"foo" | "bar", number>();

observer.emit("foo", 42);

observer.on("bar", () => {
    logger.info("bar event triggered");
});
