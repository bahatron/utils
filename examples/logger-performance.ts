import { Logger } from "@bahatron/utils";
import { jsonStringify } from "@bahatron/utils/lib/helpers/json-stringify";

let logger = Logger.Create({
    formatter: (entry) => {
        return jsonStringify({
            ...entry,
            timestamp: entry.timestamp.valueOf(),
        });
    },
    // formatter: jsonStringify,
    // formatter: (entry) => {
    //     return [1, 2, 3];
    // },
});

let start = new Date();

for (let i = 0; i < 100_000; i++) {
    logger.info(`Log entry number ${i}`);
}

console.log(
    "==========================",
    "Logging 100,000 entries took",
    new Date().getTime() - start.getTime(),
    "ms",
);
