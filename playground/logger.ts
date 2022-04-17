import { Logger } from "@bahatron/utils";
import axios from "axios";
import pino from "pino";
import cheerio from "cheerio";

const { argv: yargs } = require("yargs");

const CONTEXT = [
    {
        rick: "c-137",
        foo: ["bar", "baz"],
    },
];

// const CONTEXT = null;

const pinoLogger = pino({
    // name: "testy",
    formatters: {
        level: (label) => ({
            level: label,
        }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    // prettyPrint: true,
});

const bhtLogger = Logger.Logger({
    pretty: true,
    // id: () => "testy",
    // id: "testy",
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
        pinoLogger.info(CONTEXT, "hello");
    }
    let end = new Date().valueOf() - start.valueOf();

    console.log(end);
}

function bhtLoggerBench() {
    let start = new Date();
    for (let i = 0; i < 1000000; i++) {
        bhtLogger.info(CONTEXT, "hello");
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

function separator(msg: string = "") {
    console.log(`=`.repeat(80));
    console.log(msg);
    console.log(`=`.repeat(80));
}

function functionPrint() {
    pinoLogger.info({ func: functionPrint }, "a function in pino");
    separator();
    bhtLogger.info({ func: functionPrint }, "a function in bht");
}

function helloWorld() {
    let context = {
        hello: "world",
        c137: {
            rick: "sanchez",
            morty: "smith",
        },
        foo: ["man", "choo"],
        life: 43,
        bar: [
            {
                hi: "there",
            },
        ],
    };

    pinoLogger.info(context, "pino logger");
    console.log();
    bhtLogger.info(context, "bht logger");
}

if (yargs.bht) {
    bhtLoggerBench();
} else if (yargs.pino) {
    pinoLoggerBench();
} else if (yargs.axiosError) {
    axiosError();
} else if (yargs.bigObject) {
    bigObject();
} else if (yargs.func) {
    functionPrint();
} else if (yargs.noContext) {
    Array(10)
        .fill(null)
        .map(() => {
            bhtLogger.info(`logging a message with no context`);
        });

    bhtLogger.info({ foo: "bar" }, "I'm a rogue context");

    Array(10)
        .fill(null)
        .map(() => {
            bhtLogger.info(`logging a message with no context`);
        });
} else {
    helloWorld();
}
