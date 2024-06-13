import { Logger } from "../src";
import { ValidationFailed } from "../src/error";

async function main() {
    let logger = Logger.Create({
        minLogLevel: Logger.LOGGER_LEVEL.DEBUG,
        pretty: false,
        formatter:
            process.env.NODE_ENV !== "production"
                ? Logger.Formatters.Pretty
                : undefined,
    });
}

main();
