import logger from "../logger";
import { RunInContext } from "../context/index";

export function execute(handler: () => void) {
    RunInContext(() =>
        Promise.resolve(handler()).then(() => {
            process.exit(0);
        })
    );
}
