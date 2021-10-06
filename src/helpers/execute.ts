import { RunInContext } from "../context/index";

export function execute(
    handler: () => void,
    defaultContext: Record<string, string> = {}
) {
    RunInContext(async () => {
        try {
            await handler();
            process.exit(0);
        } catch (err) {
            console.error(err);
            process.exit(1);
        }
    }, defaultContext);
}
