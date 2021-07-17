import logger from "../logger";

export function execute(handler: () => void) {
    Promise.resolve(handler())
        .then(() => process.exit())
        .catch((err) => {
            logger.error(err);
            process.exit(1);
        });
}
