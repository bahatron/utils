import { RunInContext } from "../context/index";

export function execute(handler: () => void, context?: [string, string][]) {
    RunInContext(async () => {
        await handler();
        process.exit(0);
    }, context);
}
