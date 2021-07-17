const { Logger } = require("../lib/logger");
const pino = require("pino");
const cheerio = require("cheerio");
const moment = require("moment");
const { stringify } = require("../lib/json/index");
const { default: axios } = require("axios");
const fastStringify = require("fast-safe-stringify");
const { argv: yargs } = require("yargs");

const pinoLogger = pino({
    name: "testy",
    formatters: {
        level: (label) => ({
            level: label,
        }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
});

const bhtLogger = Logger({
    pretty: true,
    id: () => "testy",
});

function axiosError() {
    axios({
        url: "/err",
        method: "POST",
        data: {
            rick: "c-137",
        },
    }).catch(bhtLogger.error);
}

function pinoLoggerBench() {
    let startPino = moment();
    for (let i = 0; i < 1000000; i++) {
        pinoLogger.info({ rick: "c-137" }, "hello");
    }
    let result = moment().diff(startPino, "milliseconds", true);

    console.log(result);
}

function bhtLoggerBench() {
    let startBht = moment();
    for (let i = 0; i < 1000000; i++) {
        bhtLogger.info({ rick: "c-137" }, "hello");
    }

    let result = moment().diff(startBht, "milliseconds", true);

    console.log(result);
}

function recursiveTest() {
    let _parsed = cheerio.load(require("./fixture"));

    let _html = _parsed(".tmJOVKTrHAB4bLpcMjzQ");

    bhtLogger.info(_html);
    pinoLogger.info(_html);
}

if (yargs.bhtBench) {
    bhtLoggerBench();
} else if (yargs.pinoBench) {
    pinoLoggerBench();
} else if (yargs.axiosError) {
    axiosError();
} else if (yargs.recursiveTest) {
    recursiveTest();
} else {
    console.error(
        `Valid params: bhtBench | pinoBench | axiosError | recursiveTest`
    );
}
