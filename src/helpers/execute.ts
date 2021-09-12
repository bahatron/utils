import { RunInContext } from "../context/index";

export function execute(
    handler: () => void,
    defaultContext: Record<string, string> = {}
) {
    RunInContext(async () => {
        await handler();
        process.exit(0);
    }, defaultContext);
}
