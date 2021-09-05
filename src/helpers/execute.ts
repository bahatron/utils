import { ObjectBag } from "../../lib/types";
import { RunInContext } from "../context/index";

export function execute(
    handler: () => void,
    defaultContext: ObjectBag<string> = {}
) {
    RunInContext(async () => {
        await handler();
        process.exit(0);
    }, Object.entries(defaultContext));
}
