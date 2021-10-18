import { Logger } from "../src/logger";

const LOGGER_TEST_PAYLOAD = {
    foo: "bar",
    "c-137": [
        "rick",
        "morty",
        {
            summer: "sister",
            jerry: "useless",
            beth: ["mother", "clone"],
        },
    ],
    number: 123,
    nulleo: null,
    undefo: undefined,
    bool: true,
    err: new Error(),
    array: ["hello", new Error("error inside array")],
    banana: "pijama",
    func: () => `this is a function`,
};

describe("pretty print", () => {
    const _logger = Logger({ pretty: true });

    it("pretty debug", async () => {
        return new Promise<void>((resolve) => {
            _logger.on("debug", () => {
                resolve();
            });
            _logger.debug({ foo: "bar" }, "debug");
        });
    });

    it("pretty info", async () => {
        return new Promise<void>((resolve) => {
            _logger.on("info", () => {
                resolve();
            });
            _logger.info(function doSomething() {}, "info");
        });
    });

    it("pretty warning", async () => {
        return new Promise<void>((resolve) => {
            _logger.on("warning", () => {
                resolve();
            });
            _logger.warning(["rick", "sanchez", "c-137"], "warning");
        });
    });

    it("pretty error", async () => {
        return new Promise<void>((resolve) => {
            _logger.on("error", () => {
                resolve();
            });
            _logger.error({ error: "error" }, "error");
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
    let logger = Logger();

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

describe("inspect", () => {
    let logger = Logger({
        pretty: true,
        id: "inspect_logger",
    });

    it("inspects null", () => {
        logger.inspect(null);
    });

    it("inspects undefined", () => {
        logger.inspect(undefined);
    });

    it("inspects object", () => {
        logger.inspect(LOGGER_TEST_PAYLOAD);
    });

    it("inspects primitive", () => {
        logger.inspect("hello there");
    });

    it("inspects array", () => {
        logger.inspect([1, 2, "3"]);
    });
});

describe("nested context building", () => {
    it("parses nested object keys into format", () => {
        let logger = Logger({
            pretty: true,
            id: "nested context parsing",
        });

        logger.info(
            {
                ...LOGGER_TEST_PAYLOAD,
            },
            "lorem ipsum"
        );

        logger.info(function funcWithName() {
            return `this is a function`;
        }, "function with name");

        logger.info(() => "nameless function", "nameless function");

        logger.warning("no context no problem");

        logger.error(null, "a null");
    });
});
