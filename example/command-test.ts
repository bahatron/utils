import { randomUUID } from "crypto";
import { ns } from "express-http-context";
import { Logger } from "../lib/logger";
import { RunInContext } from "../src/helpers";

RunInContext(
    async () => {
        let logger = Logger({ id: () => ns.get("testy") });
        logger.info(`hello`);
        logger.info(`bye`);
    },
    { testy: `tasty:${process.pid}:${randomUUID()}` }
);
