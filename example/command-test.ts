import { randomUUID } from "crypto";
import { ns } from "express-http-context";
import { Logger } from "../lib/logger";
import { execute } from "../src/helpers";

const REQUEST_ID = "requestId";

execute(async () => {
    ns.set(REQUEST_ID, `requestId:${randomUUID()}`);

    let logger = Logger({ id: () => ns.get(REQUEST_ID) });

    logger.info(`harro`);
});
