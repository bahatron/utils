import { Logger, Timer } from "@bahatron/utils";
import axios from "axios";
import pino from "pino";
import cheerio from "cheerio";

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

const bhtLogger = Logger.Logger({
    // pretty: true,
    // id: () => "testy",
    id: "testy",
    // timestamp: () => new Date().valueOf(),
});

function axiosError() {
    axios({
        url: "/err",
        method: "POST",
        data: {
            rick: "c-137",
        },
    }).catch((err) => {
        separator("bht logger");
        bhtLogger.error(err);
        separator("pino logger");
        pinoLogger.error(err);
    });
}

function pinoLoggerBench() {
    let start = new Date();
    for (let i = 0; i < 1000000; i++) {
        pinoLogger.info({ rick: "c-137" }, "hello");
    }
    let end = new Date().valueOf() - start.valueOf();

    console.log(end);
}

function bhtLoggerBench() {
    let start = new Date();
    for (let i = 0; i < 1000000; i++) {
        bhtLogger.info({ rick: "c-137" }, "hello");
    }

    let end = new Date().valueOf() - start.valueOf();

    console.log(end);
}

function bigObject() {
    let _parsed = cheerio.load(require("./fixture"));

    let _html = _parsed(".tmJOVKTrHAB4bLpcMjzQ");

    separator("bht logger");
    bhtLogger.info(_html);
    separator("pino logger");
    pinoLogger.info(_html);
}

function separator(msg) {
    console.log(`=`.repeat(80));
    console.log(msg);
    console.log(`=`.repeat(80));
}

async function stopWatchTest() {
    let watch = Timer.StopWatch();

    let counter = 0;
    while (counter < 3) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        watch.addLap(`round:${counter + 1}`);
        counter += 1;
    }

    console.log(watch.getLaps());
}

if (yargs.bht) {
    bhtLoggerBench();
} else if (yargs.pino) {
    pinoLoggerBench();
} else if (yargs.axiosError) {
    axiosError();
} else if (yargs.bigObject) {
    bigObject();
} else if (yargs.timer) {
    stopWatchTest();
} else {
    console.error(`Valid params: bht | pino | axiosError | bigObject`);
}
