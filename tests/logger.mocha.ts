import { Logger } from "../src/logger";
import { axiosError } from "./fixtures/axios_error";

describe("logger", () => {
    it("can set logger id", () => {
        const logger = Logger({
            debug: false,
            id: "my_awesome_id",
            formatter: (params) => {
                return `${params.level} id: ${params.id} - message: ${params.message}`;
            },
        });

        logger.info("testing id change");

        let newLogger = logger.id("my_awesome_changed_id");

        newLogger.info("testing id change id changed");
    });
});

describe("pretty print", () => {
    const _logger = Logger({ pretty: true });

    it("pretty debug", async () => {
        return new Promise((resolve) => {
            _logger.on("debug", () => {
                resolve();
            });
            _logger.debug({ foo: "bar" }, "debug");
        });
    });

    it("pretty info", async () => {
        return new Promise((resolve) => {
            _logger.on("info", () => {
                resolve();
            });
            _logger.info({ foo: "bar" }, "info");
        });
    });

    it("pretty warning", async () => {
        return new Promise((resolve) => {
            _logger.on("warning", () => {
                resolve();
            });
            _logger.warning({ foo: "bar" }, "warning");
        });
    });

    it("pretty error", async () => {
        return new Promise((resolve) => {
            _logger.on("error", () => {
                resolve();
            });
            _logger.error(axiosError, "error");
        });
    });
});

describe("immutable loggers", () => {
    const _logger = Logger({
        debug: false,
        id: "immb21",
    });

    it("calls all event handlers attached from any event", async () => {
        return new Promise(async (resolve) => {
            const loggerA = _logger.id("loggerA");
            const loggerB = _logger.id("loggerB");
            const loggerC = _logger.id("loggerC");

            Promise.all(
                [loggerA, loggerB, loggerC, _logger].map(
                    (logger) =>
                        new Promise(async (resolve) => {
                            let levels = ["info", "warning", "error"] as const;

                            resolve(
                                await Promise.all(
                                    levels.map(
                                        (level) =>
                                            new Promise(async (_resolve) => {
                                                logger.on(level, (event) => {
                                                    _resolve(event);
                                                });
                                            })
                                    )
                                )
                            );
                        })
                )
            ).then(<any>resolve);

            loggerA.info("info");
            loggerB.warning("warning");
            loggerC.error(new Error("123"), "error");
        });
    });
});

describe("no pretty settings", () => {
    let _logger = Logger({ pretty: false, id: "[no colours]" });

    it("does not display colours", () => {
        let payload = [{ rick: "sanchez" }, "hello"] as const;

        _logger.debug(...payload);
    });
});

describe("error logging", () => {
    let logger = Logger({ pretty: false, formatter: JSON.stringify });
    it("formats axios error", () => {
        logger.error(axiosError, "axios error test");
    });

    it("formats normal errors", () => {
        logger.error(new TypeError("an error"), "Error instance");
    });

    it("formats generic context", () => {
        logger.error(
            {
                morty: { rick: "sanchez" },
                req_id: "c-137",
            },
            "generic"
        );
    });
});
