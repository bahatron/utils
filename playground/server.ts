import { Logger } from "@bahatron/utils/logger";
import { app } from "./app";
import { AsyncContext, RunInContext } from "@bahatron/utils/context";

const CONTEXT = "context";

const logger = Logger({
    id: () => AsyncContext.get(CONTEXT),
});

async function sayHello() {
    logger.info(`hello!`);
}

async function main() {
    RunInContext(
        async () => {
            await sayHello();

            app.listen(3000, () => {
                logger.info(`express server running`);
            });
        },
        {
            [CONTEXT]: "utils playground",
        },
    );
}

main();
