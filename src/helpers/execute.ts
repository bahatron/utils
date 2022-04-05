import { RunInContext } from "../async-context/run-in-context";

export function execute(
    handler: () => void,
    context: Record<string, string> = {}
) {
    RunInContext(async () => {
        try {
            await handler();
            process.exit(0);
        } catch (err) {
            console.error(err);
            process.exit(1);
        }
    }, context);
}
