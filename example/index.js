const { Logger } = require("../lib/logger/index");
// import { Logger } from "../lib/logger";
const pino = require("pino");
const cheerio = require("cheerio");
const moment = require("moment");
const { stringify } = require("../lib/json/index");
const { default: axios } = require("axios");

const pinoLogger = pino({
    formatters: {
        log: (log) => {
            console.log({ log });
            return log;
        },
    },
});

pinoLogger.info({ msg: "sanchez" }, `pino says hi`);
const logger = Logger({
    pretty: false,
    // formatter: stringify,
});

let _parsed = cheerio.load(require("./fixture"));

let _html = _parsed(".tmJOVKTrHAB4bLpcMjzQ");

// console.log(Object.entries(_html));
// console.log(`=`.repeat(100));
// console.log(
//     JSON.stringify(_html, function replacer(key, value) {
//         console.log({
//             this: this,
//             value,
//             key,
//             isTheSame: value === this,
//             hasValueOwnProp: this.hasOwnProp(value),
//             hasKeyOwnProp: this.hasOwnProp(key),
//         });
//         return value;
//     })
// );

axios({
    url: "/err",
    method: "POST",
}).catch((err) => pinoLogger.error(err));

axios({
    url: "/err",
    method: "POST",
}).catch(logger.error);

// pinoLogger.info(_html);

// let startPino = moment();
// for (let i = 0; i < 1000000; i++) {
//     pinoLogger.info("hello");
// }

// let pinoLap = moment().diff(startPino, "milliseconds", true);

// let startBht = moment();
// for (let i = 0; i < 1000000; i++) {
//     logger.info("hello");
// }

// let bhtLap = moment().diff(startBht, "milliseconds", true);

// console.log({
//     pino: pinoLap,
//     bht: bhtLap,
// });
