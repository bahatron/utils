import { Logger } from ".";

const LOGGER_TEST_PAYLOAD = {
    foo: "bar",
    "c-137": [
        "rick",
        "morty",
        {
            summer: "sister",
            jerry: "dad",
            beth: ["mother", "clone"],
        },
    ],
};

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
            _logger.info(function doSomething() {}, "info");
        });
    });

    it("pretty warning", async () => {
        return new Promise((resolve) => {
            _logger.on("warning", () => {
                resolve();
            });
            _logger.warning(["rick", "sanchez", "c-137"], "warning");
        });
    });

    it("pretty error", async () => {
        return new Promise((resolve) => {
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
    let logger = Logger({ formatter: JSON.stringify });

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
    it("no pretty", () => {
        let noPretty = Logger({
            id: "no_pretty_inspect",
        });

        noPretty.inspect({
            mode: "no pretty print",
            ...LOGGER_TEST_PAYLOAD,
        });
    });

    it("pretty", () => {
        let pretty = Logger({
            pretty: true,
            id: "pretty_inspect",
        });

        pretty.inspect({
            mode: "yes pretty print",
            ...LOGGER_TEST_PAYLOAD,
        });
    });
});

describe("nested context building", () => {
    it("parses nested object keys into format", () => {
        let logger = Logger({
            pretty: true,
            id: "nested context parsing",
        });

        function funcWithName() {
            return `this is a function`;
        }

        logger.info(
            {
                ...LOGGER_TEST_PAYLOAD,
                err: new Error(),
                array: ["hello", new Error("error inside array")],
                banana: "pijama",
                nulleo: null,
                undefo: undefined,
                func: () => `this is a function`,
                funcWithName,
            },
            "lorem ipsum"
        );

        logger.info(funcWithName, "nameo");

        logger.warning("no context no problem");
    });
});
